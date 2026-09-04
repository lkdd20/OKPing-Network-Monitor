package org.dromara.web.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import cn.dev33.satoken.stp.StpUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.ratelimiter.annotation.RateLimiter;
import org.dromara.common.ratelimiter.enums.LimitType;
import org.dromara.web.domain.miniapp.WechatMiniLoginRequest;
import org.dromara.web.domain.miniapp.WechatMiniLoginVo;
import org.dromara.web.domain.miniapp.WechatMiniRegisterRequest;
import org.dromara.web.domain.miniapp.WechatQrConfirmRequest;
import org.dromara.web.domain.miniapp.WechatQrCreateRequest;
import org.dromara.web.domain.miniapp.WechatQrCreateVo;
import org.dromara.web.domain.miniapp.WechatQrStatusVo;
import org.dromara.web.service.WechatMiniAppAuthService;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/auth/wechat-miniapp")
public class WechatMiniAppAuthController {

    private final WechatMiniAppAuthService authService;

    @SaIgnore
    @RateLimiter(time = 60, count = 30, limitType = LimitType.IP)
    @PostMapping("/login")
    public R<WechatMiniLoginVo> login(@Valid @RequestBody WechatMiniLoginRequest request) {
        return R.ok(authService.login(request));
    }

    @SaIgnore
    @RateLimiter(time = 60, count = 10, limitType = LimitType.IP)
    @PostMapping("/register")
    public R<WechatMiniLoginVo> register(@Valid @RequestBody WechatMiniRegisterRequest request) {
        return R.ok(authService.register(request));
    }

    @SaIgnore
    @RateLimiter(time = 60, count = 20, limitType = LimitType.IP)
    @PostMapping("/qr/create")
    public R<WechatQrCreateVo> createQr(@Valid @RequestBody WechatQrCreateRequest request) {
        return R.ok(authService.createQrSession(request.getClientId()));
    }

    @SaIgnore
    @GetMapping("/qr/{sessionId}/image")
    public ResponseEntity<byte[]> qrImage(@PathVariable String sessionId) {
        return ResponseEntity.ok()
            .cacheControl(CacheControl.noStore())
            .contentType(MediaType.IMAGE_PNG)
            .body(authService.getQrImage(sessionId));
    }

    @SaIgnore
    @GetMapping("/qr/{sessionId}/status")
    public R<WechatQrStatusVo> qrStatus(@PathVariable String sessionId) {
        return R.ok(authService.getQrStatus(sessionId));
    }

    @PostMapping("/qr/confirm")
    public R<Void> confirmQr(@Valid @RequestBody WechatQrConfirmRequest request) {
        StpUtil.checkLogin();
        authService.confirmQrSession(request.getSessionId());
        return R.ok("登录确认成功");
    }
}
