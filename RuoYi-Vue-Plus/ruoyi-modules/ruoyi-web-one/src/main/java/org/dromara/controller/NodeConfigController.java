package org.dromara.controller;

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
import org.dromara.domain.bo.NodeConfigAvailableBo;
import org.dromara.domain.vo.NodeConfigVo;
import org.dromara.domain.bo.NodeConfigBo;
import org.dromara.service.INodeConfigService;
import org.dromara.common.mybatis.core.page.TableDataInfo;

/**
 * 节点信息
 *
 * @author Lion Li
 * @date 2026-06-17
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/webone/nodeConfig")
public class NodeConfigController extends BaseController {

    private final INodeConfigService nodeConfigService;

    /**
     * 查询节点信息列表
     */
    @SaCheckPermission("webone:nodeConfig:list")
    @GetMapping("/list")
    public TableDataInfo<NodeConfigVo> list(NodeConfigBo bo, PageQuery pageQuery) {
        return nodeConfigService.queryPageList(bo, pageQuery);
    }

    /**
     * 导出节点信息列表
     */
    @SaCheckPermission("webone:nodeConfig:export")
    @Log(title = "节点信息", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(NodeConfigBo bo, HttpServletResponse response) {
        List<NodeConfigVo> list = nodeConfigService.queryList(bo);
        ExcelUtil.exportExcel(list, "节点信息", NodeConfigVo.class, response);
    }

    /**
     * 查询可用节点列表
     */
    @SaIgnore
    @PostMapping("/available")
    public R<List<NodeConfigVo>> available(@RequestBody(required = false) NodeConfigAvailableBo bo) {
        return R.ok(nodeConfigService.queryAvailableNodes(bo));
    }

    /**
     * 获取节点信息详细信息
     *
     * @param id 主键
     */
    @SaCheckPermission("webone:nodeConfig:query")
    @GetMapping("/{id}")
    public R<NodeConfigVo> getInfo(@NotNull(message = "主键不能为空")
                                     @PathVariable Long id) {
        return R.ok(nodeConfigService.queryById(id));
    }

    /**
     * 新增节点信息
     */
    @SaCheckPermission("webone:nodeConfig:add")
    @Log(title = "节点信息", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping()
    public R<Void> add(@Validated(AddGroup.class) @RequestBody NodeConfigBo bo) {
        return toAjax(nodeConfigService.insertByBo(bo));
    }

    /**
     * 修改节点信息
     */
    @SaCheckPermission("webone:nodeConfig:edit")
    @Log(title = "节点信息", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping()
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody NodeConfigBo bo) {
        return toAjax(nodeConfigService.updateByBo(bo));
    }

    /**
     * 删除节点信息
     *
     * @param ids 主键串
     */
    @SaCheckPermission("webone:nodeConfig:remove")
    @Log(title = "节点信息", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空")
                          @PathVariable Long[] ids) {
        return toAjax(nodeConfigService.deleteWithValidByIds(List.of(ids), true));
    }
}
