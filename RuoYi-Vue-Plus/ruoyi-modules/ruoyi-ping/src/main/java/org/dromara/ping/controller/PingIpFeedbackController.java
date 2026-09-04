package org.dromara.ping.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import cn.dev33.satoken.annotation.SaIgnore;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.idempotent.annotation.RepeatSubmit;
import org.dromara.common.log.annotation.Log;
import org.dromara.common.log.enums.BusinessType;
import org.dromara.common.log.enums.OperatorType;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.common.web.core.BaseController;
import org.dromara.ping.domain.bo.PingIpFeedbackQueryBo;
import org.dromara.ping.domain.bo.PingIpFeedbackReviewBo;
import org.dromara.ping.domain.bo.PingIpFeedbackSubmitBo;
import org.dromara.ping.domain.vo.PingIpFeedbackVo;
import org.dromara.ping.domain.vo.PingPublicIpFeedbackPageVo;
import org.dromara.ping.service.IPingIpFeedbackService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/ping/ip-feedback")
public class PingIpFeedbackController extends BaseController {

    private final IPingIpFeedbackService ipFeedbackService;

    @SaIgnore
    @Log(title = "ping IP信息纠错提交", businessType = BusinessType.INSERT, operatorType = OperatorType.OTHER)
    @RepeatSubmit
    @PostMapping
    public R<Long> submit(@Valid @RequestBody PingIpFeedbackSubmitBo bo) {
        return R.ok("已提交，管理员审核通过后将对前台生效", ipFeedbackService.submit(bo));
    }

    @SaIgnore
    @GetMapping("/public")
    public R<PingPublicIpFeedbackPageVo> publicList(String ip, Integer pageNum, Integer pageSize) {
        return R.ok(ipFeedbackService.queryPublicPage(ip, pageNum, pageSize));
    }

    @SaCheckPermission("ping:ipFeedback:list")
    @GetMapping("/list")
    public TableDataInfo<PingIpFeedbackVo> list(PingIpFeedbackQueryBo bo, PageQuery pageQuery) {
        return ipFeedbackService.queryPageList(bo, pageQuery);
    }

    @SaCheckPermission("ping:ipFeedback:audit")
    @Log(title = "ping IP信息纠错", businessType = BusinessType.UPDATE)
    @PostMapping("/review")
    public R<Void> review(@Valid @RequestBody PingIpFeedbackReviewBo bo) {
        return toAjax(ipFeedbackService.review(bo));
    }
}
