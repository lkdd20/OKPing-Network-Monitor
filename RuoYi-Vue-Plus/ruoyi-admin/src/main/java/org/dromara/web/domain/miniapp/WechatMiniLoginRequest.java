package org.dromara.web.domain.miniapp;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class WechatMiniLoginRequest {

    @NotBlank(message = "客户端ID不能为空")
    private String clientId;

    @NotBlank(message = "微信登录凭证不能为空")
    private String loginCode;

    @Pattern(regexp = "^[0-9a-fA-F]{32}$", message = "扫码会话无效")
    private String sessionId;
}
