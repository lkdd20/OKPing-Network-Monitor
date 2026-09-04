package org.dromara.web.controller;

import java.util.List;
import java.util.Map;

import cn.dev33.satoken.annotation.SaIgnore;
import lombok.RequiredArgsConstructor;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.*;
import cn.dev33.satoken.annotation.SaCheckPermission;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;
import org.dromara.common.idempotent.annotation.RepeatSubmit;
import org.dromara.common.log.annotation.Log;
import org.dromara.common.web.core.BaseController;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.core.domain.R;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.log.enums.BusinessType;
import org.dromara.common.excel.utils.ExcelUtil;
import org.dromara.web.domain.vo.AdLinksListVo;
import org.dromara.web.domain.vo.AdLinksVo;
import org.dromara.web.domain.bo.AdLinksBo;
import org.dromara.web.service.IAdLinksService;
import org.dromara.common.mybatis.core.page.TableDataInfo;

/**
 * 广告链接
 *
 * @author Lion Li
 * @date 2026-05-15
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/web/adLinks")
public class AdLinksController extends BaseController {

    private final IAdLinksService adLinksService;

    /**
     * 查询广告链接列表
     */
    @SaCheckPermission("web:adLinks:list")
    @GetMapping("/list")
    public TableDataInfo<AdLinksVo> list(AdLinksBo bo, PageQuery pageQuery) {
        return adLinksService.queryPageList(bo, pageQuery);
    }

    /**
     * 查询全部广告链接列表
     */
    @SaIgnore
    @GetMapping("/lists")
    public R<Map<String, List<AdLinksListVo>>> lists() {
        return R.ok(adLinksService.queryCachedList());
    }

    /**
     * 导出广告链接列表
     */
    @SaCheckPermission("web:adLinks:export")
    @Log(title = "广告链接", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(AdLinksBo bo, HttpServletResponse response) {
        List<AdLinksVo> list = adLinksService.queryList(bo);
        ExcelUtil.exportExcel(list, "广告链接", AdLinksVo.class, response);
    }

    /**
     * 获取广告链接详细信息
     *
     * @param id 主键
     */
    @SaCheckPermission("web:adLinks:query")
    @GetMapping("/{id}")
    public R<AdLinksVo> getInfo(@NotNull(message = "主键不能为空")
                                     @PathVariable Long id) {
        return R.ok(adLinksService.queryById(id));
    }

    /**
     * 新增广告链接
     */
    @SaCheckPermission("web:adLinks:add")
    @Log(title = "广告链接", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping()
    public R<Void> add(@Validated(AddGroup.class) @RequestBody AdLinksBo bo) {
        return toAjax(adLinksService.insertByBo(bo));
    }

    /**
     * 修改广告链接
     */
    @SaCheckPermission("web:adLinks:edit")
    @Log(title = "广告链接", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping()
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody AdLinksBo bo) {
        return toAjax(adLinksService.updateByBo(bo));
    }

    /**
     * 删除广告链接
     *
     * @param ids 主键串
     */
    @SaCheckPermission("web:adLinks:remove")
    @Log(title = "广告链接", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空")
                          @PathVariable Long[] ids) {
        return toAjax(adLinksService.deleteWithValidByIds(List.of(ids), true));
    }
}
