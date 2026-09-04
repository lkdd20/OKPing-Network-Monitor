package org.dromara.web.domain;

import org.dromara.common.tenant.core.TenantEntity;
import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.io.Serial;

/**
 * 域名黑名单对象 url_blacklist
 *
 * @author Lion Li
 * @date 2026-05-20
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("url_blacklist")
public class UrlBlacklist extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * ID
     */
    @TableId(value = "id")
    private Long id;

    /**
     * 匹配值
     */
    private String value;

    /**
     * 是否生效
     */
    private Long status;

    /**
     * 拦截到期时间
     */
    private Date stopTime;

    /**
     * 删除标志
     */
    @TableLogic
    private Long delFlag;


}
