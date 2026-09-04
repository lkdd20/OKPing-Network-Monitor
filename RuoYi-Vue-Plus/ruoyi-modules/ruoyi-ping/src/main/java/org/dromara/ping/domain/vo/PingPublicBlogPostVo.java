package org.dromara.ping.domain.vo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
public class PingPublicBlogPostVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private String title;
    private String slug;
    private String summary;
    @JsonIgnore
    private Long coverOssId;
    private String coverUrl;
    private String category;
    private List<String> tags = new ArrayList<>();
    private Boolean featured;
    private Date publishTime;
    private Date updateTime;
}
