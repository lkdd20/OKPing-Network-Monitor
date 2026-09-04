package org.dromara.ping.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.FieldStrategy;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.tenant.core.TenantEntity;
import org.apache.ibatis.type.JdbcType;

import java.io.Serial;
import java.util.Date;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("ping_blog_post")
public class PingBlogPost extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private String title;
    private String slug;
    private String summary;
    private String content;
    @TableField(updateStrategy = FieldStrategy.ALWAYS, jdbcType = JdbcType.BIGINT)
    private Long coverOssId;
    private String category;
    private String tags;
    private String status;
    private Boolean featured;
    private Long sortOrder;
    private Date publishTime;
    private String seoTitle;
    private String seoDescription;
    private String seoKeywords;
    private String remark;
}
