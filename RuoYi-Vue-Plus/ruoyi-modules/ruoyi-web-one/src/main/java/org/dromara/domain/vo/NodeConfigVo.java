package org.dromara.domain.vo;

import org.dromara.domain.NodeConfig;
import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import org.dromara.common.excel.annotation.ExcelDictFormat;
import org.dromara.common.excel.convert.ExcelDictConvert;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;



/**
 * 节点信息视图对象 node_config
 *
 * @author Lion Li
 * @date 2026-06-17
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = NodeConfig.class)
public class NodeConfigVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * ID
     */
    @ExcelProperty(value = "ID")
    private Long id;

    /**
     * 国家
     */
    @ExcelProperty(value = "国家")
    private String country;

    /**
     * 是否是海外
     */
    @ExcelProperty(value = "是否是海外", converter = ExcelDictConvert.class)
    @ExcelDictFormat(dictType = "node_state")
    private String overseas;

    /**
     * 区域
     */
    @ExcelProperty(value = "区域", converter = ExcelDictConvert.class)
    @ExcelDictFormat(dictType = "node_region")
    private String region;

    /**
     * 城市
     */
    @ExcelProperty(value = "城市")
    private String city;

    /**
     * 运营商
     */
    @ExcelProperty(value = "运营商", converter = ExcelDictConvert.class)
    @ExcelDictFormat(dictType = "node_operators")
    private String operators;

    /**
     * 名称
     */
    @ExcelProperty(value = "名称")
    private String name;

    /**
     * 权重
     */
    @ExcelProperty(value = "权重")
    private Long weight;

    /**
     * 坐标
     */
    @ExcelProperty(value = "坐标")
    private String coordinate;

    /**
     * 状态
     */
    @ExcelProperty(value = "状态", converter = ExcelDictConvert.class)
    @ExcelDictFormat(dictType = "node_state")
    private String state;

    /**
     * 备注信息
     */
    @ExcelProperty(value = "备注信息")
    private String content;

    /**
     * 备注信息2
     */
    @ExcelProperty(value = "备注信息2")
    private String content2;

    /**
     * 备注信息3
     */
    @ExcelProperty(value = "备注信息3")
    private String content3;

    /**
     * 在线时刻
     */
    @ExcelProperty(value = "在线时刻")
    private Long online;

    /**
     * 是否家宽
     */
    @ExcelProperty(value = "是否家宽", converter = ExcelDictConvert.class)
    @ExcelDictFormat(dictType = "node_state")
    private String homeState;

    /**
     * 省份
     */
    @ExcelProperty(value = "省份", converter = ExcelDictConvert.class)
    @ExcelDictFormat(dictType = "node_province")
    private String province;

    /**
     * 路由追踪开启
     */
    @ExcelProperty(value = "路由追踪开启", converter = ExcelDictConvert.class)
    @ExcelDictFormat(dictType = "node_state")
    private String traceroute;

    /**
     * ipv6支持
     */
    @ExcelProperty(value = "ipv6支持", converter = ExcelDictConvert.class)
    @ExcelDictFormat(dictType = "node_state")
    private String ipv6;


}
