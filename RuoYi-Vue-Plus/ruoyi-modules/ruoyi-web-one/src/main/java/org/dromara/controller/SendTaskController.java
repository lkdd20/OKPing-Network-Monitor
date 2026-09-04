package org.dromara.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.web.core.BaseController;
import org.dromara.domain.bo.SendTaskBo;
import org.dromara.service.ISendTaskService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

/**
 * 广告链接
 *
 * @author Lion Li
 * @date 2026-05-15
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/web/task")
public class SendTaskController extends BaseController {

    private final ISendTaskService sendTaskService;
    private static final Duration CACHE_TTL = Duration.ofSeconds(30);
    /**
     * 发送任务
     */
    @SaIgnore
    @PostMapping("/send")
    public R<String> send(@Validated(AddGroup.class) @RequestBody SendTaskBo bo) {
        String send = sendTaskService.send(bo, CACHE_TTL);
        return R.ok("操作成功", send);
    }

    /**
     * 查询发送任务
     */
    @SaIgnore
    @GetMapping("/{uuid}")
    public R<SendTaskBo> get(@PathVariable String uuid) {
        SendTaskBo bo = sendTaskService.queryByUuid(uuid);
        if (bo == null) {
            return R.fail("任务不存在或已过期");
        }
        return R.ok(bo);
    }

}
