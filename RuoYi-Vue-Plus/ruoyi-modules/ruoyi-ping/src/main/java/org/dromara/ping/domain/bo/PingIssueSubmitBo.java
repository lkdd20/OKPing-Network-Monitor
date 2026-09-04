package org.dromara.ping.domain.bo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PingIssueSubmitBo {

    @NotBlank(message = "请选择反馈类型")
    @Pattern(regexp = "problem|suggestion|cooperation", message = "反馈类型无效")
    private String issueType;

    @NotBlank(message = "反馈标题不能为空")
    @Size(max = 120, message = "反馈标题不能超过120个字")
    private String title;

    @NotBlank(message = "反馈内容不能为空")
    @Size(max = 5000, message = "反馈内容不能超过5000个字")
    private String content;
}
