package org.dromara.web.service.impl;

import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.model.XcxLoginBody;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.ValidatorUtils;
import org.dromara.common.json.utils.JsonUtils;
import org.dromara.system.domain.vo.SysClientVo;
import org.dromara.web.domain.miniapp.WechatMiniLoginRequest;
import org.dromara.web.domain.miniapp.WechatMiniLoginVo;
import org.dromara.web.domain.vo.LoginVo;
import org.dromara.web.service.IAuthStrategy;
import org.dromara.web.service.WechatMiniAppAuthService;
import org.springframework.stereotype.Service;

/**
 * 小程序认证策略。首次注册和手机号绑定必须走 /auth/wechat-miniapp/register。
 */
@Service("xcx" + IAuthStrategy.BASE_NAME)
@RequiredArgsConstructor
public class XcxAuthStrategy implements IAuthStrategy {

    private final WechatMiniAppAuthService miniAppAuthService;

    @Override
    public LoginVo login(String body, SysClientVo client) {
        XcxLoginBody loginBody = JsonUtils.parseObject(body, XcxLoginBody.class);
        ValidatorUtils.validate(loginBody);

        WechatMiniLoginRequest request = new WechatMiniLoginRequest();
        request.setClientId(client.getClientId());
        request.setLoginCode(loginBody.getXcxCode());
        WechatMiniLoginVo result = miniAppAuthService.login(request);
        if (!result.isRegistered() || !result.isPhoneBound()) {
            throw new ServiceException("请先在微信小程序中绑定手机号完成注册");
        }

        LoginVo login = new LoginVo();
        login.setAccessToken(result.getAccessToken());
        login.setExpireIn(result.getExpireIn());
        login.setClientId(result.getClientId());
        return login;
    }
}
