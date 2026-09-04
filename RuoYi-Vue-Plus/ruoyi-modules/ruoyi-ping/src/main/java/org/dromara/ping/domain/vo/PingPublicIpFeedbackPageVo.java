package org.dromara.ping.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

@Data
public class PingPublicIpFeedbackPageVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String submittedIpCount7d;
    private String updatedIpCount7d;
    private long total;
    private int pageNum;
    private int pageSize;
    private List<PingPublicIpFeedbackItemVo> rows;
}
