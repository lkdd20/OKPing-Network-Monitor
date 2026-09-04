package org.dromara.ping.domain.vo;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;

@Data
@EqualsAndHashCode(callSuper = true)
public class PingPublicBlogPostDetailVo extends PingPublicBlogPostVo {

    @Serial
    private static final long serialVersionUID = 1L;

    private String content;
    private String seoTitle;
    private String seoDescription;
    private String seoKeywords;
}
