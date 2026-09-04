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
import org.dromara.ping.domain.bo.PingLayoutConfigBo;
import org.dromara.ping.domain.vo.PingLayoutConfigVo;
import org.dromara.ping.domain.vo.PingPublicLayoutConfigVo;
import org.dromara.ping.service.IPingLayoutConfigService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * ping 1.0 public header/footer layout configuration.
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/ping/layout-config")
public class PingLayoutConfigController extends BaseController {

    private final IPingLayoutConfigService layoutConfigService;

    @SaIgnore
    @GetMapping("/public/{configKey}")
    public R<PingPublicLayoutConfigVo> publicConfig(
        @NotBlank(message = "配置标识不能为空") @PathVariable String configKey
    ) {
        return R.ok(layoutConfigService.queryPublicConfig(configKey));
    }

    @SaCheckPermission("ping:layoutConfig:list")
    @GetMapping("/list")
    public TableDataInfo<PingLayoutConfigVo> list(PingLayoutConfigBo bo, PageQuery pageQuery) {
        return layoutConfigService.queryPageList(bo, pageQuery);
    }

    @SaCheckPermission("ping:layoutConfig:export")
    @Log(title = "ping 1.0 站点布局配置", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(PingLayoutConfigBo bo, HttpServletResponse response) {
        List<PingLayoutConfigVo> list = layoutConfigService.queryList(bo);
        ExcelUtil.exportExcel(list, "ping 1.0 站点布局配置", PingLayoutConfigVo.class, response);
    }

    @SaCheckPermission("ping:layoutConfig:query")
    @GetMapping("/{id}")
    public R<PingLayoutConfigVo> getInfo(@NotNull(message = "主键不能为空") @PathVariable Long id) {
        return R.ok(layoutConfigService.queryById(id));
    }

    @SaCheckPermission("ping:layoutConfig:add")
    @Log(title = "ping 1.0 站点布局配置", businessType = BusinessType.INSERT)
    @RepeatSubmit
    @PostMapping
    public R<Void> add(@Validated(AddGroup.class) @RequestBody PingLayoutConfigBo bo) {
        return toAjax(layoutConfigService.insertByBo(bo));
    }

    @SaCheckPermission("ping:layoutConfig:edit")
    @Log(title = "ping 1.0 站点布局配置", businessType = BusinessType.UPDATE)
    @RepeatSubmit
    @PutMapping
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody PingLayoutConfigBo bo) {
        return toAjax(layoutConfigService.updateByBo(bo));
    }

    @SaCheckPermission("ping:layoutConfig:remove")
    @Log(title = "ping 1.0 站点布局配置", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空") @PathVariable Long[] ids) {
        return toAjax(layoutConfigService.deleteWithValidByIds(List.of(ids), true));
    }
}
