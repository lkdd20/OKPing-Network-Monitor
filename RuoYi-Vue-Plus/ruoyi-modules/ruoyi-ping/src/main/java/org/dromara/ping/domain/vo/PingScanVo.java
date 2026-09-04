package org.dromara.ping.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

/**
 * AI-readable project scan for the ping 1.0 migration module.
 */
@Data
public class PingScanVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String moduleName;
    private String moduleVersion;
    private String sourceProject;
    private String targetProject;
    private String legacyRuntime;
    private String targetRuntime;
    private String migrationGoal;
    private List<String> sourceBoundaries;
    private List<String> targetBoundaries;
    private List<String> dependencyNotes;
    private List<String> dataModelNotes;
    private List<LegacyEndpointVo> endpoints;
    private List<String> recommendedOrder;
    private List<String> openRisks;
}
