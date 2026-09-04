package org.dromara.ping.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;
import java.util.List;

@Data
public class PingIssueVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private Long userId;
    private String userName;
    private String nickname;
    private String issueType;
    private String title;
    private String content;
    private List<PingIssueAttachmentVo> attachments;
    private List<PingIssueMessageVo> messages;
    private String status;
    private Boolean publicVisible;
    private String adminReply;
    private Long replyUserId;
    private String replyUserName;
    private Date replyTime;
    private String remark;
    private Date createTime;
    private Date updateTime;
}
