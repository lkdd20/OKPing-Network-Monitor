package org.dromara.ping.domain.bo;

import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.ping.domain.PingNodeConfig;

import java.io.Serial;
import java.io.Serializable;

@Data
@AutoMapper(target = PingNodeConfig.class, reverseConvertGenerate = false)
public class PingNodeConfigBo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @NotNull(message = "ID不能为空", groups = { EditGroup.class })
    private Long id;

    @NotBlank(message = "国家不能为空", groups = { AddGroup.class, EditGroup.class })
    private String country;

    private String overseas;

    @NotBlank(message = "区域不能为空", groups = { AddGroup.class, EditGroup.class })
    private String region;

    @NotBlank(message = "省份不能为空", groups = { AddGroup.class, EditGroup.class })
    private String province;

    @NotBlank(message = "城市不能为空", groups = { AddGroup.class, EditGroup.class })
    private String city;

    @NotBlank(message = "运营商不能为空", groups = { AddGroup.class, EditGroup.class })
    private String operators;

    @NotBlank(message = "名称不能为空", groups = { AddGroup.class, EditGroup.class })
    private String name;

    @NotBlank(message = "IP不能为空", groups = { AddGroup.class, EditGroup.class })
    private String ip;

    @NotNull(message = "权重不能为空", groups = { AddGroup.class, EditGroup.class })
    private Long weight;

    @NotBlank(message = "状态不能为空", groups = { AddGroup.class, EditGroup.class })
    private String state;

    private String rqState;

    private String exchange;

    @NotBlank(message = "队列不能为空", groups = { EditGroup.class })
    private String queue;

    @NotBlank(message = "绑定数据不能为空", groups = { EditGroup.class })
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
