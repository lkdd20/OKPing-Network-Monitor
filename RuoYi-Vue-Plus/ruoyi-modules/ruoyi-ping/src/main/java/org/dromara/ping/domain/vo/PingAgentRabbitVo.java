package org.dromara.ping.domain.vo;

import lombok.Data;

@Data
public class PingAgentRabbitVo {

    private String host;
    private int port;
    private String username;
    private String password;
    private String virtualHost;
    private boolean tls;
    private String resultExchange;
    private String resultRoutingKey;
}
