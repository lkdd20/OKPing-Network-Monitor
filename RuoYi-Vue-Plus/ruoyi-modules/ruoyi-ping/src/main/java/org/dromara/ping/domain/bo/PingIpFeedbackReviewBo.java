package org.dromara.ping.domain.bo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class PingIpFeedbackReviewBo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @NotNull(message = "反馈ID不能为空")
    private Long id;

    @NotBlank(message = "审核结果不能为空")
    @Pattern(regexp = "approved|rejected", message = "审核结果仅支持 approved 或 rejected")
    private String status;

    @Size(max = 512, message = "审核备注长度不能超过512个字符")
    private String reviewRemark;
}
