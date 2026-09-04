package org.dromara.web.domain.vo;

import org.dromara.web.domain.FriendshipLinks;
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
 * 友情链接视图对象 friendship_links
 *
 * @author Lion Li
 * @date 2026-05-14
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = FriendshipLinks.class)
public class FriendshipLinksVo implements Serializable {

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
     * 连接地址
     */
    @ExcelProperty(value = "连接地址")
    private String url;

    /**
     * 权重
     */
    @ExcelProperty(value = "权重")
    private Long weight;


}
