package org.dromara.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dromara.common.core.domain.R;
import org.dromara.domain.bo.SendTaskBo;
import org.dromara.service.ISendTaskService;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.util.UriUtils;

import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;

/**
 * 发送任务WebSocket处理器
 *
 * @author Lion Li
 * @date 2026-05-15
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SendTaskWebSocketHandler extends TextWebSocketHandler {

    private static final String UUID_KEY = "uuid";
    private static final String TASK_NOT_FOUND_MESSAGE = "任务不存在或已过期";

    private final ISendTaskService sendTaskService;
    private final ObjectMapper objectMapper;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String uuid = extractUuid(session);
        if (uuid == null) {
            sendAndClose(session, R.fail("任务UUID不能为空"));
            return;
        }
        if (sendTaskService.queryByUuid(uuid) == null) {
            sendAndClose(session, R.fail(TASK_NOT_FOUND_MESSAGE));
            return;
        }
        session.getAttributes().put(UUID_KEY, uuid);
        log.info("[send task websocket connect] sessionId: {}, uuid: {}", session.getId(), uuid);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String uuid = (String) session.getAttributes().get(UUID_KEY);
        if (uuid == null) {
            sendAndClose(session, R.fail("任务UUID不能为空"));
            return;
        }

        SendTaskBo bo = sendTaskService.queryByUuid(uuid);
        if (bo == null) {
            sendAndClose(session, R.fail(TASK_NOT_FOUND_MESSAGE));
            return;
        }
        sendMessage(session, R.ok(bo));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        log.info("[send task websocket disconnect] sessionId: {}, status: {}", session.getId(), status);
    }

    private String extractUuid(WebSocketSession session) {
        URI uri = session.getUri();
        if (uri == null) {
            return null;
        }
        String path = uri.getPath();
        if (path == null || path.isBlank()) {
            return null;
        }
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
