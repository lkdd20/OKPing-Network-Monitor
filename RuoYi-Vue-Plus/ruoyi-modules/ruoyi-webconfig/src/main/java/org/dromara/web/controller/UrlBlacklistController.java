package org.dromara.web.controller;

import java.util.List;

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
import org.dromara.web.domain.vo.UrlBlacklistInfoVo;
import org.dromara.web.domain.vo.UrlBlacklistVo;
import org.dromara.web.domain.bo.UrlBlacklistBo;
import org.dromara.web.service.IUrlBlacklistService;
import org.dromara.common.mybatis.core.page.TableDataInfo;

/**
 * 域名黑名单
 *
 * @author Lion Li
 * @date 2026-05-20
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/web/blacklist")
public class UrlBlacklistController extends BaseController {

    private final IUrlBlacklistService urlBlacklistService;

    /**
     * 查询域名黑名单列表
     */
    @SaCheckPermission("web:blacklist:list")
    @GetMapping("/list")
    public TableDataInfo<UrlBlacklistVo> list(UrlBlacklistBo bo, PageQuery pageQuery) {
        return urlBlacklistService.queryPageList(bo, pageQuery);
    }

    /**
     * 查询 URL/IP 是否命中黑名单
     */
    @SaIgnore
    @GetMapping("/info")
    public R<UrlBlacklistInfoVo> info(@RequestParam String value) {
        return R.ok(urlBlacklistService.queryInfo(value));
    }

    /**
     * 导出域名黑名单列表
     */
    @SaCheckPermission("web:blacklist:export")
    @Log(title = "域名黑名单", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(UrlBlacklistBo bo, HttpServletResponse response) {
        List<UrlBlacklistVo> list = urlBlacklistService.queryList(bo);
        ExcelUtil.exportExcel(list, "域名黑名单", UrlBlacklistVo.class, response);
    }

    /**
     * 获取域名黑名单详细信息
     *
     * @param id 主键
     */
    @SaCheckPermission("web:blacklist:query")
    @GetMapping("/{id}")
    public R<UrlBlacklistVo> getInfo(@NotNull(message = "主键不能为空")
                                     @PathVariable Long id) {
        return R.ok(urlBlacklistService.queryById(id));
    }

    /**
     * 新增域名黑名单
     */
    @SaCheckPermission("web:blacklist:add")
    @Log(title = "域名黑名单", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping()
    public R<Void> add(@Validated(AddGroup.class) @RequestBody UrlBlacklistBo bo) {
        return toAjax(urlBlacklistService.insertByBo(bo));
    }

    /**
     * 修改域名黑名单
     */
    @SaCheckPermission("web:blacklist:edit")
    @Log(title = "域名黑名单", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping()
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody UrlBlacklistBo bo) {
        return toAjax(urlBlacklistService.updateByBo(bo));
    }

    /**
     * 删除域名黑名单
     *
     * @param ids 主键串
     */
    @SaCheckPermission("web:blacklist:remove")
    @Log(title = "域名黑名单", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空")
                          @PathVariable Long[] ids) {
        return toAjax(urlBlacklistService.deleteWithValidByIds(List.of(ids), true));
    }
}
