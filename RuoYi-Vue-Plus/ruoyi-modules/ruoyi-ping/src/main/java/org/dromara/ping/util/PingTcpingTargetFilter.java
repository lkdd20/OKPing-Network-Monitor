package org.dromara.ping.util;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

public class PingTcpingTargetFilter {
    private static final int MAX_TARGETS = 256;

    private static final Pattern[] VALID_PATTERNS = {
        Pattern.compile("^([a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,}$"),
        Pattern.compile("^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$"),
        Pattern.compile("^(\\d{1,3}\\.){3}\\d{1,3}-(\\d{1,3}\\.){3}\\d{1,3}$"),
        Pattern.compile("^(\\d{1,3}\\.){3}\\d{1,3}/([0-9]|[1-2][0-9]|3[0-2])$")
    };

    private boolean filterNetwork = true;
    private boolean firstGateway = true;

    public List<Map<String, Object>> processTargets(List<String> inputs, int defaultPort) {
        if (inputs == null || inputs.isEmpty()) {
            throw new IllegalArgumentException("输入不能为空");
        }
        assertValidPort(defaultPort);
        List<Map<String, Object>> results = new ArrayList<>();
        for (String input : inputs) {
            String value = input == null ? "" : input.trim();
            if (value.isEmpty()) {
                continue;
            }
            ParsedTarget parsed = parseTarget(value, defaultPort);
            if (VALID_PATTERNS[2].matcher(parsed.target()).matches()) {
                String[] range = parsed.target().split("-");
                if (range.length != 2) {
                    throw new IllegalArgumentException("无效的IP范围格式: " + parsed.target());
                }
                for (String ip : expandIpRange(range[0], range[1])) {
                    results.add(target(ip, parsed.port()));
                }
            } else if (VALID_PATTERNS[3].matcher(parsed.target()).matches()) {
                for (String ip : processCidr(parsed.target())) {
                    results.add(target(ip, parsed.port()));
                }
            } else {
                assertValid(parsed.target());
                results.add(target(parsed.target(), parsed.port()));
            }
            assertTargetLimit(results.size());
        }
        if (results.isEmpty()) {
            throw new IllegalArgumentException("输入不能为空");
        }
        return results;
    }

    public void setFilterNetwork(boolean filterNetwork) {
        this.filterNetwork = filterNetwork;
    }

    public void setFirstGateway(boolean firstGateway) {
        this.firstGateway = firstGateway;
    }

    private ParsedTarget parseTarget(String input, int defaultPort) {
        int port = defaultPort;
        String target = input;
        if (input.startsWith("[") && input.contains("]:")) {
            String[] parts = input.split("]:", -1);
            if (parts.length != 2) {
                throw new IllegalArgumentException("无效的输入格式: " + input);
            }
            target = parts[0].substring(1);
            port = parsePort(parts[1]);
        } else if (input.contains(":")) {
            String[] parts = input.split(":", -1);
            if (parts.length != 2) {
                throw new IllegalArgumentException("无效的输入格式: " + input);
            }
            target = parts[0];
            port = parsePort(parts[1]);
        }
        assertValidPort(port);
        return new ParsedTarget(target, port);
    }

    private Map<String, Object> target(String target, int port) {
        Map<String, Object> value = new HashMap<>();
        value.put("target", target);
        value.put("port", port);
        return value;
    }

    private void assertValid(String input) {
        for (Pattern pattern : VALID_PATTERNS) {
            if (pattern.matcher(input).matches()) {
                return;
            }
        }
        throw new IllegalArgumentException("无效的输入格式: " + input);
    }

    private List<String> expandIpRange(String startIp, String endIp) {
        List<String> ips = new ArrayList<>();
        long start = ipToLong(startIp);
        long end = ipToLong(endIp);
        if (start > end) {
            throw new IllegalArgumentException("IP范围起始地址不能大于结束地址");
        }
        for (long i = start; i <= end; i++) {
            assertTargetLimit(ips.size() + 1);
            ips.add(longToIp(i));
        }
        return ips;
    }

    private List<String> processCidr(String cidr) {
        String[] parts = cidr.split("/");
        String baseIp = parts[0];
        int maskBits = Integer.parseInt(parts[1]);
        long ipInt = ipToLong(baseIp);
        int maskLen = 32 - maskBits;
        long start = (ipInt >> maskLen) << maskLen;
        long end = start | ((1L << maskLen) - 1);
        List<String> ips = new ArrayList<>();
        if (filterNetwork) {
            for (long i = start + 1; i < end; i++) {
                if (firstGateway && i == start + 1) {
                    continue;
                }
                if (!firstGateway && i == end - 1) {
                    continue;
                }
                assertTargetLimit(ips.size() + 1);
                ips.add(longToIp(i));
            }
        } else {
            for (long i = start; i <= end; i++) {
                assertTargetLimit(ips.size() + 1);
                ips.add(longToIp(i));
            }
        }
        return ips;
    }

    private long ipToLong(String ip) {
        assertValidIpv4(ip);
        String[] octets = ip.split("\\.");
        long result = 0;
        for (String octet : octets) {
            result = (result << 8) + Integer.parseInt(octet);
        }
        return result;
    }

    private int parsePort(String value) {
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("无效的端口: " + value, e);
        }
    }

    private void assertValidPort(int port) {
        if (port < 1 || port > 65535) {
            throw new IllegalArgumentException("端口必须在1到65535之间");
        }
    }

    private void assertValidIpv4(String ip) {
        if (!VALID_PATTERNS[1].matcher(ip).matches()) {
            throw new IllegalArgumentException("无效的IPv4地址: " + ip);
        }
    }

    private void assertTargetLimit(int size) {
        if (size > MAX_TARGETS) {
            throw new IllegalArgumentException("实际IP数量不能超过256个");
        }
    }

    private String longToIp(long ip) {
        return String.format("%d.%d.%d.%d",
            (ip >> 24) & 0xFF,
            (ip >> 16) & 0xFF,
            (ip >> 8) & 0xFF,
            ip & 0xFF);
    }

    private record ParsedTarget(String target, int port) {
    }
}
