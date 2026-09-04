package org.dromara.ping.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Data
public class PingPublicBlogPageVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private List<PingPublicBlogPostVo> rows = new ArrayList<>();
    private List<String> categories = new ArrayList<>();
    private long total;
    private int pageNum;
    private int pageSize;
}
