package org.dromara.ping.service;

import org.dromara.ping.domain.vo.PingWhoisVo;

public interface IPingWhoisService {

    PingWhoisVo query(String input);
}
