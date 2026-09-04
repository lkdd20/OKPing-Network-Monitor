package org.dromara.ping.service;

import org.dromara.ping.domain.dto.PingAgentPingResultDto;
import org.dromara.ping.domain.vo.PingPingResultVo;

public interface IPingNodeMessageService {

    PingPingResultVo buildPingResult(PingAgentPingResultDto result);
}
