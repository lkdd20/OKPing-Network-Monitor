package org.dromara.ping.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.tenant.core.TenantEntity;

import java.io.Serial;
import java.util.Date;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("ping_issue")
public class PingIssue extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.ASSIGN_ID)
    private Long id;

    private Long userId;
    private String userName;
    private String nickname;
    private String issueType;
    private String title;
    private String content;
    private String attachmentsJson;
    private String status;
    private Boolean publicVisible;
    private String adminReply;
    private Long replyUserId;
    private String replyUserName;
    private Date replyTime;
    private String remark;
}
