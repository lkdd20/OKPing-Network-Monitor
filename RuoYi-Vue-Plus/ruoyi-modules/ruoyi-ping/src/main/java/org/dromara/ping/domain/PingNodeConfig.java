package org.dromara.ping.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

/**
 * ping 1.0 node config mapped from the legacy la_node_config table.
 */
@Data
@TableName("la_node_config")
public class PingNodeConfig implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private String country;
    private String overseas;
    private String region;
    private String province;
    private String city;
    private String operators;
    private String name;
    private String ip;
    private Long weight;
    private String state;
    private String rqState;
    private String exchange;
    private String queue;
    private String binding;
    private String sponsorText;
    private String sponsorUrl;
    private String content;
    private String content2;
    private String content3;
    private Long createTime;
    private Long endTime;
    private Long online;
    private String uuid;
    private Boolean homeState;
    private Boolean traceroute;
    private Boolean ipv6;
    private String coordinate;
}
