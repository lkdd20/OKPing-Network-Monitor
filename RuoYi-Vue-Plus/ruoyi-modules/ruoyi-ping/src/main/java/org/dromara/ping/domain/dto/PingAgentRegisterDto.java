package org.dromara.ping.domain.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class PingAgentRegisterDto {

    @NotBlank(message = "uuid不能为空")
    private String uuid;

    private String version;

    private List<String> capabilities;
}
