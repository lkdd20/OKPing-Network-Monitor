package org.dromara.ping.util;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

public class PingPingTargetFilter {
    private static final int MAX_TARGETS = 256;

    private static final Pattern[] VALID_PATTERNS = {
        Pattern.compile("^([a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,}$"),
        Pattern.compile("^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$"),
        Pattern.compile("^(\\d{1,3}\\.){3}\\d{1,3}-(\\d{1,3}\\.){3}\\d{1,3}$"),
        Pattern.compile("^(\\d{1,3}\\.){3}\\d{1,3}/([0-9]|[1-2][0-9]|3[0-2])$")
    };

    private boolean filterNetwork = true;
    private boolean firstGateway = true;

    public List<String> processTargets(List<String> inputs) {
        if (inputs == null || inputs.isEmpty()) {
            throw new IllegalArgumentException("输入不能为空");
        }
        List<String> results = new ArrayList<>();
        for (String input : inputs) {
            String target = input == null ? "" : input.trim();
            if (target.isEmpty()) {
                continue;
            }
            if (VALID_PATTERNS[2].matcher(target).matches()) {
                String[] range = target.split("-");
                if (range.length != 2) {
                    throw new IllegalArgumentException("无效的IP范围格式: " + target);
                }
                results.addAll(expandIpRange(range[0], range[1]));
            } else if (VALID_PATTERNS[3].matcher(target).matches()) {
                results.addAll(processCidr(target));
            } else {
                assertValid(target);
                results.add(target);
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
}
