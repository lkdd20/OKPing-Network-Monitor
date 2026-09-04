package org.dromara.ping.domain.bo;

import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.ping.domain.PingPageConfig;

import java.io.Serial;

@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = PingPageConfig.class, reverseConvertGenerate = false)
public class PingPageConfigBo extends BaseEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @NotNull(message = "ID不能为空", groups = { EditGroup.class })
    private Long id;

    @NotBlank(message = "页面标识不能为空", groups = { AddGroup.class, EditGroup.class })
    private String pageKey;

    @NotBlank(message = "页面名称不能为空", groups = { AddGroup.class, EditGroup.class })
    private String pageName;

    @NotBlank(message = "标题模板不能为空", groups = { AddGroup.class, EditGroup.class })
    private String titleTemplate;

    @NotBlank(message = "描述模板不能为空", groups = { AddGroup.class, EditGroup.class })
    private String descriptionTemplate;

    private String keywordsTemplate;
    private String h1Template;
    private String introTemplate;

    @NotBlank(message = "状态不能为空", groups = { AddGroup.class, EditGroup.class })
    private String status;

    private Long sortOrder;
    private String remark;
}
