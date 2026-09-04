package org.dromara.web.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

/**
 * 广告链接公开列表视图对象
 *
 * @author Lion Li
 * @date 2026-05-15
 */
@Data
public class AdLinksListVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 名称
     */
    private String name;

    /**
     * 连接地址
     */
    private String url;

    /**
     * 图片地址
     */
    private String imgUrl;

}
