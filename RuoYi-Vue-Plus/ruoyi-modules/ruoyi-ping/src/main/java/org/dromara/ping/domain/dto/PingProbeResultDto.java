package org.dromara.ping.domain.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

@Data
public class PingProbeResultDto {

    private String probe;
    private String target;

    @JsonProperty("effective_target")
    private String effectiveTarget;

    @JsonProperty("resolve_ip")
    private String resolveIp;

    private boolean success;

    @JsonProperty("duration_seconds")
    private double durationSeconds;

    @JsonProperty("timeout_seconds")
    private double timeoutSeconds;

    private JsonNode metrics;

    @JsonProperty("response_headers")
    private JsonNode responseHeaders;

    @JsonProperty("dns_response")
    private JsonNode dnsResponse;
}
