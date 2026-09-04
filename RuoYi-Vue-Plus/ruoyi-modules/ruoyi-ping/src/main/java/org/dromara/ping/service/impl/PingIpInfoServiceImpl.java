package org.dromara.ping.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.NetUtils;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.core.utils.ip.RegionUtils;
import org.dromara.common.redis.utils.RedisUtils;
import org.dromara.ping.config.PingProperties;
import org.dromara.ping.domain.vo.PingIpInfoVo;
import org.dromara.ping.service.IPingIpInfoService;
import org.dromara.ping.service.IPingIpRegionService;
import org.dromara.ping.service.PingIpProviderClient;
import org.springframework.stereotype.Service;

import java.net.InetAddress;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;

@Slf4j
@Service
@RequiredArgsConstructor
public class PingIpInfoServiceImpl implements IPingIpInfoService {

    private static final String CACHE_KEY_PREFIX = "ping:ip-info:";

    private final IPingIpRegionService ipRegionService;
    private final PingIpProviderClient providerClient;
    private final PingProperties properties;

    @Override
    public PingIpInfoVo query(String ip) {

        String normalizedIp = normalizeIp(ip);
        String cacheKey = CACHE_KEY_PREFIX + normalizedIp;
        try {
            PingIpInfoVo cached = RedisUtils.getCacheObject(cacheKey);
            if (cached != null && StringUtils.isNotBlank(cached.getIp())) {
                return cached;
            }
        } catch (RuntimeException e) {
            log.warn("ping IP查询缓存读取失败 ip={}", normalizedIp, e);
        }

        PingIpInfoVo result = queryUncached(normalizedIp);
        try {
            Duration ttl = Duration.ofSeconds(Math.max(1, properties.getIpLookup().getCacheTtlSeconds()));
            RedisUtils.setCacheObject(cacheKey, result, ttl);
        } catch (RuntimeException e) {
            log.warn("ping IP查询缓存写入失败 ip={}", normalizedIp, e);
        }
        return result;
    }

    @Override
    public String firstPublicClientIp(Collection<String> candidates) {
        if (candidates == null) {
            return null;
        }
        for (String candidateGroup : candidates) {
            if (StringUtils.isBlank(candidateGroup)) {
                continue;
            }
            for (String candidate : candidateGroup.split(",")) {
                try {
                    String ip = normalizeIp(candidate);
                    InetAddress address = InetAddress.getByName(ip);
                    if (!isPrivateOrSpecial(address)) {
                        return ip;
                    }
                } catch (Exception ignored) {
                    // Continue through proxy headers until a valid public address is found.
                }
            }
        }
        return null;
    }

    PingIpInfoVo queryUncached(String normalizedIp) {
        PingIpInfoVo result = new PingIpInfoVo();
        result.setIp(normalizedIp);
        result.setIpVersion(normalizedIp.contains(":") ? "ipv6" : "ipv4");
        result.setQueriedAt(System.currentTimeMillis());
        mergeLocalRegion(result, ipRegionService.lookup(normalizedIp));

        List<ProviderCall> calls = providerCalls();
        List<CompletableFuture<ProviderResult>> futures = calls.stream()
            .map(call -> CompletableFuture.supplyAsync(() -> fetchProvider(call, normalizedIp)))
            .toList();
        for (CompletableFuture<ProviderResult> future : futures) {
            ProviderResult providerResult = future.join();
            if (providerResult.error() != null) {
                result.getWarnings().add(providerResult.name() + " 数据暂不可用");
                continue;
            }
            if (providerResult.body() == null) {
                continue;
            }
            mergeProvider(result, providerResult.name(), providerResult.body());
//            result.getSources().add(providerResult.name());
        }

        inferDerivedFields(result);
        return result;
    }

