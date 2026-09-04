package org.dromara.ping.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.mybatis.core.domain.BaseEntity;

import java.io.Serial;

/**
 * ping 1.0 public page SEO/content configuration.
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("ping_page_config")
public class PingPageConfig extends BaseEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private String pageKey;
    private String pageName;
    private String titleTemplate;
    private String descriptionTemplate;
    private String keywordsTemplate;
    private String h1Template;
    private String introTemplate;
    private String status;
    private Long sortOrder;
    private String remark;
}
