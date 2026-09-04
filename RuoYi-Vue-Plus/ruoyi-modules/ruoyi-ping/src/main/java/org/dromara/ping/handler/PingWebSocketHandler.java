package org.dromara.ping.handler;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dromara.common.core.domain.R;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.ping.config.PingProperties;
import org.dromara.ping.domain.dto.PingWsMessageDto;
import org.dromara.ping.service.IPingNodeDispatchService;
import org.dromara.ping.service.IPingWsAccessService;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.util.UriUtils;

import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class PingWebSocketHandler extends TextWebSocketHandler {

    private static final String ACCESS_KEY = "pingAccessKey";
    private static final String START_MESSAGE = "start";

    private final ObjectMapper objectMapper;
    private final PingProperties pingProperties;
    private final IPingWsAccessService wsAccessService;
    private final ObjectProvider<IPingNodeDispatchService> nodeDispatchServiceProvider;
    private final ObjectProvider<RabbitTemplate> rabbitTemplateProvider;
    private final PingWebSocketSessionManager sessionManager;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String accessKey = extractAccessKey(session);
        if (StringUtils.isBlank(accessKey) || StringUtils.isBlank(wsAccessService.getPayload(accessKey))) {
            sendAndClose(session, R.fail("连接失败，访问凭证无效或已过期"));
            return;
        }
        session.getAttributes().put(ACCESS_KEY, accessKey);
        sessionManager.add(accessKey, session);
        log.info("ping websocket连接成功 accessKey={}", accessKey);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String accessKey = (String) session.getAttributes().get(ACCESS_KEY);
        if (StringUtils.isBlank(accessKey)) {
            sendAndClose(session, R.fail("连接失败，访问凭证无效"));
            return;
        }
        if (!START_MESSAGE.equalsIgnoreCase(message.getPayload().trim())) {
            sendMessage(session, R.fail("请发送start开始执行"));
            return;
        }
        String payload = wsAccessService.getPayload(accessKey);
        if (StringUtils.isBlank(payload)) {
            sendAndClose(session, R.fail("访问凭证已过期"));
            return;
        }
        PingWsMessageDto wsMessage = parseMessage(payload);
        wsMessage.setTaskId(accessKey);
        log.info("收到ping websocket start消息，开始执行缓存任务 accessKey={}, payload={}", accessKey, payload);
        publishLog(wsMessage);
        IPingNodeDispatchService dispatchService = nodeDispatchServiceProvider.getIfAvailable();
        if (dispatchService == null) {
            sendMessage(session, R.fail("RabbitMQ未启用，无法下发节点任务"));
            return;
        }
        try {
            dispatchService.dispatch(wsMessage);
        } catch (IllegalArgumentException e) {
            log.warn("ping任务参数校验失败 accessKey={}, message={}", accessKey, e.getMessage());
            sendMessage(session, R.fail(e.getMessage()));
        } catch (RuntimeException e) {
            log.error("ping节点任务下发失败 accessKey={}", accessKey, e);
            sendMessage(session, R.fail("检测任务下发失败，请稍后重试"));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessionManager.remove(session);
        log.info("ping websocket连接关闭 sessionId={}, status={}", session.getId(), status);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        if (exception instanceof java.io.EOFException || exception instanceof IOException) {
            log.info("ping websocket客户端断开: sessionId={}, message={}", session.getId(), exception.getMessage());
        } else {
            log.error("ping websocket未知异常: {}", exception.getMessage(), exception);
        }
        sessionManager.remove(session);
        if (session.isOpen()) {
            session.close(CloseStatus.SERVER_ERROR);
        }
    }

    private PingWsMessageDto parseMessage(String payload) {
        try {
            return objectMapper.readValue(payload, PingWsMessageDto.class);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("websocket消息JSON格式错误", e);
        }
    }

    private void publishLog(PingWsMessageDto message) {
        if (!pingProperties.getRabbit().isLogEnabled()) {
            return;
        }
        RabbitTemplate rabbitTemplate = rabbitTemplateProvider.getIfAvailable();
        if (rabbitTemplate == null) {
            return;
        }
        try {
            Map<String, Object> logMessage = new LinkedHashMap<>();
            logMessage.put("method", "websocket");
            logMessage.put("url", message.getUrl());
            logMessage.put("taskId", message.getTaskId());
            logMessage.put("requestBody", message.toString());
            logMessage.put("params", "");
            logMessage.put("time", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            rabbitTemplate.convertAndSend(
                pingProperties.getRabbit().getLogExchange(),
                pingProperties.getRabbit().getLogRoutingKey(),
                objectMapper.writeValueAsString(logMessage)
            );
        } catch (JsonProcessingException e) {
            log.warn("ping websocket日志序列化失败", e);
        }
    }

    private String extractAccessKey(WebSocketSession session) {
        URI uri = session.getUri();
        if (uri == null || uri.getPath() == null) {
            return null;
        }
        String path = uri.getPath();
        int lastSlashIndex = path.lastIndexOf('/');
        if (lastSlashIndex < 0 || lastSlashIndex == path.length() - 1) {
            return null;
        }
        return UriUtils.decode(path.substring(lastSlashIndex + 1), StandardCharsets.UTF_8);
    }

    private void sendAndClose(WebSocketSession session, R<?> message) throws IOException {
        sendMessage(session, message);
        if (session.isOpen()) {
            session.close(CloseStatus.NORMAL);
        }
    }

    private void sendMessage(WebSocketSession session, R<?> message) throws IOException {
        if (session.isOpen()) {
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(message)));
        }
    }
}
