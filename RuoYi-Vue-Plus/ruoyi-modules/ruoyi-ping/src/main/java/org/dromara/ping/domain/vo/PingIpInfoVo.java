package org.dromara.ping.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Data
public class PingIpInfoVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String ip;
    private String ipVersion;
    private String location;
    private String country;
    private String countryCode;
    private String region;
    private String city;
    private String isp;
    private Double latitude;
    private Double longitude;
    private String asn;
    private String asnOrganization;
    private String asnDomain;
    private String companyName;
    private String companyDomain;
    private String networkType;
    private String network;
    private String timezone;
    private String postalCode;
    private Boolean nativeIp;
    private String privacyServiceType;
    private Integer riskScore;
    private String riskSource;
    private Security security = new Security();
    private Abuse abuse = new Abuse();
    private List<String> sources = new ArrayList<>();
    private List<String> warnings = new ArrayList<>();
    private long queriedAt;

    @Data
    public static class Security implements Serializable {

        @Serial
        private static final long serialVersionUID = 1L;

        private boolean available;
        private boolean anycast;
        private boolean vpn;
        private boolean proxy;
        private boolean tor;
        private boolean relay;
        private boolean datacenter;
        private boolean mobile;
        private boolean satellite;
        private boolean crawler;
        private boolean abuser;
        private boolean anonymous;
        private boolean attacker;
        private boolean threat;
        private boolean bogon;
    }

    @Data
    public static class Abuse implements Serializable {

        @Serial
        private static final long serialVersionUID = 1L;

        private String name;
        private String address;
        private String email;
        private String phone;
    }
}
