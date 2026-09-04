package org.dromara.web.domain.vo;

import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;
import org.dromara.web.domain.AdLinks;
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
 * 广告链接视图对象 ad_links
 *
 * @author Lion Li
 * @date 2026-05-15
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = AdLinks.class)
public class AdLinksVo implements Serializable {

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
     * 类型
     */
    @ExcelProperty(value = "类型", converter = ExcelDictConvert.class)
    @ExcelDictFormat(dictType = "ad_type")
    private String type;

    /**
     * 连接地址
     */
    @ExcelProperty(value = "连接地址")
    private String url;

    /**
     * 图片地址
     */
    @ExcelProperty(value = "图片地址")
    private String imgUrl;

    /**
     * 到期时间
     */
    @ExcelProperty(value = "到期时间")
    private Date delTime;

    /**
     * 权重
     */
    @ExcelProperty(value = "权重")
    private Long weight;


}
