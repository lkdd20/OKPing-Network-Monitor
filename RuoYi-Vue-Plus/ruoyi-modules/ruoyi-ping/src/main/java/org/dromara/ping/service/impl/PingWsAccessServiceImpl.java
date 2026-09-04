package org.dromara.ping.service.impl;

import lombok.RequiredArgsConstructor;
import org.dromara.ping.service.IPingWsAccessService;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class PingWsAccessServiceImpl implements IPingWsAccessService {

    private final StringRedisTemplate redisTemplate;

    @Override
    public void setPayload(String key, String data, long ttlSeconds) {
        redisTemplate.opsForValue().set(key, data, ttlSeconds, TimeUnit.SECONDS);
    }

    @Override
    public String getPayload(String key) {
        return redisTemplate.opsForValue().get(key);
    }
}
