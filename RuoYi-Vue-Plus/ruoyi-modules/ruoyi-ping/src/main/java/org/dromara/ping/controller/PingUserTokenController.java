package org.dromara.ping.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.log.annotation.Log;
import org.dromara.common.log.enums.BusinessType;
import org.dromara.ping.config.PingProperties;
import org.dromara.ping.service.IPingWsAccessService;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@SaIgnore
@RestController
@RequiredArgsConstructor
@RequestMapping("/ping/user")
public class PingUserTokenController {

    private final IPingWsAccessService wsAccessService;
    private final PingProperties pingProperties;

    @Log(title = "用户任务提交", businessType = BusinessType.INSERT)
    @PostMapping("/check")
    public R<String> check(@RequestBody String data) {

        return createAccessKey(data);
    }

    @Log(title = "用户任务提交", businessType = BusinessType.INSERT)
    @PostMapping("/check/{data}")
    public R<String> checkPath(@PathVariable String data) {

        return createAccessKey(data);
    }

    private R<String> createAccessKey(String data) {
        if (StringUtils.isBlank(data)) {
            return R.fail("接口调用失败");
        }
        long ttl = pingProperties.getWebsocket().getAccessKeyExpireSeconds();
        if (ttl <= 0) {
            return R.fail("接口配置异常");
        }
        String accessKey = UUID.randomUUID().toString();
        wsAccessService.setPayload(accessKey, data, ttl);
        return R.ok("操作成功", accessKey);
    }
}
