package org.dromara.ping.domain.vo;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import org.dromara.ping.domain.dto.PingProbeResultDto;
import org.dromara.ping.domain.dto.PingTracerouteResultDto;

import java.util.List;

@Data
public class PingPingResultVo {

    private Long nodeId;
    private String type;
    private int sequence;
    private int totalRuns;
    private boolean finalResult;
    private String ip;
    private List<String> resolvedIps;
    private double dnsDurationSeconds;
    private PingProbeResultDto probeResult;
    private String ipLocation;
    private String error;
    private long measuredAt;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Integer batchIndex;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String batchTarget;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private PingTracerouteResultDto traceResult;
}
