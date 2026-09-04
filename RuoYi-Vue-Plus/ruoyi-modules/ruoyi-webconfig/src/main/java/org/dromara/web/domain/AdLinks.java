package org.dromara.web.domain;

import org.dromara.common.tenant.core.TenantEntity;
import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.io.Serial;

/**
 * 广告链接对象 ad_links
 *
 * @author Lion Li
 * @date 2026-05-15
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("ad_links")
public class AdLinks extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    @TableId(value = "id")
    private Long id;

    /**
     * 名称
     */
    private String name;

    /**
     * 类型
     */
    private String type;

    /**
     * 连接地址
     */
    private String url;

    /**
     * 图片地址
     */
    private String imgUrl;

    /**
     * 到期时间
     */
    private Date delTime;

    /**
     * 权重
     */
    private Long weight;

    /**
     * 删除标志
     */
    @TableLogic
    private Long delFlag;


}
