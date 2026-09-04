package org.dromara.ping.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.common.excel.annotation.ExcelDictFormat;
import org.dromara.common.excel.convert.ExcelDictConvert;
import org.dromara.ping.domain.PingNodeConfig;

import java.io.Serial;
import java.io.Serializable;

@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = PingNodeConfig.class)
public class PingNodeConfigVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @ExcelProperty(value = "ID")
    private Long id;

    @ExcelProperty(value = "国家")
    private String country;

    @ExcelProperty(value = "是否海外")
    private String overseas;

    @ExcelProperty(value = "区域", converter = ExcelDictConvert.class)
    @ExcelDictFormat(dictType = "node_region")
    private String region;

    @ExcelProperty(value = "省份", converter = ExcelDictConvert.class)
    @ExcelDictFormat(dictType = "node_province")
    private String province;

    @ExcelProperty(value = "城市")
    private String city;

    @ExcelProperty(value = "运营商", converter = ExcelDictConvert.class)
    @ExcelDictFormat(dictType = "node_operators")
    private String operators;

    @ExcelProperty(value = "名称")
    private String name;

    @ExcelProperty(value = "IP")
    private String ip;

    @ExcelProperty(value = "权重")
    private Long weight;

    @ExcelProperty(value = "状态")
    private String state;

    @ExcelProperty(value = "运行状态")
    private String rqState;

    @ExcelProperty(value = "交换机")
    private String exchange;

    @ExcelProperty(value = "队列")
    private String queue;

    @ExcelProperty(value = "绑定数据")
    private String binding;

    @ExcelProperty(value = "赞助商文字")
    private String sponsorText;

    @ExcelProperty(value = "赞助商链接")
    private String sponsorUrl;

    @ExcelProperty(value = "备注信息")
    private String content;

    @ExcelProperty(value = "备注信息2")
    private String content2;

    @ExcelProperty(value = "备注信息3")
    private String content3;

    @ExcelProperty(value = "创建时间")
    private Long createTime;

    @ExcelProperty(value = "过期时间")
    private Long endTime;

    @ExcelProperty(value = "在线时刻")
    private Long online;

    @ExcelProperty(value = "UUID")
    private String uuid;

    @ExcelProperty(value = "是否家宽")
    private Boolean homeState;

    @ExcelProperty(value = "路由追踪")
    private Boolean traceroute;

    @ExcelProperty(value = "IPv6")
    private Boolean ipv6;

    @ExcelProperty(value = "坐标")
    private String coordinate;
}
