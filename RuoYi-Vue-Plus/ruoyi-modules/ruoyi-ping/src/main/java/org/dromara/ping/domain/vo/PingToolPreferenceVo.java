package org.dromara.ping.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Data
public class PingToolPreferenceVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String enterAction;
    private String historyMode;
    private List<String> operators = new ArrayList<>();
    private String dnsMode;
    private String customDns;
    private Boolean mapTimeoutMarker;
    private String regionSummary;
    private Boolean dnsStatsExpanded;
    private Boolean quickActions;
}
