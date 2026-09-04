package org.dromara.ping.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.redis.utils.RedisUtils;
import org.dromara.ping.domain.vo.PingWhoisVo;
import org.dromara.ping.service.IPingWhoisService;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.IDN;
import java.net.Inet4Address;
import java.net.Inet6Address;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.SocketTimeoutException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

@Slf4j
@Service
public class PingWhoisServiceImpl implements IPingWhoisService {

    private static final int WHOIS_PORT = 43;
    private static final int CONNECT_TIMEOUT_MILLIS = 5_000;
    private static final int READ_TIMEOUT_MILLIS = 10_000;
    private static final int MAX_RESPONSE_BYTES = 1024 * 1024;
    private static final String CACHE_KEY_PREFIX = "ping:whois:";
    private static final Duration CACHE_TTL = Duration.ofMinutes(10);
    private static final Pattern DOMAIN_LABEL_PATTERN = Pattern.compile("[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?");
    private static final Pattern SERVER_NAME_PATTERN = Pattern.compile("[a-z0-9](?:[a-z0-9.-]{0,251}[a-z0-9])?");

    private static final Map<String, String> WHOIS_SERVERS = createWhoisServers();
    private static final Set<String> ALLOWED_REFERRAL_SERVERS = Set.of(
        "whois.verisign-grs.com",
        "whois.pir.org",
        "whois.publicinterestregistry.org",
        "whois.cnnic.cn",
        "whois.nic.io",
        "whois.afilias.net",
        "whois.nic.me",
        "ccwhois.verisign-grs.com",
        "tvwhois.verisign-grs.com",
        "whois.nic.co",
        "whois.nic.google",
        "whois.nic.xyz",
        "whois.nic.top",
        "whois.nic.vip",
        "whois.gtld.knet.cn",
        "whois.nic.club",
        "whois.nic.site",
        "whois.nic.online",
        "whois.nic.store",
        "whois.nic.tech",
        "whois.nic.space",
        "whois.nic.fun",
        "whois.nic.pro",
        "whois.nic.ltd",
        "whois.nic.group",
        "whois.nic.work",
        "whois.nic.live",
        "whois.nic.mobi",
        "whois.nic.name",
        "whois.nic.biz",
        "whois.nic.asia",
        "whois.nic.us",
        "whois.nic.uk",
        "whois.denic.de",
        "whois.nic.fr",
        "whois.jprs.jp",
        "whois.kr",
        "whois.tcinet.ru",
        "whois.auda.org.au",
        "whois.cira.ca",
        "whois.registry.in",
        "whois.registro.br",
        "whois.twnic.net.tw",
        "whois.hkirc.hk",
        "whois.sgnic.sg",
        "whois.markmonitor.com",
        "whois.godaddy.com",
        "whois.namecheap.com",
        "whois.registrar.amazon.com",
        "whois.cloudflare.com",
        "whois.namesilo.com",
        "whois.dynadot.com",
        "whois.gandi.net",
        "whois.tucows.com",
        "whois.networksolutions.com",
        "whois.enom.com",
        "whois.name.com"
    );

    private final WhoisTransport whoisTransport;
    private final HostAddressResolver addressResolver;
    private final boolean cacheEnabled;

    public PingWhoisServiceImpl() {
        this(new SocketWhoisTransport(), InetAddress::getAllByName, true);
    }

    PingWhoisServiceImpl(WhoisTransport whoisTransport, HostAddressResolver addressResolver) {
        this(whoisTransport, addressResolver, false);
    }

    private PingWhoisServiceImpl(
        WhoisTransport whoisTransport,
        HostAddressResolver addressResolver,
        boolean cacheEnabled
    ) {
        this.whoisTransport = whoisTransport;
        this.addressResolver = addressResolver;
        this.cacheEnabled = cacheEnabled;
    }

