package org.dromara.ping.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.ping.domain.PingPageConfig;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = PingPageConfig.class)
public class PingPageConfigVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @ExcelProperty(value = "ID")
    private Long id;

    @ExcelProperty(value = "页面标识")
    private String pageKey;

    @ExcelProperty(value = "页面名称")
    private String pageName;

    @ExcelProperty(value = "标题模板")
    private String titleTemplate;

    @ExcelProperty(value = "描述模板")
    private String descriptionTemplate;

    @ExcelProperty(value = "关键词模板")
    private String keywordsTemplate;

    @ExcelProperty(value = "H1模板")
    private String h1Template;

    @ExcelProperty(value = "简介模板")
    private String introTemplate;

    @ExcelProperty(value = "状态")
    private String status;

    @ExcelProperty(value = "排序")
    private Long sortOrder;

    @ExcelProperty(value = "备注")
    private String remark;

    private Date createTime;
    private Date updateTime;
}