    private ProviderResult fetchProvider(ProviderCall call, String ip) {
        try {
            return new ProviderResult(call.name(), providerClient.fetch(call.name(), call.provider(), ip), null);
        } catch (CompletionException e) {
            log.warn("ping IP供应商查询失败 provider={}, ip={}", call.name(), ip, e.getCause());
            return new ProviderResult(call.name(), null, e.getCause());
        } catch (RuntimeException e) {
            log.warn("ping IP供应商查询失败 provider={}, ip={}", call.name(), ip, e);
            return new ProviderResult(call.name(), null, e);
        }
    }


    private List<ProviderCall> providerCalls() {
        PingProperties.IpLookup lookup = properties.getIpLookup();
        List<ProviderCall> calls = new ArrayList<>();
        addProvider(calls, "ipapi", lookup.getIpapi());
        addProvider(calls, "ipregistry", lookup.getIpregistry());
        addProvider(calls, "scamalytics", lookup.getScamalytics());
        return calls;
    }

    private void addProvider(List<ProviderCall> calls, String name, PingProperties.Provider provider) {
        if (provider != null && provider.isEnabled()) {
            calls.add(new ProviderCall(name, provider));
        }
    }

    private void mergeProvider(PingIpInfoVo result, String provider, JsonNode rawBody) {
        JsonNode body = unwrapData(rawBody);
        result.getSecurity().setAvailable(true);
        switch (provider) {
            case "ipapi" -> mergeIpapi(result, body);
            case "ipregistry" -> mergeIpregistry(result, body);
            case "scamalytics" -> mergeScamalytics(result, body);
            default -> {
            }
        }
    }

    private void mergeIpapi(PingIpInfoVo result, JsonNode body) {
        fillLocation(result,
            text(body, "location", "country"),
            text(body, "location", "country_code"),
            text(body, "location", "state"),
            text(body, "location", "city"));
        fillDouble(result::setLatitude, result.getLatitude(), number(body, "location", "latitude"));
        fillDouble(result::setLongitude, result.getLongitude(), number(body, "location", "longitude"));
        fillText(result::setAsn, result.getAsn(), formatAsn(text(body, "asn", "asn")));
        fillText(result::setAsnOrganization, result.getAsnOrganization(), firstText(body,
            new String[]{"asn", "org"}, new String[]{"asn", "descr"}));
        fillText(result::setAsnDomain, result.getAsnDomain(), text(body, "asn", "domain"));
        fillText(result::setCompanyName, result.getCompanyName(), firstText(body,
            new String[]{"company", "name"}, new String[]{"datacenter", "datacenter"}));
        fillText(result::setCompanyDomain, result.getCompanyDomain(), firstText(body,
            new String[]{"company", "domain"}, new String[]{"datacenter", "domain"}));
        fillText(result::setNetworkType, result.getNetworkType(), firstText(body,
            new String[]{"asn", "type"}, new String[]{"company", "type"}));
        fillText(result::setNetwork, result.getNetwork(), firstText(body,
            new String[]{"asn", "route"}, new String[]{"company", "network"}, new String[]{"datacenter", "network"}));
        fillText(result::setTimezone, result.getTimezone(), text(body, "location", "timezone"));
        fillText(result::setPostalCode, result.getPostalCode(), text(body, "location", "zip"));
        fillText(result.getAbuse()::setName, result.getAbuse().getName(), text(body, "abuse", "name"));
        fillText(result.getAbuse()::setAddress, result.getAbuse().getAddress(), text(body, "abuse", "address"));
        fillText(result.getAbuse()::setEmail, result.getAbuse().getEmail(), text(body, "abuse", "email"));
        fillText(result.getAbuse()::setPhone, result.getAbuse().getPhone(), text(body, "abuse", "phone"));

        PingIpInfoVo.Security security = result.getSecurity();
        security.setAnycast(security.isAnycast() || bool(body, "is_anycast"));
        security.setVpn(security.isVpn() || bool(body, "is_vpn"));
        security.setProxy(security.isProxy() || bool(body, "is_proxy"));
        security.setTor(security.isTor() || bool(body, "is_tor"));
        security.setDatacenter(security.isDatacenter() || bool(body, "is_datacenter"));
        security.setMobile(security.isMobile() || bool(body, "is_mobile"));
        security.setSatellite(security.isSatellite() || bool(body, "is_satellite"));
        security.setCrawler(security.isCrawler() || bool(body, "is_crawler"));
        security.setAbuser(security.isAbuser() || bool(body, "is_abuser"));
        security.setBogon(security.isBogon() || bool(body, "is_bogon"));
    }

