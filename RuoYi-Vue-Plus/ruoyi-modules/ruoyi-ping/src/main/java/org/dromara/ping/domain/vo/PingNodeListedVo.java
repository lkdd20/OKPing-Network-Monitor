package org.dromara.ping.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class PingNodeListedVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long key;
    private String region;
    private String city;
    private String province;
    private String operators;
    private String name;
    private Boolean homeState;
    private String sponsorText;
    private String sponsorUrl;
    private String content;
    private String content2;
    private String content3;
    private Object coordinate;
    private String country;
}