    @Override
    public PingWhoisVo query(String input) {
        String domain = normalizeDomain(input);
        if (cacheEnabled) {
            try {
                PingWhoisVo cached = RedisUtils.getCacheObject(CACHE_KEY_PREFIX + domain);
                if (cached != null && StringUtils.isNotBlank(cached.getRawWhois())) {
                    return cached;
                }
            } catch (RuntimeException ex) {
                log.warn("WHOIS缓存读取失败 domain={}", domain, ex);
            }
        }

        PingWhoisVo result = queryUncached(domain);
        if (cacheEnabled) {
            try {
                RedisUtils.setCacheObject(CACHE_KEY_PREFIX + domain, result, CACHE_TTL);
            } catch (RuntimeException ex) {
                log.warn("WHOIS缓存写入失败 domain={}", domain, ex);
            }
        }
        return result;
    }

    private PingWhoisVo queryUncached(String domain) {
        String registryServer = findWhoisServer(domain);
        List<InetAddress> registryAddresses = resolvePublicAddresses(registryServer);

        try {
            String registryRaw = whoisTransport.query(registryServer, registryAddresses, domain);
            ParsedWhois registry = parseWhoisFields(registryRaw);
            String referralServer = normalizeServerName(registry.whoisServer());

            if (isAllowedReferralServer(referralServer, registryServer)) {
                try {
                    List<InetAddress> referralAddresses = resolvePublicAddresses(referralServer);
                    String detailedRaw = whoisTransport.query(referralServer, referralAddresses, domain);
                    ParsedWhois detailed = parseWhoisFields(detailedRaw);
                    return toVo(
                        domain,
                        referralServer,
                        mergeParsed(detailed, registry),
                        detailedRaw + "\n\n--- Registry WHOIS (" + registryServer + ") ---\n\n" + registryRaw
                    );
                } catch (ServiceException | IOException ex) {
                    log.debug("WHOIS referral query failed for server {}", referralServer, ex);
                }
            }

            return toVo(domain, registryServer, registry, registryRaw);
        } catch (SocketTimeoutException ex) {
            throw new ServiceException("WHOIS查询超时，请稍后重试");
        } catch (IOException ex) {
            log.warn("WHOIS query failed for domain {} via {}", domain, registryServer, ex);
            throw new ServiceException("WHOIS查询失败，请稍后重试");
        }
    }

    static String normalizeDomain(String input) {
        if (StringUtils.isBlank(input)) {
            throw new ServiceException("请输入要查询的域名");
        }

        String value = input.trim();
        try {
            if (value.matches("(?i)^[a-z][a-z0-9+.-]*://.*")) {
                URI uri = URI.create(value);
                value = uri.getHost();
            } else {
                int slashIndex = value.indexOf('/');
                if (slashIndex >= 0) {
                    value = value.substring(0, slashIndex);
                }
            }
        } catch (IllegalArgumentException ex) {
            throw new ServiceException("域名格式不正确");
        }

        if (StringUtils.isBlank(value)) {
            throw new ServiceException("域名格式不正确");
        }

        value = value.trim().toLowerCase(Locale.ROOT);
        if (value.startsWith("www.")) {
            value = value.substring(4);
        }
        while (value.endsWith(".")) {
            value = value.substring(0, value.length() - 1);
        }

        final String asciiDomain;
        try {
            asciiDomain = IDN.toASCII(value, IDN.USE_STD3_ASCII_RULES).toLowerCase(Locale.ROOT);
        } catch (IllegalArgumentException ex) {
            throw new ServiceException("域名格式不正确");
        }

        String[] labels = asciiDomain.split("\\.");
        if (asciiDomain.length() > 253 || labels.length < 2
            || Arrays.stream(labels).anyMatch(label -> !DOMAIN_LABEL_PATTERN.matcher(label).matches())
            || labels[labels.length - 1].chars().noneMatch(Character::isLetter)) {
            throw new ServiceException("域名格式不正确");
        }
        return asciiDomain;
    }

