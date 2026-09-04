package org.dromara.ping.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

@Data
@TableName("sys_logininfor")
public class PingUserLoginLog implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "info_id")
    private Long infoId;
    private String tenantId;
    private String userName;
    private String clientKey;
    private String deviceType;
    private String status;
    private String ipaddr;
    private String loginLocation;
    private String browser;
    private String os;
    private String msg;
    private Date loginTime;
}
