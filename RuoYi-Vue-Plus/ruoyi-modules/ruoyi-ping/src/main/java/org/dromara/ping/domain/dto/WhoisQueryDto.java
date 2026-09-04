package org.dromara.ping.domain.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class WhoisQueryDto implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @JsonAlias("domain")
    @NotBlank(message = "请输入要查询的域名")
    @Size(max = 2048, message = "域名长度不能超过2048个字符")
    private String host;
}