    static ParsedWhois parseWhoisFields(String raw) {
        Map<String, String> values = new LinkedHashMap<>();
        Set<String> nameServers = new LinkedHashSet<>();
        Set<String> statuses = new LinkedHashSet<>();

        for (String line : StringUtils.blankToDefault(raw, "").split("\\R")) {
            String trimmed = line.trim();
            if (trimmed.isEmpty() || trimmed.startsWith("%") || trimmed.startsWith("#") || trimmed.startsWith(">")) {
                continue;
            }

            int colonIndex = trimmed.indexOf(':');
            if (colonIndex <= 0) {
                continue;
            }
            String key = trimmed.substring(0, colonIndex).trim().toLowerCase(Locale.ROOT);
            String value = trimmed.substring(colonIndex + 1).trim();
            if (value.isEmpty()) {
                continue;
            }

            switch (key) {
                case "domain name", "domain" -> putFirst(values, "domain", value);
                case "registrar" -> putFirst(values, "registrar", value);
                case "registrar whois server", "whois server", "refer" -> putFirst(values, "whoisServer", value);
                case "registrar url" -> putFirst(values, "registrarUrl", value);
                case "registrant organization", "registrant org", "registrant" -> putFirst(values, "registrantOrg", value);
                case "registrant contact email", "registrant email" -> putFirst(values, "registrantEmail", value);
                case "creation date", "registration time", "registered on", "created" -> putFirst(values, "creationDate", value);
                case "registry expiry date", "registrar registration expiration date", "expiration time", "expiry date", "expires" ->
                    putFirst(values, "expirationDate", value);
                case "updated date", "last updated", "changed" -> putFirst(values, "updatedDate", value);
                case "dnssec" -> putFirst(values, "dnssec", value);
                case "name server", "nserver" -> nameServers.add(value.split("\\s+", 2)[0].toLowerCase(Locale.ROOT));
                case "domain status", "status" -> statuses.add(value);
                default -> {
                }
            }
        }

        return new ParsedWhois(
            values.get("domain"),
            values.get("registrar"),
            values.get("whoisServer"),
            values.get("registrarUrl"),
            values.get("registrantOrg"),
            values.get("registrantEmail"),
            values.get("creationDate"),
            values.get("expirationDate"),
            values.get("updatedDate"),
            values.get("dnssec"),
            List.copyOf(nameServers),
            List.copyOf(statuses)
        );
    }

    static boolean isPublicAddress(InetAddress address) {
        if (address.isAnyLocalAddress() || address.isLoopbackAddress() || address.isLinkLocalAddress()
            || address.isSiteLocalAddress() || address.isMulticastAddress()) {
            return false;
        }

        byte[] bytes = address.getAddress();
        if (address instanceof Inet4Address && bytes.length == 4) {
            int first = Byte.toUnsignedInt(bytes[0]);
            int second = Byte.toUnsignedInt(bytes[1]);
            int third = Byte.toUnsignedInt(bytes[2]);
            return !(first == 0
                || (first == 100 && second >= 64 && second <= 127)
                || (first == 192 && second == 0 && third == 0)
                || (first == 198 && (second == 18 || second == 19))
                || (first == 198 && second == 51 && third == 100)
                || (first == 203 && second == 0 && third == 113)
                || first >= 240);
        }

        if (address instanceof Inet6Address && bytes.length == 16) {
            int first = Byte.toUnsignedInt(bytes[0]);
            int second = Byte.toUnsignedInt(bytes[1]);
            boolean uniqueLocal = (first & 0xfe) == 0xfc;
            boolean documentation = first == 0x20 && second == 0x01
                && Byte.toUnsignedInt(bytes[2]) == 0x0d && Byte.toUnsignedInt(bytes[3]) == 0xb8;
            return !uniqueLocal && !documentation;
        }
        return false;
    }

