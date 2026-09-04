package org.dromara.ping.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.mybatis.core.domain.BaseEntity;

import java.io.Serial;
import java.util.Date;

/**
 * User submitted IP location correction awaiting administrator review.
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("ping_ip_feedback")
public class PingIpFeedback extends BaseEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private String ipVersion;
    private String startIp;
    private String endIp;
    private String location;
    private String status;
    private String reviewRemark;
    private Date reviewTime;
}
