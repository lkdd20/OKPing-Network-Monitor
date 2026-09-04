package org.dromara.ping.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.RequiredArgsConstructor;
import org.dromara.ping.domain.PingNodeConfig;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.ping.domain.dto.PingAgentPingResultDto;
import org.dromara.ping.domain.dto.PingProbeResultDto;
import org.dromara.ping.domain.dto.PingTracerouteHopDto;
import org.dromara.ping.domain.dto.PingTracerouteProbeDto;
import org.dromara.ping.domain.dto.PingTracerouteResultDto;
import org.dromara.ping.domain.vo.PingPingResultVo;
import org.dromara.ping.mapper.PingNodeConfigMapper;
import org.dromara.ping.service.IPingIpRegionService;
import org.dromara.ping.service.IPingNodeMessageService;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PingNodeMessageServiceImpl implements IPingNodeMessageService {

    private final PingNodeConfigMapper nodeConfigMapper;
    private final IPingIpRegionService ipRegionService;

    @Override
    public PingPingResultVo buildPingResult(PingAgentPingResultDto result) {
        if (StringUtils.isBlank(result.getTaskId()) || StringUtils.isBlank(result.getNodeUuid())) {
            throw new ServiceException("Agent回包缺少taskId或nodeUuid");
        }
        PingNodeConfig node = queryNode(result.getNodeUuid());
        if (node == null) {
            throw new ServiceException("Agent节点不存在：{}", result.getNodeUuid());
        }
        PingPingResultVo response = new PingPingResultVo();
        response.setNodeId(node.getId());
        response.setType(result.getType());
        response.setSequence(result.getSequence());
        response.setTotalRuns(result.getTotalRuns());
        response.setFinalResult(result.isFinalResult());
        String ip = resolveIp(result);
        response.setIp(ip);
        response.setResolvedIps(result.getResolvedIps());
        response.setDnsDurationSeconds(resolveDnsDurationSeconds(result));
        response.setProbeResult(buildProbeResult(result));
        response.setIpLocation(ipRegionService.lookup(ip));
        response.setError(result.getError());
        response.setMeasuredAt(result.getMeasuredAt());
        response.setBatchIndex(result.getBatchIndex());
        response.setBatchTarget(result.getBatchTarget());
        response.setTraceResult(enrichTracerouteResult(result.getTraceResult()));
        return response;
    }

    private PingTracerouteResultDto enrichTracerouteResult(PingTracerouteResultDto traceResult) {
        if (traceResult == null || traceResult.getHops() == null) {
            return traceResult;
        }
        Map<String, String> locations = new HashMap<>();
        for (PingTracerouteHopDto hop : traceResult.getHops()) {
            if (hop == null || hop.getProbes() == null) {
                continue;
            }
            for (PingTracerouteProbeDto probe : hop.getProbes()) {
                if (probe == null || StringUtils.isBlank(probe.getIp())) {
                    continue;
                }
                probe.setIpLocation(locations.computeIfAbsent(probe.getIp(), ipRegionService::lookup));
            }
        }
        return traceResult;
    }

    private double resolveDnsDurationSeconds(PingAgentPingResultDto result) {
        if (result.getDnsDurationSeconds() > 0) {
            return result.getDnsDurationSeconds();
        }
        if (result.getDnsLatencyMs() != null && result.getDnsLatencyMs() > 0) {
            return result.getDnsLatencyMs() / 1000.0;
        }
        return 0D;
    }

    private PingProbeResultDto buildProbeResult(PingAgentPingResultDto result) {
        if (result.getProbeResult() != null) {
            PingProbeResultDto probeResult = result.getProbeResult();
            if (StringUtils.isBlank(probeResult.getResolveIp())) {
                String resolvedIp = resolveIp(result);
                if (StringUtils.isNotBlank(resolvedIp)) {
                    probeResult.setResolveIp(resolvedIp);
                }
            }
            if (StringUtils.isBlank(probeResult.getEffectiveTarget())) {
                String resolvedIp = resolveIp(result);
                if (StringUtils.isNotBlank(resolvedIp)) {
                    probeResult.setEffectiveTarget(resolvedIp);
                }
            }
            if (StringUtils.isBlank(probeResult.getTarget())) {
                String resolvedIp = resolveIp(result);
                if (StringUtils.isNotBlank(resolvedIp)) {
                    probeResult.setTarget(resolvedIp);
                }
            }
            return probeResult;
        }

        boolean hasLegacyResult = result.getLegacySuccess() != null
            || result.getLatencyMs() != null
            || StringUtils.isNotBlank(result.getTargetIp())
            || result.getDnsLatencyMs() != null;
        if (!hasLegacyResult) {
            return null;
        }

        PingProbeResultDto probeResult = new PingProbeResultDto();
        String resolvedIp = resolveIp(result);
        probeResult.setProbe("icmp");
        probeResult.setTarget(StringUtils.isNotBlank(result.getTargetIp()) ? result.getTargetIp() : resolvedIp);
        probeResult.setEffectiveTarget(resolvedIp);
        probeResult.setResolveIp(resolvedIp);
        probeResult.setSuccess(!Boolean.FALSE.equals(result.getLegacySuccess()));
        probeResult.setDurationSeconds(resolveLegacyDurationSeconds(result));
        probeResult.setTimeoutSeconds(5);
        return probeResult;
    }

    private double resolveLegacyDurationSeconds(PingAgentPingResultDto result) {
        if (result.getLatencyMs() == null || result.getLatencyMs() <= 0) {
            return 0D;
        }
        return result.getLatencyMs() / 1000.0;
    }

    private String resolveIp(PingAgentPingResultDto result) {
        if (StringUtils.isNotBlank(result.getIp())) {
            return result.getIp();
        }
        PingProbeResultDto probeResult = result.getProbeResult();
        if (probeResult != null && StringUtils.isNotBlank(probeResult.getResolveIp())) {
            return probeResult.getResolveIp();
        }
        String resolvedIp = firstResolvedIp(result);
        if (StringUtils.isNotBlank(resolvedIp)) {
            return resolvedIp;
        }
        if (StringUtils.isNotBlank(result.getTargetIp())) {
            return result.getTargetIp();
        }
        return probeResult == null ? null : probeResult.getEffectiveTarget();
    }

    private PingNodeConfig queryNode(String uuid) {
        if (uuid == null || uuid.isBlank()) {
            return null;
        }
        return nodeConfigMapper.selectOne(Wrappers.<PingNodeConfig>lambdaQuery()
            .eq(PingNodeConfig::getUuid, uuid)
            .last("limit 1"));
    }

    private String firstResolvedIp(PingAgentPingResultDto result) {
        if (result.getResolvedIps() == null) {
            return null;
        }
        return result.getResolvedIps().stream()
            .filter(StringUtils::isNotBlank)
            .findFirst()
            .orElse(null);
    }

}
