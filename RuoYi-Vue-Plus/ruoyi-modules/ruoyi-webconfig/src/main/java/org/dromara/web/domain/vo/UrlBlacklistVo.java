package org.dromara.web.domain.vo;

import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;
import org.dromara.web.domain.UrlBlacklist;
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
 * 域名黑名单视图对象 url_blacklist
 *
 * @author Lion Li
 * @date 2026-05-20
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = UrlBlacklist.class)
public class UrlBlacklistVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * ID
     */
    @ExcelProperty(value = "ID")
    private Long id;

    /**
     * 匹配值
     */
    @ExcelProperty(value = "匹配值")
    private String value;

    /**
     * 是否生效
     */
    @ExcelProperty(value = "是否生效", converter = ExcelDictConvert.class)
    @ExcelDictFormat(dictType = "url_blacklist_status")
    private Long status;

    /**
     * 拦截到期时间
     */
    @ExcelProperty(value = "拦截到期时间")
    private Date stopTime;


}
