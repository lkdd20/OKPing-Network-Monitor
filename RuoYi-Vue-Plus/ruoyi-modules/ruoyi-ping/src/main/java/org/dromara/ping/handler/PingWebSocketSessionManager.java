package org.dromara.ping.handler;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.atomic.AtomicBoolean;

@Slf4j
@Component
public class PingWebSocketSessionManager {

    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final Map<String, MessageQueue> messageQueues = new ConcurrentHashMap<>();

    public void add(String userId, WebSocketSession session) {
        sessions.put(userId, session);
    }

    public void remove(WebSocketSession session) {
        sessions.entrySet().removeIf(entry -> entry.getValue().equals(session));
        messageQueues.entrySet().removeIf(entry -> entry.getValue().session.equals(session));
    }

    public void sendToUser(String userId, String message) {
        WebSocketSession session = sessions.get(userId);
        if (session == null || !session.isOpen()) {
            return;
        }
        messageQueues.computeIfAbsent(userId, key -> new MessageQueue(session)).send(message);
    }

    private static class MessageQueue {
        private final WebSocketSession session;
        private final BlockingQueue<String> queue = new LinkedBlockingQueue<>();
        private final AtomicBoolean sending = new AtomicBoolean(false);

        private MessageQueue(WebSocketSession session) {
            this.session = session;
        }

        private void send(String message) {
            queue.offer(message);
            trySend();
        }

        private void trySend() {
            if (sending.compareAndSet(false, true)) {
                sendNext();
            }
        }

        private void sendNext() {
            if (!session.isOpen()) {
                sending.set(false);
                return;
            }
            String message = queue.poll();
            if (message == null) {
                sending.set(false);
                return;
            }
            try {
                session.sendMessage(new TextMessage(message));
                sendNext();
            } catch (IOException e) {
                log.error("ping websocket发送失败", e);
                sending.set(false);
            }
        }
    }
}
