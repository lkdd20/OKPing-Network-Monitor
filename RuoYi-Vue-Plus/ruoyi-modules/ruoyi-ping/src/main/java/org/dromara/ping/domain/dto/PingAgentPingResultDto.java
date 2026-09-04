package org.dromara.ping.domain.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class PingAgentPingResultDto {

    private String taskId;
    private String nodeUuid;
    private String type;
    private int sequence;
    private int totalRuns;
    private boolean finalResult;
    private String ip;
    private List<String> resolvedIps;
    private double dnsDurationSeconds;
    private PingProbeResultDto probeResult;
    @JsonProperty("success")
    private Boolean legacySuccess;
    @JsonProperty("latencyMs")
    private Double latencyMs;
    @JsonProperty("targetIp")
    private String targetIp;
    @JsonProperty("dnsLatencyMs")
    private Double dnsLatencyMs;
    private String error;
    private long measuredAt;
    private Integer batchIndex;
    private String batchTarget;
    private PingTracerouteResultDto traceResult;
}
