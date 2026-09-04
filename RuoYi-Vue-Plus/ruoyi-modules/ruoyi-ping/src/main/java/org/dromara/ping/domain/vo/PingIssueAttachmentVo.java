package org.dromara.ping.domain.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PingIssueAttachmentVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long ossId;
    private String url;
    private String originalName;
    private Long size;
}
