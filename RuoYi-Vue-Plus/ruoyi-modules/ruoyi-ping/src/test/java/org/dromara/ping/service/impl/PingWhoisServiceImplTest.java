package org.dromara.ping.service.impl;

import org.dromara.common.core.exception.ServiceException;
import org.dromara.ping.domain.vo.PingWhoisVo;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.net.InetAddress;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@Tag("dev")
class PingWhoisServiceImplTest {

    private static final String REGISTRY_RESPONSE = """
        Domain Name: EXAMPLE.COM
        Registrar: Example Registrar, Inc.
        Registrar WHOIS Server: whois.markmonitor.com
        Updated Date: 2026-01-02T03:04:05Z
        Creation Date: 1995-08-14T04:00:00Z
        Registry Expiry Date: 2027-08-13T04:00:00Z
        Name Server: A.IANA-SERVERS.NET
        Name Server: B.IANA-SERVERS.NET
        Domain Status: clientTransferProhibited https://icann.org/epp#clientTransferProhibited
        DNSSEC: signedDelegation
        """;

    @Test
    void shouldNormalizeUrlAndInternationalizedDomain() {
        assertThat(PingWhoisServiceImpl.normalizeDomain("https://www.Example.com/path?q=1"))
            .isEqualTo("example.com");
        assertThat(PingWhoisServiceImpl.normalizeDomain("www.\u6D4B\u8BD5.cn."))
            .isEqualTo("xn--0zwm56d.cn");
    }

    @Test
    void shouldRejectInvalidOrUnsupportedInput() throws Exception {
        PingWhoisServiceImpl service = serviceReturning(REGISTRY_RESPONSE);

        assertThatThrownBy(() -> service.query("127.0.0.1"))
            .isInstanceOf(ServiceException.class)
            .hasMessageContaining("域名格式不正确");
        assertThatThrownBy(() -> service.query("example.invalid"))
            .isInstanceOf(ServiceException.class)
            .hasMessageContaining("暂不支持");
    }

    @Test
    void shouldParseStructuredFieldsAndQueryAllowedReferral() throws Exception {
        AtomicInteger calls = new AtomicInteger();
        PingWhoisServiceImpl service = new PingWhoisServiceImpl(
            (server, address, domain) -> {
                calls.incrementAndGet();
                if ("whois.markmonitor.com".equals(server)) {
                    return """
                        Domain Name: example.com
                        Registrar: Detailed Registrar
                        Registrar URL: https://www.example.test
                        Registrant Organization: Example Organization
                        Registrant Contact Email: hostmaster@example.test
                        Name Server: a.iana-servers.net
                        """;
                }
                return REGISTRY_RESPONSE;
            },
            host -> new InetAddress[]{InetAddress.getByName("8.8.8.8")}
        );

        PingWhoisVo result = service.query("www.example.com");

        assertThat(calls).hasValue(2);
        assertThat(result.getDomain()).isEqualTo("example.com");
        assertThat(result.getRegistrar()).isEqualTo("Detailed Registrar");
        assertThat(result.getWhoisServer()).isEqualTo("whois.markmonitor.com");
        assertThat(result.getRegistrantEmail()).isEqualTo("hostmaster@example.test");
        assertThat(result.getCreationDate()).isEqualTo("1995-08-14T04:00:00Z");
        assertThat(result.getNameServers()).containsExactly("a.iana-servers.net", "b.iana-servers.net");
        assertThat(result.getRawWhois()).contains("Registry WHOIS (whois.verisign-grs.com)");
    }

    @Test
    void shouldIgnoreUnapprovedReferralServer() throws Exception {
        AtomicInteger calls = new AtomicInteger();
        PingWhoisServiceImpl service = new PingWhoisServiceImpl(
            (server, address, domain) -> {
                calls.incrementAndGet();
                return REGISTRY_RESPONSE.replace("whois.markmonitor.com", "whois.attacker.example");
            },
            host -> new InetAddress[]{InetAddress.getByName("8.8.8.8")}
        );

        PingWhoisVo result = service.query("example.com");

        assertThat(calls).hasValue(1);
        assertThat(result.getWhoisServer()).isEqualTo("whois.verisign-grs.com");
        assertThat(result.getRegistrar()).isEqualTo("Example Registrar, Inc.");
    }

    @Test
    void shouldRejectPrivateWhoisServerAddress() throws Exception {
        PingWhoisServiceImpl service = new PingWhoisServiceImpl(
            (server, address, domain) -> REGISTRY_RESPONSE,
            host -> new InetAddress[]{InetAddress.getByName("127.0.0.1")}
        );

        assertThatThrownBy(() -> service.query("example.com"))
            .isInstanceOf(ServiceException.class)
            .hasMessageContaining("地址不安全");
    }

    @Test
    void shouldParseLegacyAliasesAndDeduplicateRows() {
        PingWhoisServiceImpl.ParsedWhois parsed = PingWhoisServiceImpl.parseWhoisFields("""
            domain: example.de
            created: 2020-01-01
            changed: 2026-02-03
            nserver: NS1.EXAMPLE.DE 192.0.2.1
            nserver: ns1.example.de 192.0.2.1
            status: connect
            status: connect
            """);

        assertThat(parsed.domain()).isEqualTo("example.de");
        assertThat(parsed.creationDate()).isEqualTo("2020-01-01");
        assertThat(parsed.updatedDate()).isEqualTo("2026-02-03");
        assertThat(parsed.nameServers()).containsExactly("ns1.example.de");
        assertThat(parsed.statuses()).containsExactly("connect");
    }

    private static PingWhoisServiceImpl serviceReturning(String raw) throws Exception {
        return new PingWhoisServiceImpl(
            (server, address, domain) -> raw,
            host -> new InetAddress[]{InetAddress.getByName("8.8.8.8")}
        );
    }
}
