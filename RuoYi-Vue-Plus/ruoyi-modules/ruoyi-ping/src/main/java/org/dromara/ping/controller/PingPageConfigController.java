package org.dromara.ping.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import cn.dev33.satoken.annotation.SaIgnore;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.excel.utils.ExcelUtil;
import org.dromara.common.idempotent.annotation.RepeatSubmit;
import org.dromara.common.log.annotation.Log;
import org.dromara.common.log.enums.BusinessType;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.common.web.core.BaseController;
import org.dromara.ping.domain.bo.PingPageConfigBo;
import org.dromara.ping.domain.bo.PingPageConfigLangBo;
import org.dromara.ping.domain.vo.PingPageConfigVo;
import org.dromara.ping.domain.vo.PingPublicPageConfigVo;
import org.dromara.ping.service.IPingPageConfigService;
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

/**
 * ping 1.0 page SEO/content configuration.
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/ping/page-config")
public class PingPageConfigController extends BaseController {

    private final IPingPageConfigService pageConfigService;

    @SaIgnore
    @GetMapping("/public/{pageKey}")
    public R<PingPublicPageConfigVo> publicConfig(

        @NotBlank(message = "页面标识不能为空")
        @PathVariable String pageKey,

        @RequestParam(required = false) String target,

        @RequestParam(required = false) String canonicalPath
    ) {
//        if (!PingPageConfigLangBo.isValidLang(lang)) {
//            throw new IllegalArgumentException(
//                "Unsupported language: " + lang
//            );
//        }
        return R.ok(
            pageConfigService.queryPublicConfig(
                pageKey,
                target,
                canonicalPath
            )
        );
    }

    @SaCheckPermission("ping:pageConfig:list")
    @GetMapping("/list")
    public TableDataInfo<PingPageConfigVo> list(PingPageConfigBo bo, PageQuery pageQuery) {
        return pageConfigService.queryPageList(bo, pageQuery);
    }

    @SaCheckPermission("ping:pageConfig:export")
    @Log(title = "ping 1.0 页面配置", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(PingPageConfigBo bo, HttpServletResponse response) {
        List<PingPageConfigVo> list = pageConfigService.queryList(bo);
        ExcelUtil.exportExcel(list, "ping 1.0 页面配置", PingPageConfigVo.class, response);
    }

    @SaCheckPermission("ping:pageConfig:query")
    @GetMapping("/{id}")
    public R<PingPageConfigVo> getInfo(@NotNull(message = "主键不能为空") @PathVariable Long id) {
        return R.ok(pageConfigService.queryById(id));
    }

    @SaCheckPermission("ping:pageConfig:add")
    @Log(title = "ping 1.0 页面配置", businessType = BusinessType.INSERT)
    @RepeatSubmit
    @PostMapping
    public R<Void> add(@Validated(AddGroup.class) @RequestBody PingPageConfigBo bo) {
        return toAjax(pageConfigService.insertByBo(bo));
    }

    @SaCheckPermission("ping:pageConfig:edit")
    @Log(title = "ping 1.0 页面配置", businessType = BusinessType.UPDATE)
    @RepeatSubmit
    @PutMapping
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody PingPageConfigBo bo) {
        return toAjax(pageConfigService.updateByBo(bo));
    }

    @SaCheckPermission("ping:pageConfig:remove")
    @Log(title = "ping 1.0 页面配置", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空") @PathVariable Long[] ids) {
        return toAjax(pageConfigService.deleteWithValidByIds(List.of(ids), true));
    }
}
