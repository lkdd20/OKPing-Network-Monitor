package org.dromara.domain;

import org.dromara.common.tenant.core.TenantEntity;
import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;

/**
 * 节点信息对象 node_config
 *
 * @author Lion Li
 * @date 2026-06-17
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("node_config")
public class NodeConfig extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * ID
     */
    @TableId(value = "id")
    private Long id;

    /**
     * 国家
     */
    private String country;

    /**
     * 是否是海外
     */
    private String overseas;

    /**
     * 区域
     */
    private String region;

    /**
     * 城市
     */
    private String city;

    /**
     * 运营商
     */
    private String operators;

    /**
     * 名称
     */
    private String name;

    /**
     * 权重
     */
    private Long weight;

    /**
     * 坐标
     */
    private String coordinate;

    /**
     * 状态
     */
    private String state;

    /**
     * 备注信息
     */
    private String content;

    /**
     * 备注信息2
     */
    private String content2;

    /**
     * 备注信息3
     */
    private String content3;

    /**
     * 在线时刻
     */
    private Long online;

    /**
     * 是否家宽
     */
    private String homeState;

    /**
     * 省份
     */
    private String province;

    /**
     * 路由追踪开启
     */
    private String traceroute;

    /**
     * ipv6支持
     */
    private String ipv6;

    /**
     * 删除标志
     */
    @TableLogic
    private Long delFlag;


}
