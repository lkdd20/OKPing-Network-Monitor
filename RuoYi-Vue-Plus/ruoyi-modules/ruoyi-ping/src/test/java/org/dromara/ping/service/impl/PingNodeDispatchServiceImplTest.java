package org.dromara.ping.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.dromara.ping.config.PingProperties;
import org.dromara.ping.domain.PingNodeConfig;
import org.dromara.ping.domain.dto.PingWsMessageDto;
import org.dromara.ping.mapper.PingNodeConfigMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class PingNodeDispatchServiceImplTest {

    @Mock
    private RabbitTemplate rabbitTemplate;
    @Mock
    private PingNodeConfigMapper nodeConfigMapper;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private PingNodeDispatchServiceImpl service;
    private PingNodeConfig node;

    @BeforeEach
    void setUp() {
        PingProperties properties = new PingProperties();
        node = new PingNodeConfig();
        node.setId(1L);
        node.setState("on");
        node.setRqState("on");
        node.setOnline(Instant.now().getEpochSecond());
        node.setExchange("ping_node");
        node.setBinding("node.one");
        node.setTraceroute(true);
        node.setIpv6(true);
        lenient().when(nodeConfigMapper.selectList(any())).thenReturn(List.of(node));
        service = new PingNodeDispatchServiceImpl(rabbitTemplate, nodeConfigMapper, objectMapper, properties);
    }

    @Test
    void expandsBatchPingIntoOrdinaryAgentTasks() throws Exception {
        PingWsMessageDto message = message("batch_ping", "example.com\n1.1.1.1");

        service.dispatch(message);

        List<PingWsMessageDto> tasks = capturedTasks(2);
        assertThat(tasks).extracting(PingWsMessageDto::getType).containsOnly("ping");
        assertThat(tasks).extracting(PingWsMessageDto::getUrl).containsExactly("example.com", "1.1.1.1");
        assertThat(tasks).extracting(PingWsMessageDto::getBatchIndex).containsExactly(0, 1);
        assertThat(tasks).extracting(PingWsMessageDto::getBatchTarget).containsExactly("example.com", "1.1.1.1");
    }

    @Test
    void expandsBatchTcpingAndKeepsPerTargetPort() throws Exception {
        PingWsMessageDto message = message("batch_tcping", "example.com:443\n1.1.1.1");
        message.setPort(80L);

        service.dispatch(message);

        List<PingWsMessageDto> tasks = capturedTasks(2);
        assertThat(tasks).extracting(PingWsMessageDto::getType).containsOnly("tcping");
        assertThat(tasks).extracting(PingWsMessageDto::getPort).containsExactly(443L, 80L);
        assertThat(tasks).extracting(PingWsMessageDto::getBatchTarget).containsExactly("example.com:443", "1.1.1.1");
    }

    @Test
    void dispatchesTracerouteToTheSelectedCapableNode() throws Exception {
        when(nodeConfigMapper.selectById(1L)).thenReturn(node);
        PingWsMessageDto message = new PingWsMessageDto();
        message.setTaskId("task-trace");
        message.setType("traceroute");
        message.setUrl("example.com");
        message.setConfig("{\"node\":1}");

        service.dispatch(message);

        PingWsMessageDto task = capturedTasks(1).get(0);
        assertThat(task.getType()).isEqualTo("traceroute");
        assertThat(task.getUrl()).isEqualTo("example.com");
        assertThat(task.getTaskId()).isEqualTo("task-trace");
        assertThat(task.getNumber()).isEqualTo(1);
        assertThat(task.getConfig()).isNull();
    }

    @Test
    void dispatchesIPv6TracerouteOnlyToAnIPv6CapableNode() throws Exception {
        when(nodeConfigMapper.selectById(1L)).thenReturn(node);
        PingWsMessageDto message = new PingWsMessageDto();
        message.setTaskId("task-trace-v6");
        message.setType("traceroute_v6");
        message.setUrl("2001:db8::1");
        message.setConfig("{\"node\":1}");

        service.dispatch(message);

        PingWsMessageDto task = capturedTasks(1).get(0);
        assertThat(task.getType()).isEqualTo("traceroute_v6");
        assertThat(task.getUrl()).isEqualTo("2001:db8::1");
        assertThat(task.getNumber()).isEqualTo(1);
    }

    private PingWsMessageDto message(String type, String body) {
        PingWsMessageDto message = new PingWsMessageDto();
        message.setTaskId("task-1");
        message.setType(type);
        message.setBody(body);
        message.setConfig("{\"node\":[1],\"filterNetwork\":\"false\",\"firstGateway\":\"first\"}");
        return message;
    }

    private List<PingWsMessageDto> capturedTasks(int count) throws Exception {
        ArgumentCaptor<Object> payload = ArgumentCaptor.forClass(Object.class);
        verify(rabbitTemplate, times(count)).convertAndSend(eq("ping_node"), eq("node.one"), payload.capture());
        return payload.getAllValues().stream()
            .map(String::valueOf)
            .map(value -> {
                try {
                    return objectMapper.readValue(value, PingWsMessageDto.class);
                } catch (Exception e) {
                    throw new IllegalStateException(e);
                }
            })
            .toList();
    }
}
