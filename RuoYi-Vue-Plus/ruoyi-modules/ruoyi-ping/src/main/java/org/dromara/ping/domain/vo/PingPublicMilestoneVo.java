package org.dromara.ping.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class PingPublicMilestoneVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private String year;
    private String month;
    private String content;
}
