package org.dromara.ping.domain.bo;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PingIssueMessageVisibilityBo {

    @NotNull(message = "消息ID不能为空")
    private Long id;

    @NotNull(message = "请选择消息是否公开")
    private Boolean publicVisible;
}
