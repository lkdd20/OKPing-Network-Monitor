package org.dromara.ping.domain.vo;

import lombok.Data;

@Data
public class PingAgentNodeVo {

    private String uuid;
    private String exchange;
    private String queue;
    private String binding;
}
