package org.dromara.web.domain.bo;

import org.dromara.web.domain.FriendshipLinks;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.validation.constraints.*;

/**
 * 友情链接业务对象 friendship_links
 *
 * @author Lion Li
 * @date 2026-05-14
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = FriendshipLinks.class, reverseConvertGenerate = false)
public class FriendshipLinksBo extends BaseEntity {

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
     * 连接地址
     */
    @NotBlank(message = "连接地址不能为空", groups = { AddGroup.class, EditGroup.class })
    private String url;

    /**
     * 权重
     */
    @NotNull(message = "权重不能为空", groups = { AddGroup.class, EditGroup.class })
    private Long weight;


}
