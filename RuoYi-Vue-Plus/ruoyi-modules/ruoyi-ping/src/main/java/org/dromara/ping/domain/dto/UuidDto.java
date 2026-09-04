package org.dromara.ping.domain.dto;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class UuidDto implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String uuid;
}
