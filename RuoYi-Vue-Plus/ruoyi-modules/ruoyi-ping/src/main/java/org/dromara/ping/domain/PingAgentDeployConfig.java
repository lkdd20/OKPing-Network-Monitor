package org.dromara.ping.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.mybatis.core.domain.BaseEntity;

import java.io.Serial;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("ping_agent_deploy_config")
public class PingAgentDeployConfig extends BaseEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private String configKey;
    private Long amd64ImageOssId;
    private Long arm64ImageOssId;
    private String imageName;
    private String masterUrl;
    private String dockerInstallTemplate;
    private String firstDeployTemplate;
    private String updateTemplate;
    private String remark;
}
