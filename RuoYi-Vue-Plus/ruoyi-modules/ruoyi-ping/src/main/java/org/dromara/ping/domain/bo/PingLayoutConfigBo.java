package org.dromara.ping.domain.bo;

import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.ping.domain.PingLayoutConfig;

import java.io.Serial;

@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = PingLayoutConfig.class, reverseConvertGenerate = false)
public class PingLayoutConfigBo extends BaseEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @NotNull(message = "ID不能为空", groups = { EditGroup.class })
    private Long id;

    @NotBlank(message = "配置标识不能为空", groups = { AddGroup.class, EditGroup.class })
    private String configKey;

    @NotBlank(message = "站点名称不能为空", groups = { AddGroup.class, EditGroup.class })
    private String siteName;

    @NotBlank(message = "Header Logo不能为空", groups = { AddGroup.class, EditGroup.class })
    private String logoUrl;

    private String footerLogoUrl;
    private String footerSlogan;
    private String copyright;
    private String icpText;
    private String icpUrl;
    private String serviceText;
    private String serviceLinkText;
    private String serviceLinkUrl;
    private String navItemsJson;
    private String footerColumnsJson;
    private String friendshipLinksJson;
    private String announcementsJson;
    private String homeToolsJson;

    @NotBlank(message = "状态不能为空", groups = { AddGroup.class, EditGroup.class })
    private String status;

    private String remark;
}
