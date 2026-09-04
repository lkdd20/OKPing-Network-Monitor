package org.dromara.ping.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.ping.config.PingProperties;
import org.dromara.ping.domain.PingNodeConfig;
import org.dromara.ping.domain.dto.PingWsMessageDto;
import org.dromara.ping.mapper.PingNodeConfigMapper;
import org.dromara.ping.service.IPingNodeDispatchService;
import org.dromara.ping.util.PingPingTargetFilter;
import org.dromara.ping.util.PingTcpingTargetFilter;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "ping.rabbit", name = "enabled", havingValue = "true", matchIfMissing = true)
public class PingNodeDispatchServiceImpl implements IPingNodeDispatchService {

    private static final String ENABLED_STATE = "on";

    private final RabbitTemplate rabbitTemplate;
    private final PingNodeConfigMapper nodeConfigMapper;
    private final ObjectMapper objectMapper;
    private final PingProperties pingProperties;

    @Override
    public void dispatch(PingWsMessageDto message) {
        JsonNode config = parseConfig(message.getConfig());
        String type = message.getType();
        if ("traceroute".equals(type) || "traceroute_v6".equals(type)) {
            dispatchTraceroute(message, config, "traceroute_v6".equals(type));
        } else if ("ping_v6".equals(type) || "tcping_v6".equals(type) || "http_v6".equals(type)) {
            dispatchByScreen(message, config, true);
        } else if ("batch_ping".equals(type)) {
            dispatchBatchPing(message, config);
        } else if ("batch_tcping".equals(type)) {
            dispatchBatchTcping(message, config);
        } else {
            dispatchByScreen(message, config, false);
        }
    }

    private void dispatchTraceroute(PingWsMessageDto message, JsonNode config, boolean ipv6Only) {
        long nodeId = config.path("node").asLong(0L);
        if (nodeId <= 0) {
            throw new IllegalArgumentException("请选择路由追踪节点");
        }
        PingNodeConfig node = nodeConfigMapper.selectById(nodeId);
        if (!isDispatchable(node)
            || !Boolean.TRUE.equals(node.getTraceroute())
            || (ipv6Only && !Boolean.TRUE.equals(node.getIpv6()))) {
            throw new IllegalArgumentException(ipv6Only
                ? "所选节点不支持IPv6路由追踪或当前不可用"
                : "所选节点不支持路由追踪或当前不可用");
        }
        sanitizeDispatchMessage(message);
        message.setModel("");
        message.setNumber(1);
        send(node, message);
    }

    private void dispatchByScreen(PingWsMessageDto message, JsonNode config, boolean ipv6Only) {
        LambdaQueryWrapper<PingNodeConfig> lqw = Wrappers.<PingNodeConfig>lambdaQuery()
            .eq(PingNodeConfig::getState, ENABLED_STATE)
            .eq(PingNodeConfig::getRqState, ENABLED_STATE)
            .ge(PingNodeConfig::getOnline, onlineCutoff());
        if (ipv6Only) {
            lqw.eq(PingNodeConfig::getIpv6, true);
        }
        addInCondition(lqw, PingNodeConfig::getRegion, config.get("region"));
        addInCondition(lqw, PingNodeConfig::getOperators, config.get("operators"));
        lqw.orderByDesc(PingNodeConfig::getWeight);
        lqw.orderByAsc(PingNodeConfig::getId);
        List<PingNodeConfig> nodes = nodeConfigMapper.selectList(lqw);
        sanitizeDispatchMessage(message);
        message.setNumber(pingProperties.getRabbit().getContinueNum());
        if ("slow".equals(message.getModel())) {
            sendWithRateLimit(nodes, message);
            return;
        }
        nodes.forEach(node -> send(node, message));
    }

    private void dispatchBatchPing(PingWsMessageDto message, JsonNode config) {
        List<Long> nodeIds = distinctNodeIds(config);
        List<String> targets = splitBody(message.getBody());
        PingPingTargetFilter filter = new PingPingTargetFilter();
        filter.setFilterNetwork("true".equals(config.path("filterNetwork").asText()));
        filter.setFirstGateway("first".equals(config.path("firstGateway").asText()));
        List<String> expandedTargets = filter.processTargets(targets);
        List<PingNodeConfig> nodes = batchNodes(nodeIds);
        for (int index = 0; index < expandedTargets.size(); index++) {
            String target = expandedTargets.get(index);
            PingWsMessageDto task = createBatchTask(message, "ping", target, null, index, target);
            nodes.forEach(node -> send(node, task));
        }
    }

    private void dispatchBatchTcping(PingWsMessageDto message, JsonNode config) {
        List<Long> nodeIds = distinctNodeIds(config);
        List<String> targets = splitBody(message.getBody());
        PingTcpingTargetFilter filter = new PingTcpingTargetFilter();
        filter.setFilterNetwork("true".equals(config.path("filterNetwork").asText()));
        filter.setFirstGateway("first".equals(config.path("firstGateway").asText()));
        int port = message.getPort() == null ? 80 : message.getPort().intValue();
        List<Map<String, Object>> expandedTargets = filter.processTargets(targets, port);
        List<PingNodeConfig> nodes = batchNodes(nodeIds);
        for (int index = 0; index < expandedTargets.size(); index++) {
            Map<String, Object> expanded = expandedTargets.get(index);
            String target = (String) expanded.get("target");
            long targetPort = ((Number) expanded.get("port")).longValue();
            String displayTarget = targetPort == 80 ? target : target + ":" + targetPort;
            PingWsMessageDto task = createBatchTask(
                message, "tcping", target, targetPort, index, displayTarget
            );
            nodes.forEach(node -> send(node, task));
        }
    }

