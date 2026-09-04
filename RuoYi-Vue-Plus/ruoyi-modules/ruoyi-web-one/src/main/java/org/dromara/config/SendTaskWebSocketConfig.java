package org.dromara.config;

import lombok.RequiredArgsConstructor;
import org.dromara.handler.SendTaskWebSocketHandler;
import org.springframework.core.Ordered;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.ServletWebSocketHandlerRegistry;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * 发送任务WebSocket配置
 *
 * @author Lion Li
 * @date 2026-05-15
 */
@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class SendTaskWebSocketConfig implements WebSocketConfigurer {

    private static final String SEND_TASK_WS_PATH =
        "/web/task/{uuid:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}}";

    private final SendTaskWebSocketHandler sendTaskWebSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        if (registry instanceof ServletWebSocketHandlerRegistry servletRegistry) {
            servletRegistry.setOrder(Ordered.HIGHEST_PRECEDENCE);
        }
        registry.addHandler(sendTaskWebSocketHandler, SEND_TASK_WS_PATH)
            .setAllowedOrigins("*");
    }

}
