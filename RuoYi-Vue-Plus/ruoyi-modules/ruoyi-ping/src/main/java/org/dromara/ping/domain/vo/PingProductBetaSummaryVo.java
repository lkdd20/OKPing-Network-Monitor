package org.dromara.ping.domain.vo;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
@AllArgsConstructor
public class PingProductBetaSummaryVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private long total;
    private long registered;
    private long notified;
    private long today;
    private long lastSevenDays;
}
