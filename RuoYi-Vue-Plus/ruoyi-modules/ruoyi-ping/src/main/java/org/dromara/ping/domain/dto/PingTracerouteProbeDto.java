package org.dromara.ping.domain.dto;

import lombok.Data;

@Data
public class PingTracerouteProbeDto {

    private String ip;
    private Double durationMilliseconds;
    private boolean timeout;
    private String ipLocation;
}
