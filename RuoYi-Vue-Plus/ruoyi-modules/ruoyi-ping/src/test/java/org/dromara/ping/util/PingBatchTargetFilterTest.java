package org.dromara.ping.util;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@Tag("dev")
class PingBatchTargetFilterTest {

    @Test
    void expandsPingRangeAndFiltersCidrGateway() {
        PingPingTargetFilter filter = new PingPingTargetFilter();
        filter.setFilterNetwork(true);
        filter.setFirstGateway(true);

        assertThat(filter.processTargets(List.of("my-site.example.com", "192.168.1.1-192.168.1.2", "10.0.0.0/29")))
            .containsExactly(
                "my-site.example.com",
                "192.168.1.1",
                "192.168.1.2",
                "10.0.0.2",
                "10.0.0.3",
                "10.0.0.4",
                "10.0.0.5",
                "10.0.0.6"
            );
    }

    @Test
    void keepsTargetSpecificTcpingPorts() {
        PingTcpingTargetFilter filter = new PingTcpingTargetFilter();
        List<Map<String, Object>> targets = filter.processTargets(
            List.of("example.com:443", "[192.168.1.1-192.168.1.2]:8080", "1.1.1.1"),
            80
        );

        assertThat(targets).containsExactly(
            Map.of("target", "example.com", "port", 443),
            Map.of("target", "192.168.1.1", "port", 8080),
            Map.of("target", "192.168.1.2", "port", 8080),
            Map.of("target", "1.1.1.1", "port", 80)
        );
    }

    @Test
    void rejectsOversizedRangesAndInvalidPorts() {
        assertThatThrownBy(() -> new PingPingTargetFilter().processTargets(
            List.of("10.0.0.0-10.0.1.0")
        )).isInstanceOf(IllegalArgumentException.class).hasMessage("实际IP数量不能超过256个");

        assertThatThrownBy(() -> new PingTcpingTargetFilter().processTargets(
            List.of("example.com:70000"),
            80
        )).isInstanceOf(IllegalArgumentException.class).hasMessage("端口必须在1到65535之间");
    }
}
