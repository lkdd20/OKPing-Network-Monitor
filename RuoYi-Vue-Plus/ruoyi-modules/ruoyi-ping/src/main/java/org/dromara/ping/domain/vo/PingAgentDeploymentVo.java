package org.dromara.ping.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Data
public class PingAgentDeploymentVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long nodeId;
    private String nodeName;
    private String nodeUuid;
    private String masterUrl;
    private String imageName;
    private String uuidFilePath;
    private List<ArchitectureCommand> architectures = new ArrayList<>();

    @Data
    public static class ArchitectureCommand implements Serializable {

        @Serial
        private static final long serialVersionUID = 1L;

        private String architecture;
        private String label;
        private Long imageOssId;
        private String imageUrl;
        private String imageFileName;
        private boolean available;
        private String firstInstallCommand;
        private String firstDeployCommand;
        private String updateCommand;
    }
}
