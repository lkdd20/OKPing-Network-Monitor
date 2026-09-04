package org.dromara.ping.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.ping.config.PingProperties;
import org.dromara.ping.domain.PingNodeConfig;
import org.dromara.ping.domain.dto.PingAgentRegisterDto;
import org.dromara.ping.domain.vo.PingAgentNodeVo;
import org.dromara.ping.domain.vo.PingAgentRabbitVo;
import org.dromara.ping.domain.vo.PingAgentRegisterVo;
import org.dromara.ping.mapper.PingNodeConfigMapper;
import org.dromara.ping.service.IPingAgentService;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class PingAgentServiceImpl implements IPingAgentService {

    private static final String ENABLED_STATE = "on";
    private static final String DISABLED_STATE = "off";

    private final PingNodeConfigMapper nodeConfigMapper;
    private final PingProperties properties;

    @Override
    public PingAgentRegisterVo register(PingAgentRegisterDto request) {
        String uuid = request.getUuid().trim();
        PingNodeConfig node = nodeConfigMapper.selectOne(Wrappers.<PingNodeConfig>lambdaQuery()
            .eq(PingNodeConfig::getUuid, uuid)
            .last("limit 1"));
        if (node == null) {
            return null;
        }

        long now = Instant.now().getEpochSecond();
        boolean enabled = properties.getAgent().isEnabled() && ENABLED_STATE.equals(node.getState());
        nodeConfigMapper.update(null, Wrappers.<PingNodeConfig>lambdaUpdate()
            .eq(PingNodeConfig::getId, node.getId())
            .set(PingNodeConfig::getOnline, now)
            .set(PingNodeConfig::getRqState, enabled ? ENABLED_STATE : DISABLED_STATE));

        PingAgentRegisterVo response = new PingAgentRegisterVo();
        response.setEnabled(enabled);
        response.setHeartbeatIntervalSeconds(Math.max(60, properties.getAgent().getHeartbeatIntervalSeconds()));
        if (!enabled) {
            return response;
        }
        if (StringUtils.isAnyBlank(node.getExchange(), node.getQueue(), node.getBinding())) {
            throw new IllegalStateException("节点RabbitMQ路由配置不完整");
        }

        response.setNode(toNode(node));
        response.setRabbit(toRabbit(properties.getAgent().getRabbit()));
        log.info("ping Agent registered: uuid={}, version={}, capabilities={}",
            uuid, request.getVersion(), request.getCapabilities());
        return response;
    }

    @Override
    public int markStaleNodesOffline() {
        long offlineAfter = Math.max(
            properties.getAgent().getHeartbeatIntervalSeconds() * 2,
            properties.getAgent().getOfflineAfterSeconds()
        );
        long cutoff = Instant.now().getEpochSecond() - offlineAfter;
        return nodeConfigMapper.update(null, Wrappers.<PingNodeConfig>lambdaUpdate()
            .eq(PingNodeConfig::getRqState, ENABLED_STATE)
            .and(wrapper -> wrapper.isNull(PingNodeConfig::getOnline)
                .or()
                .lt(PingNodeConfig::getOnline, cutoff))
            .set(PingNodeConfig::getRqState, DISABLED_STATE));
    }

    private PingAgentNodeVo toNode(PingNodeConfig node) {
        PingAgentNodeVo vo = new PingAgentNodeVo();
        vo.setUuid(node.getUuid());
        vo.setExchange(node.getExchange());
        vo.setQueue(node.getQueue());
        vo.setBinding(node.getBinding());
        return vo;
    }

    private PingAgentRabbitVo toRabbit(PingProperties.RabbitConnection rabbit) {
        PingAgentRabbitVo vo = new PingAgentRabbitVo();
        vo.setHost(rabbit.getHost());
        vo.setPort(rabbit.getPort());
        vo.setUsername(rabbit.getUsername());
        vo.setPassword(rabbit.getPassword());
        vo.setVirtualHost(rabbit.getVirtualHost());
        vo.setTls(rabbit.isTls());
        vo.setResultExchange(rabbit.getResultExchange());
        vo.setResultRoutingKey(rabbit.getResultRoutingKey());
        return vo;
    }
}
