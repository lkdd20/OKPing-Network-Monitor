package org.dromara.ping.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

@Data
public class PingPublicIssuePageVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private long total;
    private int pageNum;
    private int pageSize;
    private List<PingPublicIssueVo> rows;
}
