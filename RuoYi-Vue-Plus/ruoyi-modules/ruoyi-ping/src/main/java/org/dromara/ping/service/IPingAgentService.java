package org.dromara.ping.service;

import org.dromara.ping.domain.dto.PingAgentRegisterDto;
import org.dromara.ping.domain.vo.PingAgentRegisterVo;

public interface IPingAgentService {

    PingAgentRegisterVo register(PingAgentRegisterDto request);

    int markStaleNodesOffline();
}