    private static Map<String, String> createWhoisServers() {
        Map<String, String> servers = new LinkedHashMap<>();
        servers.put("com.cn", "whois.cnnic.cn");
        servers.put("net.cn", "whois.cnnic.cn");
        servers.put("org.cn", "whois.cnnic.cn");
        servers.put("gov.cn", "whois.cnnic.cn");
        servers.put("ac.cn", "whois.cnnic.cn");
        servers.put("co.uk", "whois.nic.uk");
        servers.put("org.uk", "whois.nic.uk");
        servers.put("me.uk", "whois.nic.uk");
        servers.put("co.jp", "whois.jprs.jp");
        servers.put("or.jp", "whois.jprs.jp");
        servers.put("ne.jp", "whois.jprs.jp");
        servers.put("com", "whois.verisign-grs.com");
        servers.put("net", "whois.verisign-grs.com");
        servers.put("org", "whois.pir.org");
        servers.put("cn", "whois.cnnic.cn");
        servers.put("io", "whois.nic.io");
        servers.put("info", "whois.afilias.net");
        servers.put("me", "whois.nic.me");
        servers.put("cc", "ccwhois.verisign-grs.com");
        servers.put("tv", "tvwhois.verisign-grs.com");
        servers.put("co", "whois.nic.co");
        servers.put("dev", "whois.nic.google");
        servers.put("app", "whois.nic.google");
        servers.put("xyz", "whois.nic.xyz");
        servers.put("top", "whois.nic.top");
        servers.put("vip", "whois.nic.vip");
        servers.put("wang", "whois.gtld.knet.cn");
        servers.put("club", "whois.nic.club");
        servers.put("site", "whois.nic.site");
        servers.put("online", "whois.nic.online");
        servers.put("store", "whois.nic.store");
        servers.put("tech", "whois.nic.tech");
        servers.put("space", "whois.nic.space");
        servers.put("fun", "whois.nic.fun");
        servers.put("pro", "whois.nic.pro");
        servers.put("ltd", "whois.nic.ltd");
        servers.put("group", "whois.nic.group");
        servers.put("work", "whois.nic.work");
        servers.put("live", "whois.nic.live");
        servers.put("mobi", "whois.nic.mobi");
        servers.put("name", "whois.nic.name");
        servers.put("biz", "whois.nic.biz");
        servers.put("asia", "whois.nic.asia");
        servers.put("us", "whois.nic.us");
        servers.put("uk", "whois.nic.uk");
        servers.put("de", "whois.denic.de");
        servers.put("fr", "whois.nic.fr");
        servers.put("jp", "whois.jprs.jp");
        servers.put("kr", "whois.kr");
        servers.put("ru", "whois.tcinet.ru");
        servers.put("au", "whois.auda.org.au");
        servers.put("ca", "whois.cira.ca");
        servers.put("in", "whois.registry.in");
        servers.put("br", "whois.registro.br");
        servers.put("tw", "whois.twnic.net.tw");
        servers.put("hk", "whois.hkirc.hk");
        servers.put("sg", "whois.sgnic.sg");
        return Map.copyOf(servers);
    }

    private static String findWhoisServer(String domain) {
        return WHOIS_SERVERS.entrySet().stream()
            .filter(entry -> domain.endsWith("." + entry.getKey()))
            .findFirst()
            .map(Map.Entry::getValue)
            .orElseThrow(() -> new ServiceException("暂不支持该域名后缀的WHOIS查询"));
    }

    private List<InetAddress> resolvePublicAddresses(String server) {
        try {
            InetAddress[] addresses = addressResolver.resolve(server);
            if (addresses.length == 0 || Arrays.stream(addresses).anyMatch(address -> !isPublicAddress(address))) {
                throw new ServiceException("WHOIS服务器地址不安全");
            }
            return List.copyOf(Arrays.asList(addresses));
        } catch (ServiceException ex) {
            throw ex;
        } catch (IOException ex) {
            throw new ServiceException("WHOIS服务器解析失败，请稍后重试");
        }
    }

    private static boolean isAllowedReferralServer(String referralServer, String registryServer) {
        return StringUtils.isNotBlank(referralServer)
            && !referralServer.equals(registryServer)
            && ALLOWED_REFERRAL_SERVERS.contains(referralServer);
    }

