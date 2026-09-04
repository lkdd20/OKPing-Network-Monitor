package org.dromara.ping.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class PingNodeInfoVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String country;
    private String overseas;
    private String region;
    private String province;
    private String city;
    private String operators;
    private String state;
    private String exchange;
    private String queue;
    private String binding;
    private String name;
    private String ip;
    private String sponsorText;
    private String sponsorUrl;
    private String content;
    private String content2;
    private String content3;
}
