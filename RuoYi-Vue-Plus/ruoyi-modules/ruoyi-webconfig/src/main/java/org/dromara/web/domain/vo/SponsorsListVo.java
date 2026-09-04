package org.dromara.web.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

/**
 * 赞助商公开列表视图对象
 *
 * @author Lion Li
 * @date 2026-06-04
 */
@Data
public class SponsorsListVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

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

}
