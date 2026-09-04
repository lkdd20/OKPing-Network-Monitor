package org.dromara.ping.support;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@Tag("dev")
class PingAgentDeployTemplateRendererTest {

    @Test
    void rendersAllKnownVariablesAsShellQuotedValues() {
        String rendered = PingAgentDeployTemplateRenderer.render(
            "curl {{imageUrl}} -e UUID={{nodeUuid}} {{imageName}}",
            Map.of(
                "imageUrl", "https://oss.example.com/agent.tar.gz?token=a&part=1",
                "nodeUuid", "00000000-0000-0000-0000-000000000000",
                "imageName", "ping-agent:latest"
            )
        );

        assertThat(rendered).isEqualTo(
            "curl 'https://oss.example.com/agent.tar.gz?token=a&part=1' "
                + "-e UUID='00000000-0000-0000-0000-000000000000' 'ping-agent:latest'"
        );
    }

    @Test
    void escapesSingleQuotesForPosixShell() {
        assertThat(PingAgentDeployTemplateRenderer.shellQuote("a'b"))
            .isEqualTo("'a'\"'\"'b'");
    }
}
