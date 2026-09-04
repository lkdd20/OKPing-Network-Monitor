package org.dromara.web.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.tenant.core.TenantEntity;

import java.io.Serial;

/**
 * 赞助商对象 sponsors
 *
 * @author Lion Li
 * @date 2026-06-04
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sponsors")
public class Sponsors extends TenantEntity {

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
     * 链接地址
     */
    private String url;

    /**
     * 图片地址
     */
    private String imgUrl;

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
