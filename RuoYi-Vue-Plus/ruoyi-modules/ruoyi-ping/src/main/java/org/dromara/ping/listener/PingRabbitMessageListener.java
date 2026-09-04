package org.dromara.ping.listener;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dromara.ping.domain.dto.PingAgentPingResultDto;
import org.dromara.ping.domain.vo.PingPingResultVo;
import org.dromara.ping.handler.PingWebSocketSessionManager;
import org.dromara.ping.service.IPingNodeMessageService;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PingRabbitMessageListener {

    private final ObjectMapper objectMapper;
    private final IPingNodeMessageService nodeMessageService;
    private final PingWebSocketSessionManager sessionManager;

    public void consume(String message) {
        try {
            consumeNodeMessage(message);
        } catch (Exception e) {
            log.error("ping RabbitMQ节点回包处理失败: {}", message, e);
        }
    }

    private void consumeNodeMessage(String message) throws JsonProcessingException {
        PingAgentPingResultDto result = objectMapper.readValue(message, PingAgentPingResultDto.class);
        PingPingResultVo response = nodeMessageService.buildPingResult(result);
        sessionManager.sendToUser(result.getTaskId(), objectMapper.writeValueAsString(response));
    }
}