    private List<Long> distinctNodeIds(JsonNode config) {
        List<Long> nodeIds = List.copyOf(new LinkedHashSet<>(toLongList(config.get("node"))));
        if (nodeIds.isEmpty()) {
            throw new IllegalArgumentException("请至少选择一个检测节点");
        }
        if (nodeIds.size() > 5) {
            throw new IllegalArgumentException("最多只能选择5个检测节点");
        }
        return nodeIds;
    }

    private List<PingNodeConfig> batchNodes(List<Long> nodeIds) {
        List<PingNodeConfig> nodes = nodeConfigMapper.selectList(Wrappers.<PingNodeConfig>lambdaQuery()
            .eq(PingNodeConfig::getState, ENABLED_STATE)
            .eq(PingNodeConfig::getRqState, ENABLED_STATE)
            .ge(PingNodeConfig::getOnline, onlineCutoff())
            .in(PingNodeConfig::getId, nodeIds)
            .orderByDesc(PingNodeConfig::getWeight)
            .orderByAsc(PingNodeConfig::getId));
        if (nodes.size() != nodeIds.size()) {
            throw new IllegalArgumentException("部分所选节点已离线或被禁用，请重新选择节点");
        }
        return nodes;
    }

    private PingWsMessageDto createBatchTask(PingWsMessageDto source, String type, String target,
                                                 Long port, int batchIndex, String batchTarget) {
        PingWsMessageDto task = new PingWsMessageDto();
        task.setTaskId(source.getTaskId());
        task.setType(type);
        task.setUrl(target);
        task.setDns(source.getDns());
        task.setPort(port);
        task.setModel("");
        task.setNumber(1);
        task.setBody("");
        task.setBatchIndex(batchIndex);
        task.setBatchTarget(batchTarget);
        return task;
    }

    private void sendWithRateLimit(List<PingNodeConfig> nodes, PingWsMessageDto message) {
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
        Runnable sendTask = new Runnable() {
            private int index = 0;

            @Override
            public void run() {
                for (int i = 0; i < pingProperties.getRabbit().getMessagesPerSecond(); i++) {
                    if (index < nodes.size()) {
                        send(nodes.get(index), message);
                        index++;
                    } else {
                        scheduler.shutdown();
                        break;
                    }
                }
            }
        };
        scheduler.scheduleAtFixedRate(sendTask, 0, 1, TimeUnit.SECONDS);
    }

    private void send(PingNodeConfig node, PingWsMessageDto message) {
        if (!isDispatchable(node)) {
            return;
        }
        try {
            rabbitTemplate.convertAndSend(node.getExchange(), node.getBinding(), objectMapper.writeValueAsString(message));
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("ping websocket payload序列化失败", e);
        }
    }

    private boolean isDispatchable(PingNodeConfig node) {
        return node != null
            && ENABLED_STATE.equals(node.getState())
            && ENABLED_STATE.equals(node.getRqState())
            && node.getOnline() != null
            && node.getOnline() >= onlineCutoff()
            && StringUtils.isNotBlank(node.getExchange())
            && StringUtils.isNotBlank(node.getBinding());
    }

    private long onlineCutoff() {
        long offlineAfter = Math.max(
            pingProperties.getAgent().getHeartbeatIntervalSeconds() * 2,
            pingProperties.getAgent().getOfflineAfterSeconds()
        );
        return java.time.Instant.now().getEpochSecond() - offlineAfter;
    }

    private JsonNode parseConfig(String config) {
        if (StringUtils.isBlank(config)) {
            return objectMapper.createObjectNode();
        }
        try {
            return objectMapper.readTree(config);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("config JSON格式错误", e);
        }
    }

    private void sanitizeDispatchMessage(PingWsMessageDto message) {
        message.setSign(null);
        message.setConfig(null);
    }

    private List<String> splitBody(String body) {
        if (StringUtils.isBlank(body)) {
            return Collections.emptyList();
        }
        return Arrays.stream(body.split("\\n")).toList();
    }

    private List<Long> toLongList(JsonNode node) {
        if (node == null || !node.isArray()) {
            return Collections.emptyList();
        }
        return objectMapper.convertValue(node, objectMapper.getTypeFactory().constructCollectionType(List.class, Long.class));
    }

    private List<String> toStringList(JsonNode node) {
        if (node == null || !node.isArray()) {
            return Collections.emptyList();
        }
        return objectMapper.convertValue(node, objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
    }

    private void addInCondition(LambdaQueryWrapper<PingNodeConfig> lqw,
                                com.baomidou.mybatisplus.core.toolkit.support.SFunction<PingNodeConfig, ?> column,
                                JsonNode value) {
        List<String> values = toStringList(value);
        if (!values.isEmpty()) {
            lqw.in(column, values);
        }
    }
}
