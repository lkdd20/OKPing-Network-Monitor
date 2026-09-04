package org.dromara.web.domain.miniapp;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class WechatQrCreateRequest {

    @NotBlank(message = "网页客户端ID不能为空")
    private String clientId;
}
