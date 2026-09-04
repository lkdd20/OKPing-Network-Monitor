package org.dromara.ping.domain.bo;

import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.ping.domain.PingMilestone;

import java.io.Serial;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = PingMilestone.class, reverseConvertGenerate = false)
public class PingMilestoneBo extends BaseEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @NotNull(message = "里程碑ID不能为空", groups = EditGroup.class)
    private Long id;

    @NotNull(message = "发生月份不能为空", groups = { AddGroup.class, EditGroup.class })
    private LocalDate milestoneDate;

    @NotBlank(message = "里程碑内容不能为空", groups = { AddGroup.class, EditGroup.class })
    @Size(max = 1000, message = "里程碑内容不能超过1000个字符", groups = { AddGroup.class, EditGroup.class })
    private String content;

    @NotBlank(message = "状态不能为空", groups = { AddGroup.class, EditGroup.class })
    private String status;

    private Long sortOrder;

    @Size(max = 512, message = "备注不能超过512个字符", groups = { AddGroup.class, EditGroup.class })
    private String remark;

    private String keyword;
}
