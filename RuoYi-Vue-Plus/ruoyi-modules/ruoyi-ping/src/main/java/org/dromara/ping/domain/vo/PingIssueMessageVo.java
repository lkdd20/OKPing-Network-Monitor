package org.dromara.ping.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;
import java.util.List;

@Data
public class PingIssueMessageVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private Long issueId;
    private Long senderUserId;
    private String senderName;
    private String senderType;
    private String content;
    private List<PingIssueAttachmentVo> attachments;
    private Boolean publicVisible;
    private Date createTime;
    private Date updateTime;
}
