package org.dromara.ping.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.dto.OssDTO;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.service.OssService;
import org.dromara.common.core.utils.MapstructUtils;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.ping.domain.PingAgentDeployConfig;
import org.dromara.ping.domain.PingNodeConfig;
import org.dromara.ping.domain.bo.PingAgentDeployConfigBo;
import org.dromara.ping.domain.vo.PingAgentDeployConfigVo;
import org.dromara.ping.domain.vo.PingAgentDeploymentVo;
import org.dromara.ping.mapper.PingAgentDeployConfigMapper;
import org.dromara.ping.mapper.PingNodeConfigMapper;
import org.dromara.ping.service.IPingAgentDeployConfigService;
import org.dromara.ping.support.PingAgentDeployTemplateRenderer;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Service
public class PingAgentDeployConfigServiceImpl implements IPingAgentDeployConfigService {

    private static final String DEFAULT_CONFIG_KEY = "default";
    private static final String DEFAULT_IMAGE_NAME = "ping-agent:latest";
    private static final String DEFAULT_MASTER_URL = "https://controller.example.com";
    private static final String DEFAULT_UUID_FILE_PATH = "/etc/ping-agent/uuid";
    private static final String DEFAULT_DOCKER_INSTALL_TEMPLATE = """
        sudo apt-get update
        sudo apt-get install -y ca-certificates curl
        sudo install -m 0755 -d /etc/apt/keyrings
        sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
        sudo chmod a+r /etc/apt/keyrings/docker.asc
        . /etc/os-release
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${UBUNTU_CODENAME:-$VERSION_CODENAME} stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
        sudo apt-get update
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        sudo systemctl enable --now docker
        """;
    private static final String DEFAULT_FIRST_DEPLOY_TEMPLATE = """
        sudo install -d -m 0755 /opt/ping-agent /etc/ping-agent
        printf '%s\\n' {{nodeUuid}} | sudo tee {{uuidFilePath}} >/dev/null
        sudo chmod 0644 {{uuidFilePath}}
        sudo curl -fL --retry 3 {{imageUrl}} -o {{archivePath}}
        sudo gzip -dc {{archivePath}} | sudo docker load
        sudo docker rm -f ping-agent >/dev/null 2>&1 || true
        sudo docker run -d \\
          --name ping-agent \\
          --restart unless-stopped \\
          --cap-add NET_RAW \\
          --sysctl net.ipv4.ping_group_range="0 2147483647" \\
          -p 9115:9115 \\
          -v {{uuidFilePath}}:/etc/ping-agent/uuid:ro \\
          -e PING_AGENT_ENABLED=true \\
          -e PING_AGENT_MASTER_URL={{masterUrl}} \\
          -e PING_AGENT_UUID_FILE=/etc/ping-agent/uuid \\
          {{imageName}}
        """;
    private static final String DEFAULT_UPDATE_TEMPLATE = """
        sudo test -s {{uuidFilePath}} || { echo "Agent UUID文件不存在，请先执行首次部署命令" >&2; exit 1; }
        sudo curl -fL --retry 3 {{imageUrl}} -o {{archivePath}}
        sudo gzip -dc {{archivePath}} | sudo docker load
        sudo docker rm -f ping-agent >/dev/null 2>&1 || true
        sudo docker run -d \\
          --name ping-agent \\
          --restart unless-stopped \\
          --cap-add NET_RAW \\
          --sysctl net.ipv4.ping_group_range="0 2147483647" \\
          -p 9115:9115 \\
          -v {{uuidFilePath}}:/etc/ping-agent/uuid:ro \\
          -e PING_AGENT_ENABLED=true \\
          -e PING_AGENT_MASTER_URL={{masterUrl}} \\
          -e PING_AGENT_UUID_FILE=/etc/ping-agent/uuid \\
          {{imageName}}
        """;

    private final PingAgentDeployConfigMapper baseMapper;
    private final PingNodeConfigMapper nodeConfigMapper;
    private final OssService ossService;