    private void mergeIpregistry(PingIpInfoVo result, JsonNode body) {
        fillLocation(result,
            text(body, "location", "country", "name"),
            text(body, "location", "country", "code"),
            text(body, "location", "region", "name"),
            text(body, "location", "city"));
        fillDouble(result::setLatitude, result.getLatitude(), number(body, "location", "latitude"));
        fillDouble(result::setLongitude, result.getLongitude(), number(body, "location", "longitude"));
        fillText(result::setAsn, result.getAsn(), formatAsn(text(body, "connection", "asn")));
        fillText(result::setAsnOrganization, result.getAsnOrganization(), text(body, "connection", "organization"));
        fillText(result::setAsnDomain, result.getAsnDomain(), text(body, "connection", "domain"));
        fillText(result::setCompanyName, result.getCompanyName(), text(body, "company", "name"));
        fillText(result::setCompanyDomain, result.getCompanyDomain(), text(body, "company", "domain"));
        fillText(result::setNetworkType, result.getNetworkType(), firstText(body,
            new String[]{"connection", "type"}, new String[]{"company", "type"}));
        fillText(result::setNetwork, result.getNetwork(), text(body, "connection", "route"));
        fillText(result::setTimezone, result.getTimezone(), firstText(body,
            new String[]{"time_zone", "id"}, new String[]{"time_zone", "name"}));
        fillText(result::setPostalCode, result.getPostalCode(), text(body, "location", "postal"));

        PingIpInfoVo.Security security = result.getSecurity();
        security.setVpn(security.isVpn() || bool(body, "security", "is_vpn"));
        security.setProxy(security.isProxy() || bool(body, "security", "is_proxy"));
        security.setTor(security.isTor() || bool(body, "security", "is_tor"));
        security.setRelay(security.isRelay() || bool(body, "security", "is_relay"));
        security.setDatacenter(security.isDatacenter() || bool(body, "security", "is_cloud_provider"));
        security.setAbuser(security.isAbuser() || bool(body, "security", "is_abuser"));
        security.setAnonymous(security.isAnonymous() || bool(body, "security", "is_anonymous"));
        security.setAttacker(security.isAttacker() || bool(body, "security", "is_attacker"));
        security.setThreat(security.isThreat() || bool(body, "security", "is_threat"));
        security.setBogon(security.isBogon() || bool(body, "security", "is_bogon"));
    }

    private void mergeScamalytics(PingIpInfoVo result, JsonNode body) {
        Integer score = integer(body, "scamalytics", "scamalytics_score");
        if (score != null) {
            result.setRiskScore(Math.max(0, Math.min(100, score)));
            result.setRiskSource("Scamalytics");
        }
        PingIpInfoVo.Security security = result.getSecurity();
        boolean appleRelay = bool(body, "scamalytics", "scamalytics_proxy", "is_apple_icloud_private_relay");
        boolean google = bool(body, "scamalytics", "scamalytics_proxy", "is_google");
        boolean amazonAws = bool(body, "scamalytics", "scamalytics_proxy", "is_amazon_aws");
        if (appleRelay) {
            result.setPrivacyServiceType("iCloud Relay");
        } else if (google) {
            result.setPrivacyServiceType("Google");
        } else if (amazonAws) {
            result.setPrivacyServiceType("AWS");
        }
        security.setVpn(security.isVpn() || bool(body, "external_datasources", "x4bnet", "is_vpn"));
        security.setProxy(security.isProxy() || bool(body, "external_datasources", "firehol", "is_proxy"));
        security.setTor(security.isTor() || bool(body, "external_datasources", "x4bnet", "is_tor"));
        security.setRelay(security.isRelay() || appleRelay);
        security.setDatacenter(security.isDatacenter()
            || bool(body, "external_datasources", "x4bnet", "is_datacenter")
            || bool(body, "scamalytics", "scamalytics_proxy", "is_datacenter"));
        security.setCrawler(security.isCrawler()
            || bool(body, "external_datasources", "x4bnet", "is_bot_semrush")
            || bool(body, "external_datasources", "google", "is_googlebot"));
    }

