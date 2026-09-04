package org.dromara.ping.domain.bo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PingIssueAdminMessageBo {

    @NotBlank(message = "回复内容不能为空")
    @Size(max = 5000, message = "回复内容不能超过5000个字")
    private String content;

    @NotNull(message = "请选择回复是否公开")
    private Boolean publicVisible;
}
