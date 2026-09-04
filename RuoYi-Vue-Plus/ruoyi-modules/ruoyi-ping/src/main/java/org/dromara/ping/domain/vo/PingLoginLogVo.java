package org.dromara.ping.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

@Data
public class PingLoginLogVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private String clientKey;
    private String deviceType;
    private String status;
    private String ipaddr;
    private String loginLocation;
    private String browser;
    private String os;
    private String message;
    private Date loginTime;
}
