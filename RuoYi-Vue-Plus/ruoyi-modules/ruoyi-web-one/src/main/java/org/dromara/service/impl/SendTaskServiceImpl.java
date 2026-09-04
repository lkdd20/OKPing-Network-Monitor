package org.dromara.service.impl;

import org.dromara.common.redis.utils.RedisUtils;
import org.dromara.domain.bo.SendTaskBo;
import org.dromara.service.ISendTaskService;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

/**
 * 发送任务服务实现
 *
 * @author Lion Li
 * @date 2026-05-15
 */
@Service
public class SendTaskServiceImpl implements ISendTaskService {

    private static final String CACHE_KEY_PREFIX = "web:task:send:";


    @Override
    public String send(SendTaskBo bo,Duration ttl) {
        String uuid = UUID.randomUUID().toString();
        RedisUtils.setCacheObject(CACHE_KEY_PREFIX + uuid, bo, ttl);
        return uuid;
    }

    @Override
    public SendTaskBo queryByUuid(String uuid) {
        return RedisUtils.getCacheObject(CACHE_KEY_PREFIX + uuid);
    }

}
