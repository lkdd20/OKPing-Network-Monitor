package org.dromara.ping.domain.vo;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
@AllArgsConstructor
public class PingSessionKickVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private boolean currentSession;
}
