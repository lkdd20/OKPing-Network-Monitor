package org.dromara.ping.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

@Data
public class PingPublicIpFeedbackItemVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private String ipVersion;
    private String startIp;
    private String endIp;
    private String submittedLocation;
    private String actualStartIp;
    private String actualEndIp;
    private String actualLocation;
    private String status;
    private Date createTime;
    private Date reviewTime;
}
