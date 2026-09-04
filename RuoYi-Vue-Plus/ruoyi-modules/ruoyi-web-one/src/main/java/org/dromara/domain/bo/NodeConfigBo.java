package org.dromara.domain.bo;

import org.dromara.domain.NodeConfig;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.validation.constraints.*;

/**
 * 节点信息业务对象 node_config
 *
 * @author Lion Li
 * @date 2026-06-17
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = NodeConfig.class, reverseConvertGenerate = false)
public class NodeConfigBo extends BaseEntity {

    /**
     * ID
     */
    @NotNull(message = "ID不能为空", groups = { EditGroup.class })
    private Long id;

    /**
     * 国家
     */
    @NotBlank(message = "国家不能为空", groups = { AddGroup.class, EditGroup.class })
    private String country;

    /**
     * 是否是海外
     */
    @NotBlank(message = "是否是海外不能为空", groups = { AddGroup.class, EditGroup.class })
    private String overseas;

    /**
     * 区域
     */
    @NotBlank(message = "区域不能为空", groups = { AddGroup.class, EditGroup.class })
    private String region;

    /**
     * 城市
     */
    @NotBlank(message = "城市不能为空", groups = { AddGroup.class, EditGroup.class })
    private String city;

    /**
     * 运营商
     */
    @NotBlank(message = "运营商不能为空", groups = { AddGroup.class, EditGroup.class })
    private String operators;

    /**
     * 名称
     */
    @NotBlank(message = "名称不能为空", groups = { AddGroup.class, EditGroup.class })
    private String name;

    /**
     * 权重
     */
    @NotNull(message = "权重不能为空", groups = { AddGroup.class, EditGroup.class })
    private Long weight;

    /**
     * 坐标
     */
    private String coordinate;

    /**
     * 状态
     */
    @NotBlank(message = "状态不能为空", groups = { AddGroup.class, EditGroup.class })
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
    @NotBlank(message = "是否家宽不能为空", groups = { AddGroup.class, EditGroup.class })
    private String homeState;

    /**
     * 省份
     */
    @NotBlank(message = "省份不能为空", groups = { AddGroup.class, EditGroup.class })
    private String province;

    /**
     * 路由追踪开启
     */
    @NotBlank(message = "路由追踪开启不能为空", groups = { AddGroup.class, EditGroup.class })
    private String traceroute;

    /**
     * ipv6支持
     */
    @NotBlank(message = "ipv6支持不能为空", groups = { AddGroup.class, EditGroup.class })
    private String ipv6;


}
