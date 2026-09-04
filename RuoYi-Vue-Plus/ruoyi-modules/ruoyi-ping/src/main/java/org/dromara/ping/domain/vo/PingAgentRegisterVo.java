package org.dromara.ping.domain.vo;

import lombok.Data;

@Data
public class PingAgentRegisterVo {

    private boolean enabled;
    private long heartbeatIntervalSeconds;
    private PingAgentNodeVo node;
    private PingAgentRabbitVo rabbit;
}
