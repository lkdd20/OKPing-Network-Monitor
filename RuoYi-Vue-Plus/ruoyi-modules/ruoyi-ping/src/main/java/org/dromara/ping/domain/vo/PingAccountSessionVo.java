package org.dromara.ping.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class PingAccountSessionVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String sessionKey;
    private String clientKey;
    private String deviceType;
    private String ipaddr;
    private String loginLocation;
    private String browser;
    private String os;
    private Long loginTime;
    private Boolean current;
}