    private void mergeLocalRegion(PingIpInfoVo result, String region) {
        if (StringUtils.isBlank(region) || RegionUtils.UNKNOWN_ADDRESS.equals(region)) {
            result.setLocation(RegionUtils.UNKNOWN_ADDRESS);
            return;
        }
        result.setLocation(region);
        result.getSources().add("本地 IP库");
        String[] fields = region.split("\\|", -1);
        if (fields.length == 0) {
            return;
        }
        result.setCountry(clean(fields[0]));
        boolean hasCountryCode = fields.length >= 5 && fields[fields.length - 1].matches("(?i)^[a-z]{2}$");
        if (hasCountryCode) {
            result.setRegion(clean(fields[1]));
            result.setCity(clean(fields[2]));
            result.setIsp(clean(fields[3]));
            result.setCountryCode(fields[fields.length - 1].toUpperCase(Locale.ROOT));
        } else if (fields.length >= 5) {
            result.setRegion(clean(fields[2]));
            result.setCity(clean(fields[3]));
            result.setIsp(clean(fields[4]));
        } else {
            result.setRegion(fields.length > 1 ? clean(fields[1]) : null);
            result.setCity(fields.length > 2 ? clean(fields[2]) : null);
            result.setIsp(fields.length > 3 ? clean(fields[3]) : null);
        }
        if (StringUtils.isBlank(result.getCountryCode()) && "中国".equals(result.getCountry())) {
            result.setCountryCode("CN");
        }
    }

    private void fillLocation(PingIpInfoVo result, String country, String countryCode, String region, String city) {
        fillText(result::setCountry, result.getCountry(), country);
        fillText(result::setCountryCode, result.getCountryCode(), countryCode == null ? null : countryCode.toUpperCase(Locale.ROOT));
        fillText(result::setRegion, result.getRegion(), region);
        fillText(result::setCity, result.getCity(), city);
    }

    private void inferDerivedFields(PingIpInfoVo result) {
        if (StringUtils.isBlank(result.getLocation()) || RegionUtils.UNKNOWN_ADDRESS.equals(result.getLocation())) {
            result.setLocation(joinLocation(result.getCountry(), result.getRegion(), result.getCity(), result.getIsp(), result.getCountryCode()));
        }
        String type = StringUtils.blankToDefault(result.getNetworkType(), "").toLowerCase(Locale.ROOT);
        PingIpInfoVo.Security security = result.getSecurity();
        if (security.isAvailable()) {
            if (security.isVpn() || security.isProxy() || security.isTor() || security.isDatacenter()
                || List.of("hosting", "idc", "datacenter", "business", "corporate").contains(type)) {
                result.setNativeIp(false);
            } else if (security.isMobile() || List.of("isp", "residential", "consumer", "mobile").contains(type)) {
                result.setNativeIp(true);
            }
        }
    }

    private String joinLocation(String... values) {
        return java.util.Arrays.stream(values)
            .map(this::clean)
            .filter(StringUtils::isNotBlank)
            .distinct()
            .collect(java.util.stream.Collectors.joining("|"));
    }

    private String normalizeIp(String rawIp) {
        String ip = StringUtils.blankToDefault(rawIp, "").trim();
        if (ip.startsWith("[") && ip.endsWith("]")) {
            ip = ip.substring(1, ip.length() - 1);
        }
        if (ip.length() > 64 || ip.contains("%")) {
            throw new ServiceException("IP地址格式不正确");
        }
        boolean ipv4 = NetUtils.isIPv4(ip);
        boolean ipv6 = !ipv4 && ip.contains(":") && NetUtils.isIPv6(ip);
        if (!ipv4 && !ipv6) {
            throw new ServiceException("IP地址格式不正确");
        }
        return ipv6 ? ip.toLowerCase(Locale.ROOT) : ip;
    }

