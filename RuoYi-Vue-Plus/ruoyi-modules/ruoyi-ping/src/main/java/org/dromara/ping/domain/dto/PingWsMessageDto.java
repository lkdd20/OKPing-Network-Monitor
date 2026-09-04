package org.dromara.ping.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

@Data
public class PingWsMessageDto {

    private String taskId;
    @JsonIgnore
    private String sign;
    private String type;
    private String url;
    private String config;
    private String dns;
    private Long port;
    private String pathOrParams;
    private String agreement;
    private String model;
    private long number;
    private String body;
    private Boolean continueParam;
    private Integer batchIndex;
    private String batchTarget;
}
