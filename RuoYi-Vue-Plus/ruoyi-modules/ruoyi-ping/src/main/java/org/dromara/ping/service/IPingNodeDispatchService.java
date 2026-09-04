package org.dromara.ping.service;

import org.dromara.ping.domain.dto.PingWsMessageDto;

public interface IPingNodeDispatchService {

    void dispatch(PingWsMessageDto message);
}
