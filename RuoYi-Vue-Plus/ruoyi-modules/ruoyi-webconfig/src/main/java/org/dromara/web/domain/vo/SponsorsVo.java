package org.dromara.web.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.web.domain.Sponsors;

import java.io.Serial;
import java.io.Serializable;

/**
 * 赞助商视图对象 sponsors
 *
 * @author Lion Li
 * @date 2026-06-04
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = Sponsors.class)
public class SponsorsVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    @ExcelProperty(value = "主键")
    private Long id;

    /**
     * 名称
     */
    @ExcelProperty(value = "名称")
    private String name;

    /**
     * 链接地址
     */
    @ExcelProperty(value = "链接地址")
    private String url;

    /**
     * 图片地址
     */
    @ExcelProperty(value = "图片地址")
    private String imgUrl;

    /**
     * 权重
     */
    @ExcelProperty(value = "权重")
    private Long weight;

}
