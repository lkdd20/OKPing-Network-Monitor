package org.dromara.ping.domain.bo;

import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.ping.domain.PingAgentDeployConfig;

import java.io.Serial;

@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = PingAgentDeployConfig.class, reverseConvertGenerate = false)
public class PingAgentDeployConfigBo extends BaseEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private String configKey;

    @NotNull(message = "x86_64 Agent镜像不能为空")
    private Long amd64ImageOssId;

    @NotNull(message = "ARM64 Agent镜像不能为空")
    private Long arm64ImageOssId;

    @NotBlank(message = "运行镜像名不能为空")
    private String imageName;

    @NotBlank(message = "主控地址不能为空")
    private String masterUrl;

    @NotBlank(message = "Docker安装命令模板不能为空")
    private String dockerInstallTemplate;

    @NotBlank(message = "首次部署命令模板不能为空")
    private String firstDeployTemplate;

    @NotBlank(message = "更新命令模板不能为空")
    private String updateTemplate;

    private String remark;
}
