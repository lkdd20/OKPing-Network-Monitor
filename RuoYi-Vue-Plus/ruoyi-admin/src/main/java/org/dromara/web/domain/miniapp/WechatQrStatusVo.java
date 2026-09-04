package org.dromara.web.domain.miniapp;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class WechatQrStatusVo {

    private String status;

    @JsonProperty("access_token")
    private String accessToken;

    @JsonProperty("expire_in")
    private Long expireIn;

    @JsonProperty("client_id")
    private String clientId;
}
