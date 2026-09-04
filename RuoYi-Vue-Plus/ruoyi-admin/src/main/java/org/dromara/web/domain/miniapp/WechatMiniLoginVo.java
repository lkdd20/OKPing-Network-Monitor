package org.dromara.web.domain.miniapp;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class WechatMiniLoginVo {

    private boolean registered;
    private boolean phoneBound;

    @JsonProperty("access_token")
    private String accessToken;

    @JsonProperty("expire_in")
    private Long expireIn;

    @JsonProperty("client_id")
    private String clientId;

    private Long userId;
    private String userName;
    private String nickName;
    private String phone;
}
