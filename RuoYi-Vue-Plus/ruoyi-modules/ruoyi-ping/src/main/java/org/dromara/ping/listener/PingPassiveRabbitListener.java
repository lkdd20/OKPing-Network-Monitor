package org.dromara.ping.listener;

import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@ConditionalOnExpression("${ping.rabbit.enabled:true} && !${ping.rabbit.declare-node-result-queue:false}")
public class PingPassiveRabbitListener {

    private final PingRabbitMessageListener messageListener;

    @RabbitListener(queues = "${ping.rabbit.node-result-queue}")
    public void consume(String message) {
        messageListener.consume(message);
    }
}
