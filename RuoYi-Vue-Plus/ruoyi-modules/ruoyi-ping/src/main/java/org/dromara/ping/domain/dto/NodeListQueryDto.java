package org.dromara.ping.domain.dto;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

@Data
public class NodeListQueryDto implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private List<String> region;
    private List<String> operators;
}
