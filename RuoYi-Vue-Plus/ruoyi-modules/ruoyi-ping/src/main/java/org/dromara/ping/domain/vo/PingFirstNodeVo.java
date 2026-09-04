package org.dromara.ping.domain.vo;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class PingFirstNodeVo extends PingNodeListedVo {

    @Serial
    private static final long serialVersionUID = 1L;

    private String ip;
    private Integer time;
    private String ipAddress;
    private List<String> ips;
    private String firstIp;
    private Integer loadingTime;
    private Integer redirectTime;
    private Integer redirects;
    private String state;
    private String code;
    private Integer dnsTime;
    private Integer connectionTime;
    private List<String> responseInfo;
    private List<Object> dataValue;
}
