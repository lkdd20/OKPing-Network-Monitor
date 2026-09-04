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
import org.dromara.ping.domain.PingBlogPost;

import java.io.Serial;
import java.util.Date;

@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = PingBlogPost.class, reverseConvertGenerate = false)
public class PingBlogPostBo extends BaseEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @NotNull(message = "文章ID不能为空", groups = EditGroup.class)
    private Long id;

    @NotBlank(message = "文章标题不能为空", groups = { AddGroup.class, EditGroup.class })
    @Size(max = 200, message = "文章标题不能超过200个字符", groups = { AddGroup.class, EditGroup.class })
    private String title;

    @Size(max = 160, message = "文章别名不能超过160个字符", groups = { AddGroup.class, EditGroup.class })
    private String slug;

    @NotBlank(message = "文章摘要不能为空", groups = { AddGroup.class, EditGroup.class })
    @Size(max = 500, message = "文章摘要不能超过500个字符", groups = { AddGroup.class, EditGroup.class })
    private String summary;

    @NotBlank(message = "文章正文不能为空", groups = { AddGroup.class, EditGroup.class })
    private String content;

    private Long coverOssId;

    @NotBlank(message = "文章分类不能为空", groups = { AddGroup.class, EditGroup.class })
    @Size(max = 64, message = "文章分类不能超过64个字符", groups = { AddGroup.class, EditGroup.class })
    private String category;

    @Size(max = 255, message = "文章标签不能超过255个字符", groups = { AddGroup.class, EditGroup.class })
    private String tags;

    @NotBlank(message = "发布状态不能为空", groups = { AddGroup.class, EditGroup.class })
    private String status;

    private Boolean featured;
    private Long sortOrder;
    private Date publishTime;
    private String seoTitle;
    private String seoDescription;
    private String seoKeywords;
    private String remark;

    private String keyword;
}