    private static String normalizeServerName(String value) {
        if (StringUtils.isBlank(value)) {
            return "";
        }
        String normalized = value.trim().toLowerCase(Locale.ROOT);
        int schemeIndex = normalized.indexOf("://");
        if (schemeIndex >= 0) {
            normalized = normalized.substring(schemeIndex + 3);
        }
        normalized = normalized.split("[/\\s]", 2)[0];
        while (normalized.endsWith(".")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        return SERVER_NAME_PATTERN.matcher(normalized).matches() ? normalized : "";
    }

    private static void putFirst(Map<String, String> values, String key, String value) {
        values.putIfAbsent(key, value);
    }

    private static ParsedWhois mergeParsed(ParsedWhois primary, ParsedWhois fallback) {
        return new ParsedWhois(
            firstNonBlank(primary.domain(), fallback.domain()),
            firstNonBlank(primary.registrar(), fallback.registrar()),
            firstNonBlank(primary.whoisServer(), fallback.whoisServer()),
            firstNonBlank(primary.registrarUrl(), fallback.registrarUrl()),
            firstNonBlank(primary.registrantOrg(), fallback.registrantOrg()),
            firstNonBlank(primary.registrantEmail(), fallback.registrantEmail()),
            firstNonBlank(primary.creationDate(), fallback.creationDate()),
            firstNonBlank(primary.expirationDate(), fallback.expirationDate()),
            firstNonBlank(primary.updatedDate(), fallback.updatedDate()),
            firstNonBlank(primary.dnssec(), fallback.dnssec()),
            mergeLists(primary.nameServers(), fallback.nameServers()),
            mergeLists(primary.statuses(), fallback.statuses())
        );
    }

    private static String firstNonBlank(String value, String fallback) {
        return StringUtils.isNotBlank(value) ? value : fallback;
    }

    private static List<String> mergeLists(List<String> values, List<String> fallback) {
        LinkedHashSet<String> merged = new LinkedHashSet<>(values);
        merged.addAll(fallback);
        return List.copyOf(merged);
    }

    private static PingWhoisVo toVo(String domain, String server, ParsedWhois parsed, String raw) {
        PingWhoisVo vo = new PingWhoisVo();
        vo.setDomain(domain);
        vo.setRegistrar(parsed.registrar());
        vo.setRegistrarUrl(parsed.registrarUrl());
        vo.setRegistrantOrg(parsed.registrantOrg());
        vo.setRegistrantEmail(parsed.registrantEmail());
        vo.setWhoisServer(server);
        vo.setCreationDate(parsed.creationDate());
        vo.setExpirationDate(parsed.expirationDate());
        vo.setUpdatedDate(parsed.updatedDate());
        vo.setDnssec(parsed.dnssec());
        vo.setNameServers(parsed.nameServers());
        vo.setStatuses(parsed.statuses());
        vo.setRawWhois(raw);
        return vo;
    }

    record ParsedWhois(
        String domain,
        String registrar,
        String whoisServer,
        String registrarUrl,
        String registrantOrg,
        String registrantEmail,
        String creationDate,
        String expirationDate,
        String updatedDate,
        String dnssec,
        List<String> nameServers,
        List<String> statuses
    ) {
    }

    @FunctionalInterface
    interface HostAddressResolver {
        InetAddress[] resolve(String host) throws IOException;
    }

    @FunctionalInterface
    interface WhoisTransport {
        String query(String server, List<InetAddress> addresses, String domain) throws IOException;
    }

    private static final class SocketWhoisTransport implements WhoisTransport {

        @Override
        public String query(String server, List<InetAddress> addresses, String domain) throws IOException {
            IOException lastException = null;
            for (InetAddress address : addresses) {
                try {
                    return queryAddress(server, address, domain);
                } catch (IOException ex) {
                    lastException = ex;
                }
            }
            throw lastException == null ? new IOException("WHOIS服务器没有可用地址") : lastException;
        }

        private String queryAddress(String server, InetAddress address, String domain) throws IOException {
            try (Socket socket = new Socket()) {
                socket.connect(new InetSocketAddress(address, WHOIS_PORT), CONNECT_TIMEOUT_MILLIS);
                socket.setSoTimeout(READ_TIMEOUT_MILLIS);
                String query = "whois.denic.de".equals(server) ? "-T dn,ace " + domain : domain;
                socket.getOutputStream().write((query + "\r\n").getBytes(StandardCharsets.US_ASCII));
                socket.getOutputStream().flush();

                try (InputStream input = socket.getInputStream(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
                    byte[] buffer = new byte[4096];
                    int read;
                    while ((read = input.read(buffer)) != -1) {
                        if (output.size() + read > MAX_RESPONSE_BYTES) {
                            throw new ServiceException("WHOIS响应数据超过1MB限制");
                        }
                        output.write(buffer, 0, read);
                    }
                    return output.toString(StandardCharsets.UTF_8);
                }
            }
        }
    }
}
