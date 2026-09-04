package org.dromara.ping.service.impl;

import org.dromara.ping.domain.PingPageConfig;
import org.dromara.ping.domain.vo.PingPublicPageConfigVo;
import org.dromara.ping.mapper.PingPageConfigMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class PingPageConfigServiceImplTest {

    @Mock
    private PingPageConfigMapper pageConfigMapper;

    private PingPageConfigServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new PingPageConfigServiceImpl(pageConfigMapper);
    }

    @Test
    void disabledPageConfigIsNotReplacedByFallback() {
        PingPageConfig config = pageConfig("off");
        PingPublicPageConfigVo result = service.buildPublicConfig(
            config,
            "tcping",
            "example.com:443",
            "/tcping"
        );

        assertThat(result.getEnabled()).isFalse();
        assertThat(result.getPageName()).isEqualTo("在线 TCPing");
    }

    @Test
    void missingPageConfigKeepsDefaultPageAvailable() {
        PingPublicPageConfigVo result = service.buildPublicConfig(null, "tcping", "", "/tcping");

        assertThat(result.getEnabled()).isTrue();
        assertThat(result.getPageKey()).isEqualTo("tcping");
    }

    @Test
    void missingIPv6PageConfigUsesIPv6Fallback() {
        PingPublicPageConfigVo result = service.buildPublicConfig(
            null, "traceroute_v6", "2001:db8::1", "/traceroute_v6"
        );

        assertThat(result.getEnabled()).isTrue();
        assertThat(result.getTitle()).contains("IPv6");
        assertThat(result.getDescription()).contains("IPv6");
    }

    private PingPageConfig pageConfig(String status) {
        PingPageConfig config = new PingPageConfig();
        config.setPageKey("tcping");
        config.setPageName("在线 TCPing");
        config.setTitleTemplate("{displayTarget} 在线 TCPing 检测 ");
        config.setDescriptionTemplate("为 {displayTarget} 提供在线 TCPing 检测");
        config.setStatus(status);
        config.setSortOrder(2L);
        return config;
    }
}
