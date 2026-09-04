package org.dromara.ping.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import cn.dev33.satoken.annotation.SaIgnore;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.log.annotation.Log;
import org.dromara.common.log.enums.BusinessType;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.common.web.core.BaseController;
import org.dromara.ping.domain.bo.PingIssueAdminMessageBo;
import org.dromara.ping.domain.bo.PingIssueMessageSubmitBo;
import org.dromara.ping.domain.bo.PingIssueMessageVisibilityBo;
import org.dromara.ping.domain.bo.PingIssueQueryBo;
import org.dromara.ping.domain.bo.PingIssueReviewBo;
import org.dromara.ping.domain.bo.PingIssueSubmitBo;
import org.dromara.ping.domain.vo.PingIssueVo;
import org.dromara.ping.domain.vo.PingPublicIssuePageVo;
import org.dromara.ping.domain.vo.PingPublicIssueVo;
import org.dromara.ping.service.IPingIssueService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/ping/issues")
public class PingIssueController extends BaseController {

    private final IPingIssueService issueService;

    @Log(title = "用户问题反馈", businessType = BusinessType.INSERT)
    @PostMapping
    public R<Long> submit(
        @Valid @ModelAttribute PingIssueSubmitBo bo,
        @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        return R.ok("反馈提交成功", issueService.submit(bo, files));
    }

    @GetMapping("/mine")
    public TableDataInfo<PingIssueVo> mine(String category, PageQuery pageQuery) {
        return issueService.queryMine(category, pageQuery);
    }

    @GetMapping("/mine/{id}")
    public R<PingIssueVo> mineDetail(@PathVariable Long id) {
        return R.ok(issueService.getMine(id));
    }

    @Log(title = "用户问题反馈回复", businessType = BusinessType.INSERT)
    @PostMapping("/mine/{id}/messages")
    public R<Long> addMineMessage(
        @PathVariable Long id,
        @Valid @RequestBody PingIssueMessageSubmitBo bo) {
        return R.ok("回复成功", issueService.addMineMessage(id, bo));
    }

    @SaIgnore
    @GetMapping("/public")
    public R<PingPublicIssuePageVo> publicList(String keyword, Integer pageNum, Integer pageSize) {
        return R.ok(issueService.queryPublicPage(keyword, pageNum, pageSize));
    }

    @SaIgnore
    @GetMapping("/public/{id}")
    public R<PingPublicIssueVo> publicDetail(@PathVariable Long id) {
        return R.ok(issueService.getPublic(id));
    }

    @SaCheckPermission("ping:issue:list")
    @GetMapping("/list")
    public TableDataInfo<PingIssueVo> list(PingIssueQueryBo bo, PageQuery pageQuery) {
        return issueService.queryAdminPage(bo, pageQuery);
    }

    @SaCheckPermission("ping:issue:query")
    @GetMapping("/{id}")
    public R<PingIssueVo> detail(@PathVariable Long id) {
        return R.ok(issueService.getAdmin(id));
    }

    @SaCheckPermission("ping:issue:reply")
    @Log(title = "用户问题反馈处理", businessType = BusinessType.UPDATE)
    @PutMapping("/review")
    public R<Void> review(@Valid @RequestBody PingIssueReviewBo bo) {
        return toAjax(issueService.review(bo));
    }

    @SaCheckPermission("ping:issue:reply")
    @Log(title = "管理员问题反馈回复", businessType = BusinessType.INSERT)
    @PostMapping("/{id}/messages")
    public R<Long> addAdminMessage(
        @PathVariable Long id,
        @Valid @RequestBody PingIssueAdminMessageBo bo) {
        return R.ok("回复成功", issueService.addAdminMessage(id, bo));
    }

    @SaCheckPermission("ping:issue:reply")
    @Log(title = "问题反馈消息公开状态", businessType = BusinessType.UPDATE)
    @PutMapping("/messages/visibility")
    public R<Void> updateMessageVisibility(@Valid @RequestBody PingIssueMessageVisibilityBo bo) {
        return toAjax(issueService.updateMessageVisibility(bo));
    }
}
