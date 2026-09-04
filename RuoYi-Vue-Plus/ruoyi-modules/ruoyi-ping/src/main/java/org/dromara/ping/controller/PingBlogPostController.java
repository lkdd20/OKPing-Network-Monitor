package org.dromara.ping.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import cn.dev33.satoken.annotation.SaIgnore;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.idempotent.annotation.RepeatSubmit;
import org.dromara.common.log.annotation.Log;
import org.dromara.common.log.enums.BusinessType;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.common.web.core.BaseController;
import org.dromara.ping.domain.bo.PingBlogPostBo;
import org.dromara.ping.domain.vo.PingBlogPostVo;
import org.dromara.ping.domain.vo.PingPublicBlogPageVo;
import org.dromara.ping.domain.vo.PingPublicBlogPostDetailVo;
import org.dromara.ping.service.IPingBlogPostService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/ping/blog")
public class PingBlogPostController extends BaseController {

    private final IPingBlogPostService blogPostService;

    @SaIgnore
    @GetMapping("/public")
    public R<PingPublicBlogPageVo> publicList(
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) String category,
        @RequestParam(required = false) Integer pageNum,
        @RequestParam(required = false) Integer pageSize
    ) {
        return R.ok(blogPostService.queryPublicPage(keyword, category, pageNum, pageSize));
    }

    @SaIgnore
    @GetMapping("/public/{slug}")
    public R<PingPublicBlogPostDetailVo> publicDetail(@PathVariable String slug) {
        PingPublicBlogPostDetailVo post = blogPostService.queryPublicDetail(slug);
        return post == null ? R.fail(404, "文章不存在或尚未发布") : R.ok(post);
    }

    @SaCheckPermission("ping:blog:list")
    @GetMapping("/list")
    public TableDataInfo<PingBlogPostVo> list(PingBlogPostBo bo, PageQuery pageQuery) {
        return blogPostService.queryPageList(bo, pageQuery);
    }

    @SaCheckPermission("ping:blog:query")
    @GetMapping("/{id}")
    public R<PingBlogPostVo> getInfo(@NotNull(message = "文章ID不能为空") @PathVariable Long id) {
        return R.ok(blogPostService.queryById(id));
    }

    @SaCheckPermission("ping:blog:add")
    @Log(title = "ping 博客文章", businessType = BusinessType.INSERT)
    @RepeatSubmit
    @PostMapping
    public R<Void> add(@Validated(AddGroup.class) @RequestBody PingBlogPostBo bo) {
        return toAjax(blogPostService.insertByBo(bo));
    }

    @SaCheckPermission("ping:blog:edit")
    @Log(title = "ping 博客文章", businessType = BusinessType.UPDATE)
    @RepeatSubmit
    @PutMapping
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody PingBlogPostBo bo) {
        return toAjax(blogPostService.updateByBo(bo));
    }

    @SaCheckPermission("ping:blog:remove")
    @Log(title = "ping 博客文章", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "文章ID不能为空") @PathVariable Long[] ids) {
        return toAjax(blogPostService.deleteWithValidByIds(List.of(ids), true));
    }
}
