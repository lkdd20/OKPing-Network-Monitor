package org.dromara.web.domain.miniapp;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class WechatQrConfirmRequest {

    @NotBlank(message = "扫码会话不能为空")
    private String sessionId;
}