    @Override
    public PingAgentDeployConfigVo queryConfig() {
        PingAgentDeployConfig config = findConfig();
        PingAgentDeployConfigVo vo = config == null ? fallbackConfig() : MapstructUtils.convert(config, PingAgentDeployConfigVo.class);
        resolveImage(vo, true);
        resolveImage(vo, false);
        return vo;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean saveConfig(PingAgentDeployConfigBo bo) {
        validateConfig(bo);
        PingAgentDeployConfig existing = findConfig();
        PingAgentDeployConfig entity = MapstructUtils.convert(bo, PingAgentDeployConfig.class);
        entity.setConfigKey(DEFAULT_CONFIG_KEY);
        if (existing == null) {
            entity.setId(null);
            return baseMapper.insert(entity) > 0;
        }
        entity.setId(existing.getId());
        return baseMapper.updateById(entity) > 0;
    }

    @Override
    public PingAgentDeploymentVo buildDeployment(Long nodeId) {
        PingNodeConfig node = nodeConfigMapper.selectById(nodeId);
        if (node == null) {
            throw new ServiceException("节点不存在");
        }
        if (StringUtils.isBlank(node.getUuid())) {
            throw new ServiceException("节点UUID为空，请先完善节点配置");
        }

        PingAgentDeployConfigVo config = queryConfig();
        PingAgentDeploymentVo result = new PingAgentDeploymentVo();
        result.setNodeId(node.getId());
        result.setNodeName(node.getName());
        result.setNodeUuid(node.getUuid());
        result.setMasterUrl(config.getMasterUrl());
        result.setImageName(config.getImageName());
        result.setUuidFilePath(DEFAULT_UUID_FILE_PATH);
        result.setArchitectures(List.of(
            buildArchitecture("amd64", "x86_64 / AMD64", config.getAmd64ImageOssId(), config.getAmd64ImageUrl(),
                config.getAmd64ImageFileName(), node.getUuid(), config),
            buildArchitecture("arm64", "ARM64 / AArch64", config.getArm64ImageOssId(), config.getArm64ImageUrl(),
                config.getArm64ImageFileName(), node.getUuid(), config)
        ));
        return result;
    }

    private PingAgentDeploymentVo.ArchitectureCommand buildArchitecture(
        String architecture,
        String label,
        Long imageOssId,
        String imageUrl,
        String imageFileName,
        String nodeUuid,
        PingAgentDeployConfigVo config
    ) {
        PingAgentDeploymentVo.ArchitectureCommand command = new PingAgentDeploymentVo.ArchitectureCommand();
        command.setArchitecture(architecture);
        command.setLabel(label);
        command.setImageOssId(imageOssId);
        command.setImageUrl(imageUrl);
        command.setImageFileName(imageFileName);
        command.setAvailable(imageOssId != null && StringUtils.isNotBlank(imageUrl));
        if (!command.isAvailable()) {
            return command;
        }

        Map<String, String> variables = new LinkedHashMap<>();
        variables.put("architecture", architecture);
        variables.put("imageUrl", imageUrl);
        variables.put("imageName", config.getImageName());
        variables.put("masterUrl", config.getMasterUrl());
        variables.put("nodeUuid", nodeUuid);
        variables.put("uuidFilePath", DEFAULT_UUID_FILE_PATH);
        variables.put("archivePath", "/opt/ping-agent/ping-agent-linux-" + architecture + ".tar.gz");
        String dockerInstall = PingAgentDeployTemplateRenderer.render(config.getDockerInstallTemplate(), variables);
        String firstDeploy = PingAgentDeployTemplateRenderer.render(config.getFirstDeployTemplate(), variables);
        command.setFirstInstallCommand(dockerInstall + "\n\n" + firstDeploy);
        command.setFirstDeployCommand(firstDeploy);
        command.setUpdateCommand(PingAgentDeployTemplateRenderer.render(config.getUpdateTemplate(), variables));
        return command;
    }

    private PingAgentDeployConfig findConfig() {
        return baseMapper.selectOne(Wrappers.<PingAgentDeployConfig>lambdaQuery()
            .eq(PingAgentDeployConfig::getConfigKey, DEFAULT_CONFIG_KEY)
            .last("limit 1"));
    }

    private PingAgentDeployConfigVo fallbackConfig() {
        PingAgentDeployConfigVo vo = new PingAgentDeployConfigVo();
        vo.setConfigKey(DEFAULT_CONFIG_KEY);
        vo.setImageName(DEFAULT_IMAGE_NAME);
        vo.setMasterUrl(DEFAULT_MASTER_URL);
        vo.setDockerInstallTemplate(DEFAULT_DOCKER_INSTALL_TEMPLATE);
        vo.setFirstDeployTemplate(DEFAULT_FIRST_DEPLOY_TEMPLATE);
        vo.setUpdateTemplate(DEFAULT_UPDATE_TEMPLATE);
        return vo;
    }

    private void resolveImage(PingAgentDeployConfigVo vo, boolean amd64) {
        Long ossId = amd64 ? vo.getAmd64ImageOssId() : vo.getArm64ImageOssId();
        if (ossId == null) {
            return;
        }
        List<OssDTO> images = ossService.selectByIds(ossId.toString());
        if (images == null || images.isEmpty()) {
            return;
        }
        OssDTO image = images.get(0);
        if (amd64) {
            vo.setAmd64ImageUrl(image.getUrl());
            vo.setAmd64ImageFileName(image.getOriginalName());
        } else {
            vo.setArm64ImageUrl(image.getUrl());
            vo.setArm64ImageFileName(image.getOriginalName());
        }
    }

    private void validateConfig(PingAgentDeployConfigBo bo) {
        URI masterUri;
        try {
            masterUri = URI.create(bo.getMasterUrl().trim());
        } catch (IllegalArgumentException e) {
            throw new ServiceException("主控地址格式不正确");
        }
        if (!masterUri.isAbsolute() || !("http".equalsIgnoreCase(masterUri.getScheme())
            || "https".equalsIgnoreCase(masterUri.getScheme()))) {
            throw new ServiceException("主控地址必须是完整的HTTP或HTTPS地址");
        }
        if (!bo.getImageName().matches("^[A-Za-z0-9._/:@-]+$")) {
            throw new ServiceException("运行镜像名包含不支持的字符");
        }
        validateTemplate(bo.getDockerInstallTemplate(), "Docker安装命令模板");
        validateTemplate(bo.getFirstDeployTemplate(), "首次部署命令模板");
        validateTemplate(bo.getUpdateTemplate(), "更新命令模板");
        if (!bo.getFirstDeployTemplate().contains("{{nodeUuid}}")) {
            throw new ServiceException("首次部署模板必须包含 {{nodeUuid}} 占位符");
        }
        if (!bo.getFirstDeployTemplate().contains("{{uuidFilePath}}")
            || !bo.getUpdateTemplate().contains("{{uuidFilePath}}")) {
            throw new ServiceException("首次部署和更新模板必须包含 {{uuidFilePath}} 占位符");
        }
    }

    private void validateTemplate(String template, String fieldName) {
        if (template.length() > 20000) {
            throw new ServiceException(fieldName + "不能超过20000个字符");
        }
    }
}
