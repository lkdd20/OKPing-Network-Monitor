package org.dromara.web.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import cn.dev33.satoken.annotation.SaIgnore;
import jakarta.servlet.http.HttpServletResponse;
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
import org.dromara.web.domain.bo.SponsorsBo;
import org.dromara.web.domain.vo.SponsorsListVo;
import org.dromara.web.domain.vo.SponsorsVo;
import org.dromara.web.service.ISponsorsService;
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
 * 赞助商
 *
 * @author Lion Li
 * @date 2026-06-04
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/web/sponsors")
public class SponsorsController extends BaseController {

    private final ISponsorsService sponsorsService;

    /**
     * 查询赞助商列表
     */
    @SaCheckPermission("web:sponsors:list")
    @GetMapping("/list")
    public TableDataInfo<SponsorsVo> list(SponsorsBo bo, PageQuery pageQuery) {
        return sponsorsService.queryPageList(bo, pageQuery);
    }

    /**
     * 查询全部赞助商列表
     */
    @SaIgnore
    @GetMapping("/lists")
    public R<List<SponsorsListVo>> lists() {
        return R.ok(sponsorsService.queryCachedList());
    }

    /**
     * 导出赞助商列表
     */
    @SaCheckPermission("web:sponsors:export")
    @Log(title = "赞助商", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(SponsorsBo bo, HttpServletResponse response) {
        List<SponsorsVo> list = sponsorsService.queryList(bo);
        ExcelUtil.exportExcel(list, "赞助商", SponsorsVo.class, response);
    }

    /**
     * 获取赞助商详细信息
     *
     * @param id 主键
     */
    @SaCheckPermission("web:sponsors:query")
    @GetMapping("/{id}")
    public R<SponsorsVo> getInfo(@NotNull(message = "主键不能为空")
                                 @PathVariable Long id) {
        return R.ok(sponsorsService.queryById(id));
    }

    /**
     * 新增赞助商
     */
    @SaCheckPermission("web:sponsors:add")
    @Log(title = "赞助商", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping()
    public R<Void> add(@Validated(AddGroup.class) @RequestBody SponsorsBo bo) {
        return toAjax(sponsorsService.insertByBo(bo));
    }

    /**
     * 修改赞助商
     */
    @SaCheckPermission("web:sponsors:edit")
    @Log(title = "赞助商", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping()
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody SponsorsBo bo) {
        return toAjax(sponsorsService.updateByBo(bo));
    }

    /**
     * 删除赞助商
     *
     * @param ids 主键串
     */
    @SaCheckPermission("web:sponsors:remove")
    @Log(title = "赞助商", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空")
                          @PathVariable Long[] ids) {
        return toAjax(sponsorsService.deleteWithValidByIds(List.of(ids), true));
    }
}
