package org.dromara.ping.domain.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;

/**
 * Legacy endpoint inventory item used by the ping 1.0 migration scan.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LegacyEndpointVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String method;
    private String path;
    private String legacyController;
    private String purpose;
    private String migrationStatus;
    private String nextAction;
}
