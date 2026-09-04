package org.dromara.web.domain.miniapp;

import lombok.Data;

@Data
public class WechatQrCreateVo {

    private String sessionId;
    private String imageUrl;
    private String launchUrl;
    private long expiresIn;
}
