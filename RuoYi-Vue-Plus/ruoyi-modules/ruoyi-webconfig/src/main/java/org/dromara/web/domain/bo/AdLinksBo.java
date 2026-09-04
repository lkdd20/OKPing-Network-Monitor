package org.dromara.web.domain.bo;

import org.dromara.web.domain.AdLinks;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.validation.constraints.*;
import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * 广告链接业务对象 ad_links
 *
 * @author Lion Li
 * @date 2026-05-15
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = AdLinks.class, reverseConvertGenerate = false)
public class AdLinksBo extends BaseEntity {

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
     * 类型
     */
    @NotBlank(message = "类型不能为空", groups = { AddGroup.class, EditGroup.class })
    private String type;

    /**
     * 连接地址
     */
    @NotBlank(message = "连接地址不能为空", groups = { AddGroup.class, EditGroup.class })
    private String url;

    /**
     * 图片地址
     */
    @NotBlank(message = "图片地址不能为空", groups = { AddGroup.class, EditGroup.class })
    private String imgUrl;

    /**
     * 到期时间
     */
    @NotNull(message = "到期时间不能为空", groups = { AddGroup.class, EditGroup.class })
    private Date delTime;

    /**
     * 权重
     */
    @NotNull(message = "权重不能为空", groups = { AddGroup.class, EditGroup.class })
    private Long weight;


}
