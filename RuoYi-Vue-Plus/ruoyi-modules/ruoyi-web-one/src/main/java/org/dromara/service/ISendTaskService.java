package org.dromara.service;

import org.dromara.domain.bo.SendTaskBo;

import java.time.Duration;

/**
 * 发送任务服务
 *
 * @author Lion Li
 * @date 2026-05-15
 */
public interface ISendTaskService {

    /**
     * 发送任务
     *
     * @param bo 发送任务参数
     * @return 任务UUID
     */
    String send(SendTaskBo bo, Duration ttl);

    /**
     * 根据UUID查询发送任务
     *
     * @param uuid 任务UUID
     * @return 发送任务参数
     */
    SendTaskBo queryByUuid(String uuid);

}
