package org.dromara.ping.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class PingPublicPageConfigVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String pageKey;
    private String pageName;
    private String title;
    private String description;
    private String keywords;
    private String h1;
    private String intro;
    private String target;
    private String canonicalPath;
    private Boolean enabled;
}
