package org.dromara.ping.domain.bo;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.mybatis.core.domain.BaseEntity;

import java.io.Serial;

@Data
@EqualsAndHashCode(callSuper = true)
public class PingIpFeedbackQueryBo extends BaseEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    private String ipVersion;
    private String startIp;
    private String status;
}
