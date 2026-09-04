package org.dromara.ping.domain.dto;

import lombok.Data;

import java.util.List;

@Data
public class PingTracerouteHopDto {

    private int hop;
    private List<PingTracerouteProbeDto> probes;
}
