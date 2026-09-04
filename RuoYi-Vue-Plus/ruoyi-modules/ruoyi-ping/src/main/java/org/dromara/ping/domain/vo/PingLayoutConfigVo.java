package org.dromara.ping.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.ping.domain.PingLayoutConfig;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = PingLayoutConfig.class)
public class PingLayoutConfigVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @ExcelProperty(value = "ID")
    private Long id;

    @ExcelProperty(value = "配置标识")
    private String configKey;

    @ExcelProperty(value = "站点名称")
    private String siteName;

    @ExcelProperty(value = "Header Logo")
    private String logoUrl;

    @ExcelProperty(value = "Footer Logo")
    private String footerLogoUrl;

    @ExcelProperty(value = "Footer 标语")
    private String footerSlogan;

    @ExcelProperty(value = "版权")
    private String copyright;

    @ExcelProperty(value = "备案文案")
    private String icpText;

    @ExcelProperty(value = "备案链接")
    private String icpUrl;

    @ExcelProperty(value = "服务文案")
    private String serviceText;

    @ExcelProperty(value = "服务链接文案")
    private String serviceLinkText;

    @ExcelProperty(value = "服务链接")
    private String serviceLinkUrl;

    @ExcelProperty(value = "导航JSON")
    private String navItemsJson;

    @ExcelProperty(value = "页脚栏目JSON")
    private String footerColumnsJson;

    @ExcelProperty(value = "友情链接JSON")
    private String friendshipLinksJson;

    @ExcelProperty(value = "公告JSON")
    private String announcementsJson;

    @ExcelProperty(value = "首页功能卡片JSON")
    private String homeToolsJson;

    @ExcelProperty(value = "状态")
    private String status;

    @ExcelProperty(value = "备注")
    private String remark;

    private Date createTime;
    private Date updateTime;
}
