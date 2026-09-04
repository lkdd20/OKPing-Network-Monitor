package org.dromara.ping.service.impl;

import org.dromara.ping.domain.vo.PingToolPreferenceVo;
import org.dromara.ping.domain.vo.PingUserPreferenceVo;
import org.dromara.ping.mapper.PingUserLoginLogMapper;
import org.dromara.ping.mapper.PingUserPreferenceMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class PingAccountServiceImplTest {

    @Mock
    private PingUserPreferenceMapper preferenceMapper;
    @Mock
    private PingUserLoginLogMapper loginLogMapper;

    private PingAccountServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new PingAccountServiceImpl(preferenceMapper, loginLogMapper);
    }

    @Test
    void missingPreferenceUsesCompleteDefaults() {
        PingUserPreferenceVo result = ReflectionTestUtils.invokeMethod(
            service, "normalizePreferences", (PingUserPreferenceVo) null);

        assertThat(result).isNotNull();
        assertThat(result.getTools()).containsKeys("ping", "http", "dns", "traceroute_v6", "batch_tcping");
        PingToolPreferenceVo ping = result.getTools().get("ping");
        assertThat(ping.getEnterAction()).isEqualTo("single");
        assertThat(ping.getHistoryMode()).isEqualTo("enabled");
        assertThat(ping.getDnsMode()).isEqualTo("operator");
        assertThat(ping.getRegionSummary()).isEqualTo("china");
        assertThat(ping.getMapTimeoutMarker()).isTrue();
        assertThat(ping.getDnsStatsExpanded()).isTrue();
        assertThat(ping.getQuickActions()).isTrue();
    }
}
