package org.dromara.ping.service;

public interface IPingWsAccessService {

    void setPayload(String key, String data, long ttlSeconds);

    String getPayload(String key);
}
