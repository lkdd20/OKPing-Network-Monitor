package org.dromara.ping.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.idempotent.annotation.RepeatSubmit;
import org.dromara.common.log.annotation.Log;
import org.dromara.common.log.enums.BusinessType;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.common.web.core.BaseController;
import org.dromara.ping.domain.bo.PingProductBetaSignupBo;
import org.dromara.ping.domain.vo.PingProductBetaSignupVo;
import org.dromara.ping.domain.vo.PingProductBetaStatusVo;
import org.dromara.ping.domain.vo.PingProductBetaSummaryVo;
import org.dromara.ping.service.IPingProductBetaSignupService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/ping/product-beta")
public class PingProductBetaSignupController extends BaseController {

    private final IPingProductBetaSignupService signupService;

    @GetMapping("/status")
    public R<PingProductBetaStatusVo> status() {
        return R.ok(signupService.getCurrentStatus());
    }

    @Log(title = "监控产品内测报名", businessType = BusinessType.INSERT)
    @RepeatSubmit
    @PostMapping("/signup")
    public R<PingProductBetaStatusVo> signup() {
        return R.ok(signupService.signup());
    }

    @SaCheckPermission("ping:productBeta:list")
    @GetMapping("/list")
    public TableDataInfo<PingProductBetaSignupVo> list(
        PingProductBetaSignupBo bo, PageQuery pageQuery) {
        return signupService.queryPageList(bo, pageQuery);
    }

    @SaCheckPermission("ping:productBeta:list")
    @GetMapping("/summary")
    public R<PingProductBetaSummaryVo> summary() {
        return R.ok(signupService.querySummary());
    }

    @SaCheckPermission("ping:productBeta:edit")
    @Log(title = "监控产品内测报名", businessType = BusinessType.UPDATE)
    @PutMapping("/status")
    public R<Void> updateStatus(
        @Validated(EditGroup.class) @RequestBody PingProductBetaSignupBo bo) {
        return toAjax(signupService.updateStatus(bo));
    }
}
