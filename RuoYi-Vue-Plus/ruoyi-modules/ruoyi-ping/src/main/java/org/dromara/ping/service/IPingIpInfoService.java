package org.dromara.ping.service;

import org.dromara.ping.domain.vo.PingIpInfoVo;

import java.util.Collection;

public interface IPingIpInfoService {

    PingIpInfoVo query(String ip);

    String firstPublicClientIp(Collection<String> candidates);
}
