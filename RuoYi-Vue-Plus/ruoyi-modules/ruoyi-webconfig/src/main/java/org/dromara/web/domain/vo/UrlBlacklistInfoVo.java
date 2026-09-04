package org.dromara.web.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 域名黑名单拦截检查视图对象
 *
 * @author Lion Li
 * @date 2026-05-20
 */
@Data
public class UrlBlacklistInfoVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 是否命中黑名单
     */
    private Boolean blocked;

    /**
     * 查询值
     */
    private String queryValue;

    /**
     * 命中的规则值
     */
    private String value;

    /**
     * 匹配类型：exact 精确，fuzzy 模糊
     */
    private String matchType;

    /**
     * 是否生效
     */
    private Long status;

    /**
     * 拦截到期时间
     */
    private Date stopTime;

}
