package org.dromara.ping.domain.dto;

import lombok.Data;

import java.util.List;

@Data
public class PingTracerouteResultDto {

    private String target;
    private String targetIp;
    private int maxHops;
    private int probesPerHop;
    private boolean reached;
    private double durationMilliseconds;
    private List<PingTracerouteHopDto> hops;
}
