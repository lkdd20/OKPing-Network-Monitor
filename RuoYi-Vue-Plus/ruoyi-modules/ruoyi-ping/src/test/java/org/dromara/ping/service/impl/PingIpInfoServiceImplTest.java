package org.dromara.ping.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.ping.config.PingProperties;
import org.dromara.ping.domain.vo.PingIpInfoVo;
import org.dromara.ping.service.IPingIpRegionService;
import org.dromara.ping.service.PingIpProviderClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@Tag("dev")
class PingIpInfoServiceImplTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private IPingIpRegionService regionService;
    private PingIpProviderClient providerClient;
    private PingProperties properties;
    private PingIpInfoServiceImpl service;

    @BeforeEach
    void setUp() {
        regionService = mock(IPingIpRegionService.class);
        providerClient = mock(PingIpProviderClient.class);
        properties = new PingProperties();
        service = new PingIpInfoServiceImpl(regionService, providerClient, properties);
    }

    @Test
    void shouldPreferAdministratorRegionAndMergeProviderDetails() throws Exception {
        properties.getIpLookup().getIpapi().setEnabled(true);
        when(regionService.lookup("61.241.54.211")).thenReturn("中国|广东省|深圳市|联通|CN");
        JsonNode providerBody = objectMapper.readTree("""
            {
              "ip": "61.241.54.211",
              "is_anycast": true,
              "is_vpn": false,
              "is_proxy": false,
              "is_datacenter": false,
              "company": {"name": "China Unicom", "domain": "chinaunicom.cn", "type": "isp"},
              "asn": {"asn": 4837, "org": "China Unicom", "route": "61.240.0.0/14", "type": "isp"},
              "location": {"country": "China", "country_code": "CN", "state": "Beijing", "city": "Beijing", "latitude": 22.5431, "longitude": 114.0579, "timezone": "Asia/Shanghai"}
            }
            """);
        when(providerClient.fetch(anyString(), any(), anyString())).thenReturn(providerBody);

        PingIpInfoVo result = service.queryUncached("61.241.54.211");

        assertThat(result.getCountry()).isEqualTo("中国");
        assertThat(result.getRegion()).isEqualTo("广东省");
        assertThat(result.getCity()).isEqualTo("深圳市");
        assertThat(result.getIsp()).isEqualTo("联通");
        assertThat(result.getAsn()).isEqualTo("AS4837");
        assertThat(result.getCompanyName()).isEqualTo("China Unicom");
        assertThat(result.getLatitude()).isEqualTo(22.5431);
        assertThat(result.getSources()).containsExactly("本地 IP库", "ipapi");
        assertThat(result.getNativeIp()).isTrue();
        assertThat(result.getSecurity().isAnycast()).isTrue();
    }

    @Test
    void shouldKeepLocalResultWhenProviderFails() {
        properties.getIpLookup().getIpapi().setEnabled(true);
        when(regionService.lookup("8.8.8.8")).thenReturn("美国|加利福尼亚州|山景城|Google|US");
        when(providerClient.fetch(anyString(), any(), anyString())).thenThrow(new IllegalStateException("timeout"));

        PingIpInfoVo result = service.queryUncached("8.8.8.8");

        assertThat(result.getCountry()).isEqualTo("美国");
        assertThat(result.getWarnings()).containsExactly("ipapi 数据暂不可用");
        assertThat(result.getSources()).containsExactly("本地 IP库");
    }

    @Test
    void shouldMapScamalyticsRiskAndPrivacyService() throws Exception {
        properties.getIpLookup().getScamalytics().setEnabled(true);
        when(regionService.lookup("8.8.8.8")).thenReturn("美国|加利福尼亚州|山景城|Google|US");
        JsonNode providerBody = objectMapper.readTree("""
            {
              "scamalytics": {
                "scamalytics_score": 8,
                "scamalytics_proxy": {
                  "is_apple_icloud_private_relay": true,
                  "is_google": false,
                  "is_amazon_aws": false
                }
              },
              "external_datasources": {
                "x4bnet": {"is_vpn": false, "is_datacenter": false, "is_tor": false},
                "firehol": {"is_proxy": false},
                "google": {"is_googlebot": false}
              }
            }
            """);
        when(providerClient.fetch(anyString(), any(), anyString())).thenReturn(providerBody);

        PingIpInfoVo result = service.queryUncached("8.8.8.8");

        assertThat(result.getRiskScore()).isEqualTo(8);
        assertThat(result.getRiskSource()).isEqualTo("Scamalytics");
        assertThat(result.getPrivacyServiceType()).isEqualTo("iCloud Relay");
        assertThat(result.getSecurity().isRelay()).isTrue();
    }

    @Test
    void shouldSelectFirstPublicAddressFromProxyChain() {
        String result = service.firstPublicClientIp(List.of(
            "127.0.0.1, 10.0.0.8, 100.64.0.1, 8.8.8.8",
            "1.1.1.1"
        ));

        assertThat(result).isEqualTo("8.8.8.8");
        assertThat(service.firstPublicClientIp(List.of(
            "::1", "fe80::1", "fd00::1", "2001:db8::1", "192.168.1.1", "203.0.113.8"
        ))).isNull();
    }

    @Test
    void shouldRejectNonIpInputBeforeCacheAccess() {
        assertThatThrownBy(() -> service.query("www.example.com"))
            .isInstanceOf(ServiceException.class)
            .hasMessageContaining("IP地址格式不正确");
    }
}
