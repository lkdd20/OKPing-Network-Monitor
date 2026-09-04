package org.dromara.ping.domain.bo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.mybatis.core.domain.BaseEntity;

import java.io.Serial;

@Data
@EqualsAndHashCode(callSuper = true)
public class PingProductBetaSignupBo extends BaseEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @NotNull(message = "报名记录ID不能为空", groups = EditGroup.class)
    private Long id;

    private String keyword;

    @NotBlank(message = "报名状态不能为空", groups = EditGroup.class)
    @Pattern(regexp = "^(registered|notified)$", message = "报名状态无效", groups = EditGroup.class)
    private String status;

    @Size(max = 512, message = "备注不能超过512个字符", groups = EditGroup.class)
    private String remark;
}
