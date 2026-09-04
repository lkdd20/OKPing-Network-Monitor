package org.dromara.ping.domain.bo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class PingIpFeedbackSubmitBo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @NotBlank(message = "IP版本不能为空")
    @Pattern(regexp = "ipv4|ipv6", message = "IP版本仅支持 ipv4 或 ipv6")
    private String ipVersion;

    @NotBlank(message = "起始IP不能为空")
    @Size(max = 45, message = "起始IP格式不正确")
    private String startIp;

    @Size(max = 45, message = "结束IP格式不正确")
    private String endIp;

    @NotBlank(message = "正确归属地不能为空")
    @Size(max = 256, message = "正确归属地长度不能超过256个字符")
    private String location;
}
