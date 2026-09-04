package org.dromara.ping.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;
import java.util.List;

@Data
public class PingPublicIssueVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private String authorName;
    private String issueType;
    private String title;
    private String content;
    private List<PingIssueAttachmentVo> attachments;
    private List<PingIssueMessageVo> messages;
    private String status;
    private String adminReply;
    private String replyUserName;
    private Date replyTime;
    private Date createTime;
    private Date updateTime;
}