    private boolean isPrivateOrSpecial(InetAddress address) {
        if (address.isAnyLocalAddress() || address.isLoopbackAddress() || address.isLinkLocalAddress()
            || address.isSiteLocalAddress() || address.isMulticastAddress()) {
            return true;
        }
        byte[] bytes = address.getAddress();
        if (bytes.length == 4) {
            int first = bytes[0] & 0xff;
            int second = bytes[1] & 0xff;
            int third = bytes[2] & 0xff;
            return first == 0
                || first >= 224
                || (first == 100 && second >= 64 && second <= 127)
                || (first == 192 && second == 0 && (third == 0 || third == 2))
                || (first == 198 && (second == 18 || second == 19 || (second == 51 && third == 100)))
                || (first == 203 && second == 0 && third == 113);
        }
        int first = bytes[0] & 0xff;
        boolean uniqueLocal = (first & 0xfe) == 0xfc;
        boolean documentation = first == 0x20
            && (bytes[1] & 0xff) == 0x01
            && (bytes[2] & 0xff) == 0x0d
            && (bytes[3] & 0xff) == 0xb8;
        return uniqueLocal || documentation;
    }

    private JsonNode unwrapData(JsonNode body) {
        JsonNode data = body.path("data");
        return data.isObject() && !body.has("ip") ? data : body;
    }

    private String firstText(JsonNode root, String[]... paths) {
        for (String[] path : paths) {
            String value = text(root, path);
            if (StringUtils.isNotBlank(value)) {
                return value;
            }
        }
        return null;
    }

    private String text(JsonNode root, String... path) {
        JsonNode node = node(root, path);
        if (node == null || node.isNull() || node.isContainerNode()) {
            return null;
        }
        return clean(node.asText());
    }

    private Double number(JsonNode root, String... path) {
        JsonNode node = node(root, path);
        return node != null && node.isNumber() ? node.doubleValue() : null;
    }

    private Integer integer(JsonNode root, String... path) {
        JsonNode node = node(root, path);
        return node != null && node.isNumber() ? node.intValue() : null;
    }

    private boolean bool(JsonNode root, String... path) {
        JsonNode node = node(root, path);
        return node != null && node.asBoolean(false);
    }

    private JsonNode node(JsonNode root, String... path) {
        JsonNode node = root;
        for (String part : path) {
            if (node == null || node.isMissingNode() || node.isNull()) {
                return null;
            }
            node = node.path(part);
        }
        return node;
    }

    private String formatAsn(String value) {
        String asn = clean(value);
        if (StringUtils.isBlank(asn)) {
            return null;
        }
        return asn.toUpperCase(Locale.ROOT).startsWith("AS") ? asn.toUpperCase(Locale.ROOT) : "AS" + asn;
    }

    private String clean(String value) {
        if (StringUtils.isBlank(value)) {
            return null;
        }
        String normalized = value.trim();
        return "0".equals(normalized) || "null".equalsIgnoreCase(normalized) || "未知".equals(normalized)
            ? null : normalized;
    }

    private void fillText(java.util.function.Consumer<String> setter, String current, String candidate) {
        if (StringUtils.isBlank(current) && StringUtils.isNotBlank(clean(candidate))) {
            setter.accept(clean(candidate));
        }
    }

    private void fillDouble(java.util.function.Consumer<Double> setter, Double current, Double candidate) {
        if (current == null && candidate != null && Double.isFinite(candidate)) {
            setter.accept(candidate);
        }
    }

    private record ProviderCall(String name, PingProperties.Provider provider) {
    }

    private record ProviderResult(String name, JsonNode body, Throwable error) {
    }
}
