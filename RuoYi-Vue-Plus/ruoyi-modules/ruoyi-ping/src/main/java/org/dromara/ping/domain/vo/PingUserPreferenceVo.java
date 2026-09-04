package org.dromara.ping.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.LinkedHashMap;
import java.util.Map;

@Data
public class PingUserPreferenceVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long revision;
    private Map<String, PingToolPreferenceVo> tools = new LinkedHashMap<>();
}
