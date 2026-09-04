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
import org.dromara.ping.domain.bo.PingMilestoneBo;
import org.dromara.ping.domain.vo.PingMilestoneVo;
import org.dromara.ping.domain.vo.PingPublicMilestoneVo;
import org.dromara.ping.service.IPingMilestoneService;
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

@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/ping/milestone")
public class PingMilestoneController extends BaseController {

    private final IPingMilestoneService milestoneService;

    @SaIgnore
    @GetMapping("/public")
    public R<List<PingPublicMilestoneVo>> publicList() {
        return R.ok(milestoneService.queryPublicList());
    }

    @SaCheckPermission("ping:milestone:list")
    @GetMapping("/list")
    public TableDataInfo<PingMilestoneVo> list(PingMilestoneBo bo, PageQuery pageQuery) {
        return milestoneService.queryPageList(bo, pageQuery);
    }

    @SaCheckPermission("ping:milestone:query")
    @GetMapping("/{id}")
    public R<PingMilestoneVo> getInfo(@NotNull(message = "里程碑ID不能为空") @PathVariable Long id) {
        return R.ok(milestoneService.queryById(id));
    }

    @SaCheckPermission("ping:milestone:add")
    @Log(title = "项目里程碑", businessType = BusinessType.INSERT)
    @RepeatSubmit
    @PostMapping
    public R<Void> add(@Validated(AddGroup.class) @RequestBody PingMilestoneBo bo) {
        return toAjax(milestoneService.insertByBo(bo));
    }

    @SaCheckPermission("ping:milestone:edit")
    @Log(title = "项目里程碑", businessType = BusinessType.UPDATE)
    @RepeatSubmit
    @PutMapping
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody PingMilestoneBo bo) {
        return toAjax(milestoneService.updateByBo(bo));
    }

    @SaCheckPermission("ping:milestone:remove")
    @Log(title = "项目里程碑", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "里程碑ID不能为空") @PathVariable Long[] ids) {
        return toAjax(milestoneService.deleteWithValidByIds(List.of(ids), true));
    }
}
