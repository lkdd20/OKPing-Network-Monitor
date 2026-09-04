package org.dromara.ping.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.log.annotation.Log;
import org.dromara.common.log.enums.BusinessType;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.ping.domain.vo.PingAccountProfileVo;
import org.dromara.ping.domain.vo.PingAccountSessionVo;
import org.dromara.ping.domain.vo.PingLoginLogVo;
import org.dromara.ping.domain.vo.PingSessionKickVo;
import org.dromara.ping.domain.vo.PingUserPreferenceVo;
import org.dromara.ping.service.IPingAccountService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/ping/account")
public class PingAccountController {

    private final IPingAccountService accountService;

    @GetMapping("/me")
    public R<PingAccountProfileVo> me() {
        return R.ok(accountService.getProfile());
    }

    @GetMapping("/preferences")
    public R<PingUserPreferenceVo> preferences() {
        return R.ok(accountService.getPreferences());
    }

    @PutMapping("/preferences")
    public R<PingUserPreferenceVo> savePreferences(
        @Valid @RequestBody PingUserPreferenceVo preferences) {
        return R.ok(accountService.savePreferences(preferences));
    }

    @Log(title = "用户任务提交", businessType = BusinessType.INSERT)
    @GetMapping("/sessions")
    public R<List<PingAccountSessionVo>> sessions() {
        return R.ok(accountService.getSessions());
    }

    @DeleteMapping("/sessions/{sessionKey}")
    public R<PingSessionKickVo> kickSession(
        @Pattern(regexp = "^[0-9a-f]{32}$", message = "登录设备标识无效")
        @PathVariable String sessionKey) {
        return R.ok(accountService.kickSession(sessionKey));
    }

    @GetMapping("/login-logs")
    public TableDataInfo<PingLoginLogVo> loginLogs(PageQuery pageQuery) {
        return accountService.getLoginLogs(pageQuery);
    }
}
