package org.dromara.ping.service.impl;

import org.dromara.ping.config.PingProperties;
import org.dromara.ping.domain.PingNodeConfig;
import org.dromara.ping.domain.dto.PingAgentRegisterDto;
import org.dromara.ping.domain.vo.PingAgentRegisterVo;
import org.dromara.ping.mapper.PingNodeConfigMapper;
import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class PingAgentServiceImplTest {

    @BeforeAll
    static void initMybatisTableMetadata() {
        TableInfoHelper.initTableInfo(
            new MapperBuilderAssistant(new MybatisConfiguration(), "ping-test"),
            PingNodeConfig.class
        );
    }

    @Mock
    private PingNodeConfigMapper nodeConfigMapper;

    private PingProperties properties;
    private PingAgentServiceImpl service;

    @BeforeEach
    void setUp() {
        properties = new PingProperties();
        properties.getAgent().getRabbit().setHost("rabbit.example.com");
        properties.getAgent().getRabbit().setUsername("agent");
        properties.getAgent().getRabbit().setPassword("secret");
        properties.getAgent().getRabbit().setResultRoutingKey("master");
        service = new PingAgentServiceImpl(nodeConfigMapper, properties);
    }

    @Test
    void registersEnabledNodeAndReturnsRuntimeConfig() {
        PingNodeConfig node = node("on");
        when(nodeConfigMapper.selectOne(any())).thenReturn(node);
        when(nodeConfigMapper.update(isNull(), any())).thenReturn(1);

        PingAgentRegisterVo result = service.register(request());

        assertThat(result).isNotNull();
        assertThat(result.isEnabled()).isTrue();
        assertThat(result.getHeartbeatIntervalSeconds()).isEqualTo(600);
        assertThat(result.getNode().getQueue()).isEqualTo("ping_node_node-uuid");
        assertThat(result.getRabbit().getHost()).isEqualTo("rabbit.example.com");
        assertThat(result.getRabbit().getPassword()).isEqualTo("secret");
        verify(nodeConfigMapper).update(isNull(), any());
    }

    @Test
    void disabledNodeDoesNotReceiveRabbitCredentials() {
        PingNodeConfig node = node("off");
        when(nodeConfigMapper.selectOne(any())).thenReturn(node);
        when(nodeConfigMapper.update(isNull(), any())).thenReturn(1);

        PingAgentRegisterVo result = service.register(request());

        assertThat(result).isNotNull();
        assertThat(result.isEnabled()).isFalse();
        assertThat(result.getNode()).isNull();
        assertThat(result.getRabbit()).isNull();
    }

    @Test
    void unknownUuidIsRejected() {
        when(nodeConfigMapper.selectOne(any())).thenReturn(null);

        assertThat(service.register(request())).isNull();
    }

    private PingNodeConfig node(String state) {
        PingNodeConfig node = new PingNodeConfig();
        node.setId(1L);
        node.setUuid("node-uuid");
        node.setState(state);
        node.setExchange("ping_node");
        node.setQueue("ping_node_node-uuid");
        node.setBinding("ping_node_node-uuid");
        return node;
    }

    private PingAgentRegisterDto request() {
        PingAgentRegisterDto request = new PingAgentRegisterDto();
        request.setUuid("node-uuid");
        request.setVersion("test");
        request.setCapabilities(List.of("ping"));
        return request;
    }
}
