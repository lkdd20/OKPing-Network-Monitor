package org.dromara.ping.domain.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class IpInfoDto implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @NotBlank(message = "IP地址不能为空")
    @Size(max = 64, message = "IP地址长度不能超过64个字符")
    private String ip;
    @JsonAlias("lot_number")
    private String lotNumber;
    @JsonAlias("captcha_output")
    private String captchaOutput;
    @JsonAlias("pass_token")
    private String passToken;
    @JsonAlias("gen_time")
    private Integer genTime;
}
