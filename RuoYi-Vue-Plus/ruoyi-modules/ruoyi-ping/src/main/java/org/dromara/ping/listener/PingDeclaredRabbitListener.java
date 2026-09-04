package org.dromara.ping.listener;

import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@ConditionalOnExpression("${ping.rabbit.enabled:true} && ${ping.rabbit.declare-node-result-queue:false}")
public class PingDeclaredRabbitListener {

    private final PingRabbitMessageListener messageListener;

    @RabbitListener(queuesToDeclare = @Queue(value = "${ping.rabbit.node-result-queue}", durable = "true"))
    public void consume(String message) {
        messageListener.consume(message);
    }
}
