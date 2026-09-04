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
import org.dromara.web.domain.vo.FriendshipLinksVo;
import org.dromara.web.domain.bo.FriendshipLinksBo;
import org.dromara.web.service.IFriendshipLinksService;
import org.dromara.common.mybatis.core.page.TableDataInfo;

/**
 * 友情链接
 *
 * @author Lion Li
 * @date 2026-05-14
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/web/links")
public class FriendshipLinksController extends BaseController {

    private final IFriendshipLinksService friendshipLinksService;

    /**
     * 查询友情链接列表
     */
    @SaCheckPermission("web:links:list")
    @GetMapping("/list")
    public TableDataInfo<FriendshipLinksVo> list(FriendshipLinksBo bo, PageQuery pageQuery) {
        return friendshipLinksService.queryPageList(bo, pageQuery);
    }

    /**
     * 查询全部友情链接列表
     */
    @SaIgnore
    @GetMapping("/lists")
    public R<List<FriendshipLinksVo>> lists() {
        return R.ok(friendshipLinksService.queryCachedList());
    }

    /**
     * 导出友情链接列表
     */
    @SaCheckPermission("web:links:export")
    @Log(title = "友情链接", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(FriendshipLinksBo bo, HttpServletResponse response) {
        List<FriendshipLinksVo> list = friendshipLinksService.queryList(bo);
        ExcelUtil.exportExcel(list, "友情链接", FriendshipLinksVo.class, response);
    }

    /**
     * 获取友情链接详细信息
     *
     * @param id 主键
     */
    @SaCheckPermission("web:links:query")
    @GetMapping("/{id}")
    public R<FriendshipLinksVo> getInfo(@NotNull(message = "主键不能为空")
                                     @PathVariable Long id) {
        return R.ok(friendshipLinksService.queryById(id));
    }

    /**
     * 新增友情链接
     */
    @SaCheckPermission("web:links:add")
    @Log(title = "友情链接", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping()
    public R<Void> add(@Validated(AddGroup.class) @RequestBody FriendshipLinksBo bo) {
        return toAjax(friendshipLinksService.insertByBo(bo));
    }

    /**
     * 修改友情链接
     */
    @SaCheckPermission("web:links:edit")
    @Log(title = "友情链接", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping()
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody FriendshipLinksBo bo) {
        return toAjax(friendshipLinksService.updateByBo(bo));
    }

    /**
     * 删除友情链接
     *
     * @param ids 主键串
     */
    @SaCheckPermission("web:links:remove")
    @Log(title = "友情链接", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空")
                          @PathVariable Long[] ids) {
        return toAjax(friendshipLinksService.deleteWithValidByIds(List.of(ids), true));
    }
}
