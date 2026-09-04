package org.dromara.domain.bo;

import lombok.Data;

import java.util.List;

/**
 * 可用节点查询对象
 *
 * @author Lion Li
 * @date 2026-06-17
 */
@Data
public class NodeConfigAvailableBo {

    /**
     * 运营商
     */
    private List<String> operators;

    /**
     * ipv6支持
     */
    private String ipv6;

    /**
     * 路由追踪开启
     */
    private String traceroute;

}
