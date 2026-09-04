package org.dromara.ping.config;

import lombok.RequiredArgsConstructor;
import org.dromara.ping.handler.PingWebSocketHandler;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.ServletWebSocketHandlerRegistry;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "ping.websocket", name = "enabled", havingValue = "true", matchIfMissing = true)
public class PingWebSocketConfig implements WebSocketConfigurer {

    private final PingProperties pingProperties;
    private final PingWebSocketHandler pingWebSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        if (registry instanceof ServletWebSocketHandlerRegistry servletRegistry) {
            servletRegistry.setOrder(Ordered.HIGHEST_PRECEDENCE);
        }
        registry.addHandler(pingWebSocketHandler, pingProperties.getWebsocket().getPath())
            .setAllowedOrigins("*");
    }
}
