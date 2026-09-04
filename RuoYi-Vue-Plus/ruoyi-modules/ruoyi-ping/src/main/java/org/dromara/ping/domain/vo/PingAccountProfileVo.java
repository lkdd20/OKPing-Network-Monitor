package org.dromara.ping.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class PingAccountProfileVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long userId;
    private String username;
    private String nickname;
    private String tenantId;
}
