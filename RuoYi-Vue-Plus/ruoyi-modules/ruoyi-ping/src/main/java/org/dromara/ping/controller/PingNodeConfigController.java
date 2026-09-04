package org.dromara.ping.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
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
import org.dromara.ping.domain.bo.PingAgentDeployConfigBo;
import org.dromara.ping.domain.bo.PingNodeConfigBo;
import org.dromara.ping.domain.vo.PingAgentDeployConfigVo;
import org.dromara.ping.domain.vo.PingAgentDeploymentVo;
import org.dromara.ping.domain.vo.PingNodeConfigVo;
import org.dromara.ping.service.IPingAgentDeployConfigService;
import org.dromara.ping.service.IPingNodeConfigService;
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
 * ping 1.0 node config management.
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/ping/node-config")
public class PingNodeConfigController extends BaseController {

    private final IPingNodeConfigService nodeConfigService;
    private final IPingAgentDeployConfigService agentDeployConfigService;

    @SaCheckPermission("ping:nodeConfig:query")
    @GetMapping("/agent-deploy-config")
    public R<PingAgentDeployConfigVo> getAgentDeployConfig() {
        return R.ok(agentDeployConfigService.queryConfig());
    }

    @SaCheckPermission("ping:nodeConfig:edit")
    @Log(title = "ping Agent部署配置", businessType = BusinessType.UPDATE)
    @RepeatSubmit
    @PutMapping("/agent-deploy-config")
    public R<Void> saveAgentDeployConfig(@Validated @RequestBody PingAgentDeployConfigBo bo) {
        return toAjax(agentDeployConfigService.saveConfig(bo));
    }

    @SaCheckPermission("ping:nodeConfig:query")
    @GetMapping("/{id}/agent-deployment")
    public R<PingAgentDeploymentVo> getAgentDeployment(
        @NotNull(message = "主键不能为空") @PathVariable Long id
    ) {
        return R.ok(agentDeployConfigService.buildDeployment(id));
    }

    @SaCheckPermission("ping:nodeConfig:list")
    @GetMapping("/list")
    public TableDataInfo<PingNodeConfigVo> list(PingNodeConfigBo bo, PageQuery pageQuery) {
        return nodeConfigService.queryPageList(bo, pageQuery);
    }

    @SaCheckPermission("ping:nodeConfig:export")
    @Log(title = "ping 1.0 节点配置", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(PingNodeConfigBo bo, HttpServletResponse response) {
        List<PingNodeConfigVo> list = nodeConfigService.queryList(bo);
        ExcelUtil.exportExcel(list, "ping 1.0 节点配置", PingNodeConfigVo.class, response);
    }

    @SaCheckPermission("ping:nodeConfig:query")
    @GetMapping("/{id}")
    public R<PingNodeConfigVo> getInfo(@NotNull(message = "主键不能为空") @PathVariable Long id) {
        return R.ok(nodeConfigService.queryById(id));
    }

    @SaCheckPermission("ping:nodeConfig:add")
    @Log(title = "ping 1.0 节点配置", businessType = BusinessType.INSERT)
    @RepeatSubmit
    @PostMapping
    public R<Void> add(@Validated(AddGroup.class) @RequestBody PingNodeConfigBo bo) {
        return toAjax(nodeConfigService.insertByBo(bo));
    }

    @SaCheckPermission("ping:nodeConfig:edit")
    @Log(title = "ping 1.0 节点配置", businessType = BusinessType.UPDATE)
    @RepeatSubmit
    @PutMapping
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody PingNodeConfigBo bo) {
        return toAjax(nodeConfigService.updateByBo(bo));
    }

    @SaCheckPermission("ping:nodeConfig:remove")
    @Log(title = "ping 1.0 节点配置", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空") @PathVariable Long[] ids) {
        return toAjax(nodeConfigService.deleteWithValidByIds(List.of(ids), true));
    }
}
