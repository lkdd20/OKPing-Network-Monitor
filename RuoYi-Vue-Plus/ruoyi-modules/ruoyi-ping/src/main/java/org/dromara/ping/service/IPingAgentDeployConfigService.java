package org.dromara.ping.service;

import org.dromara.ping.domain.bo.PingAgentDeployConfigBo;
import org.dromara.ping.domain.vo.PingAgentDeployConfigVo;
import org.dromara.ping.domain.vo.PingAgentDeploymentVo;

public interface IPingAgentDeployConfigService {

    PingAgentDeployConfigVo queryConfig();

    boolean saveConfig(PingAgentDeployConfigBo bo);

    PingAgentDeploymentVo buildDeployment(Long nodeId);
}
