package org.dromara.ping.service.impl;

import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.dromara.ping.domain.PingNodeConfig;
import org.dromara.ping.domain.dto.PingAgentPingResultDto;
import org.dromara.ping.domain.dto.PingProbeResultDto;
import org.dromara.ping.domain.dto.PingTracerouteHopDto;
import org.dromara.ping.domain.dto.PingTracerouteProbeDto;
import org.dromara.ping.domain.dto.PingTracerouteResultDto;
import org.dromara.ping.domain.vo.PingPingResultVo;
import org.dromara.ping.mapper.PingNodeConfigMapper;
import org.dromara.ping.service.IPingIpRegionService;
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
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class PingNodeMessageServiceImplTest {

    @BeforeAll
    static void initMybatisTableMetadata() {
        TableInfoHelper.initTableInfo(
            new MapperBuilderAssistant(new MybatisConfiguration(), "ping-result-test"),
            PingNodeConfig.class
        );
    }

    @Mock
    private PingNodeConfigMapper nodeConfigMapper;

    @Mock
    private IPingIpRegionService ipRegionService;

    private PingNodeMessageServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new PingNodeMessageServiceImpl(nodeConfigMapper, ipRegionService);
    }

    @Test
    void enrichesAgentPingResultOnController() throws Exception {
        PingNodeConfig node = new PingNodeConfig();
        node.setId(7L);
        node.setUuid("node-uuid");
        node.setName("上海移动");
        node.setOperators("移动");
        node.setRegion("华东地区");
        node.setProvince("上海");
        node.setCity("上海");
        node.setHomeState(true);
        when(nodeConfigMapper.selectOne(any())).thenReturn(node);
        when(ipRegionService.lookup("1.1.1.1")).thenReturn("澳大利亚|未知|未知|Cloudflare");

        PingAgentPingResultDto result = new PingAgentPingResultDto();
        result.setTaskId("task-1");
        result.setNodeUuid("node-uuid");
        result.setType("ping");
        result.setSequence(3);
        result.setTotalRuns(100);
        result.setIp("1.1.1.1");
        result.setResolvedIps(List.of("1.1.1.1", "1.0.0.1"));
        result.setDnsDurationSeconds(0.012);
        PingProbeResultDto probeResult = new PingProbeResultDto();
        probeResult.setProbe("icmp");
        probeResult.setTarget("example.com");
        probeResult.setEffectiveTarget("1.1.1.1");
        probeResult.setResolveIp("1.1.1.1");
        probeResult.setSuccess(true);
        probeResult.setDurationSeconds(0.042);
        probeResult.setTimeoutSeconds(5);
        result.setProbeResult(probeResult);
        result.setMeasuredAt(123456L);
        result.setBatchIndex(12);
        result.setBatchTarget("example.com");

        PingPingResultVo response = service.buildPingResult(result);

        assertThat(response.getNodeId()).isEqualTo(7L);
        assertThat(response.getIp()).isEqualTo("1.1.1.1");
        assertThat(response.getIpLocation()).isEqualTo("澳大利亚|未知|未知|Cloudflare");
        assertThat(response.getProbeResult()).isSameAs(probeResult);
        assertThat(response.getProbeResult().getResolveIp()).isEqualTo("1.1.1.1");
        assertThat(response.getDnsDurationSeconds()).isEqualTo(0.012);
        assertThat(response.getSequence()).isEqualTo(3);
        assertThat(response.getTotalRuns()).isEqualTo(100);
        assertThat(response.getBatchIndex()).isEqualTo(12);
        assertThat(response.getBatchTarget()).isEqualTo("example.com");

        String json = new ObjectMapper().writeValueAsString(response);
        assertThat(json).doesNotContain("nodeUuid");
        assertThat(json)
            .doesNotContain("nodeName")
            .doesNotContain("nodeOperator")
            .doesNotContain("nodeProvince")
            .doesNotContain("nodeRegion")
            .doesNotContain("nodeCity")
            .doesNotContain("homeNetwork");
        assertThat(json).contains("\"probeResult\"").contains("\"duration_seconds\":0.042");
        assertThat(json).contains("\"ip\":\"1.1.1.1\"");
    }

    @Test
    void prefersAgentIpWhenPresent() {
        PingNodeConfig node = new PingNodeConfig();
        node.setId(10L);
        node.setUuid("node-uuid");
        when(nodeConfigMapper.selectOne(any())).thenReturn(node);
        when(ipRegionService.lookup("2400:3200::1")).thenReturn("中国|浙江省|杭州市|阿里云|CN");

        PingAgentPingResultDto result = new PingAgentPingResultDto();
        result.setTaskId("task-4");
        result.setNodeUuid("node-uuid");
        result.setIp("2400:3200::1");
        result.setResolvedIps(List.of("1.1.1.1"));

        PingPingResultVo response = service.buildPingResult(result);

        assertThat(response.getIp()).isEqualTo("2400:3200::1");
        assertThat(response.getIpLocation()).isEqualTo("中国|浙江省|杭州市|阿里云|CN");
    }

    @Test
    void usesResolvedIpWhenAgentDoesNotSetTargetIp() {
        PingNodeConfig node = new PingNodeConfig();
        node.setId(8L);
        node.setUuid("node-uuid");
        when(nodeConfigMapper.selectOne(any())).thenReturn(node);
        when(ipRegionService.lookup("8.8.8.8")).thenReturn("美国|加利福尼亚州|圣克拉拉|Google");

        PingAgentPingResultDto result = new PingAgentPingResultDto();
        result.setTaskId("task-2");
        result.setNodeUuid("node-uuid");
        result.setResolvedIps(List.of("8.8.8.8"));

        PingPingResultVo response = service.buildPingResult(result);

        assertThat(response.getResolvedIps()).containsExactly("8.8.8.8");
        assertThat(response.getIpLocation()).isEqualTo("美国|加利福尼亚州|圣克拉拉|Google");
    }

    @Test
    void upgradesLegacyAgentFieldsIntoProbeResult() {
        PingNodeConfig node = new PingNodeConfig();
        node.setId(9L);
        node.setUuid("node-uuid");
        when(nodeConfigMapper.selectOne(any())).thenReturn(node);
        when(ipRegionService.lookup("1.1.1.1")).thenReturn("中国|广东省|深圳市|联通|CN");

        PingAgentPingResultDto result = new PingAgentPingResultDto();
        result.setTaskId("task-3");
        result.setNodeUuid("node-uuid");
        result.setResolvedIps(List.of("1.1.1.1"));
        result.setLegacySuccess(true);
        result.setLatencyMs(42D);
        result.setTargetIp("1.1.1.1");
        result.setDnsLatencyMs(12D);
        result.setMeasuredAt(123456L);

        PingPingResultVo response = service.buildPingResult(result);

        assertThat(response.getProbeResult()).isNotNull();
        assertThat(response.getProbeResult().isSuccess()).isTrue();
        assertThat(response.getProbeResult().getDurationSeconds()).isEqualTo(0.042);
        assertThat(response.getProbeResult().getResolveIp()).isEqualTo("1.1.1.1");
        assertThat(response.getProbeResult().getEffectiveTarget()).isEqualTo("1.1.1.1");
        assertThat(response.getDnsDurationSeconds()).isEqualTo(0.012);
    }

    @Test
    void enrichesTracerouteHopLocationsWithoutExposingNodeUuid() throws Exception {
        PingNodeConfig node = new PingNodeConfig();
        node.setId(11L);
        node.setUuid("node-uuid");
        when(nodeConfigMapper.selectOne(any())).thenReturn(node);
        when(ipRegionService.lookup("8.8.8.8")).thenReturn("美国|加利福尼亚州|圣克拉拉|Google");
        when(ipRegionService.lookup("192.168.1.1")).thenReturn("局域网");

        PingTracerouteProbeDto firstProbe = new PingTracerouteProbeDto();
        firstProbe.setIp("192.168.1.1");
        firstProbe.setDurationMilliseconds(1.25);
        PingTracerouteHopDto firstHop = new PingTracerouteHopDto();
        firstHop.setHop(1);
        firstHop.setProbes(List.of(firstProbe));

        PingTracerouteProbeDto targetProbe = new PingTracerouteProbeDto();
        targetProbe.setIp("8.8.8.8");
        targetProbe.setDurationMilliseconds(32.5);
        PingTracerouteHopDto targetHop = new PingTracerouteHopDto();
        targetHop.setHop(2);
        targetHop.setProbes(List.of(targetProbe));

        PingTracerouteResultDto traceResult = new PingTracerouteResultDto();
        traceResult.setTarget("dns.google");
        traceResult.setTargetIp("8.8.8.8");
        traceResult.setReached(true);
        traceResult.setHops(List.of(firstHop, targetHop));

        PingAgentPingResultDto result = new PingAgentPingResultDto();
        result.setTaskId("task-trace");
        result.setNodeUuid("node-uuid");
        result.setType("traceroute");
        result.setIp("8.8.8.8");
        result.setTraceResult(traceResult);

        PingPingResultVo response = service.buildPingResult(result);

        assertThat(response.getTraceResult()).isSameAs(traceResult);
        assertThat(firstProbe.getIpLocation()).isEqualTo("局域网");
        assertThat(targetProbe.getIpLocation()).isEqualTo("美国|加利福尼亚州|圣克拉拉|Google");
        assertThat(new ObjectMapper().writeValueAsString(response)).doesNotContain("nodeUuid");
    }
}
