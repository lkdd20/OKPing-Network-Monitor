package org.dromara.ping.domain.bo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PingIssueReviewBo {

    @NotNull(message = "反馈ID不能为空")
    private Long id;

    @NotBlank(message = "请选择处理状态")
    @Pattern(regexp = "pending|processing|resolved|closed", message = "处理状态无效")
    private String status;

    @NotNull(message = "请选择是否公开")
    private Boolean publicVisible;

    @Size(max = 512, message = "后台备注不能超过512个字")
    private String remark;
}
