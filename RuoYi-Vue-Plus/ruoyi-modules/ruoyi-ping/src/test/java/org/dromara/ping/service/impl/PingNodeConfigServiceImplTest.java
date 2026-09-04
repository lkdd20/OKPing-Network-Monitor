package org.dromara.ping.service.impl;

import org.dromara.ping.config.PingProperties;
import org.dromara.ping.domain.PingNodeConfig;
import org.dromara.ping.domain.vo.PingFirstNodeVo;
import org.dromara.ping.mapper.PingNodeConfigMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class PingNodeConfigServiceImplTest {

    @Mock
    private PingNodeConfigMapper nodeConfigMapper;

    private PingNodeConfigServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new PingNodeConfigServiceImpl(nodeConfigMapper, new PingProperties());
    }

    @Test
    void firstListDoesNotInjectLegacyProbeData() {
        PingNodeConfig node = new PingNodeConfig();
        node.setId(1L);
        node.setUuid("uuid-1");
        node.setName("上海移动");
        node.setOperators("移动");
        node.setRegion("华东地区");
        node.setProvince("上海");
        when(nodeConfigMapper.selectList(any())).thenReturn(List.of(node));

        List<PingFirstNodeVo> result = service.firstList();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getKey()).isEqualTo(1L);
        assertThat(result.get(0).getName()).isEqualTo("上海移动");
        assertThat(result.get(0).getDataValue()).isEmpty();
        assertThat(result.get(0).getIp()).isNull();
        assertThat(result.get(0).getState()).isNull();
    }
}
