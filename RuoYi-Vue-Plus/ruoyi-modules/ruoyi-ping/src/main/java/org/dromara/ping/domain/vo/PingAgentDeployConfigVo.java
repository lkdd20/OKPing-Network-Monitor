package org.dromara.ping.domain.vo;

import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.ping.domain.PingAgentDeployConfig;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

@Data
@AutoMapper(target = PingAgentDeployConfig.class)
public class PingAgentDeployConfigVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private String configKey;
    private Long amd64ImageOssId;
    private String amd64ImageUrl;
    private String amd64ImageFileName;
    private Long arm64ImageOssId;
    private String arm64ImageUrl;
    private String arm64ImageFileName;
    private String imageName;
    private String masterUrl;
    private String dockerInstallTemplate;
    private String firstDeployTemplate;
    private String updateTemplate;
    private String remark;
    private Date updateTime;
}
