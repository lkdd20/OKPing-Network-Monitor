package org.dromara.web.domain.bo;

import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.web.domain.Sponsors;

/**
 * 赞助商业务对象 sponsors
 *
 * @author Lion Li
 * @date 2026-06-04
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = Sponsors.class, reverseConvertGenerate = false)
public class SponsorsBo extends BaseEntity {

    /**
     * 主键
     */
    @NotNull(message = "主键不能为空", groups = { EditGroup.class })
    private Long id;

    /**
     * 名称
     */
    @NotBlank(message = "名称不能为空", groups = { AddGroup.class, EditGroup.class })
    private String name;

    /**
     * 链接地址
     */
    @NotBlank(message = "链接地址不能为空", groups = { AddGroup.class, EditGroup.class })
    private String url;

    /**
     * 图片地址
     */
    @NotBlank(message = "图片地址不能为空", groups = { AddGroup.class, EditGroup.class })
    private String imgUrl;

    /**
     * 权重
     */
    private Long weight;

}
