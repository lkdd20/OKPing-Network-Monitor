package org.dromara.ping.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.ping.domain.PingBlogPost;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = PingBlogPost.class)
public class PingBlogPostVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @ExcelProperty("ID")
    private Long id;

    @ExcelProperty("标题")
    private String title;

    @ExcelProperty("文章别名")
    private String slug;

    @ExcelProperty("摘要")
    private String summary;

    private String content;
    private Long coverOssId;
    private String coverUrl;

    @ExcelProperty("分类")
    private String category;

    @ExcelProperty("标签")
    private String tags;

    @ExcelProperty("状态")
    private String status;

    @ExcelProperty("推荐")
    private Boolean featured;

    @ExcelProperty("排序")
    private Long sortOrder;

    @ExcelProperty("发布时间")
    private Date publishTime;

    private String seoTitle;
    private String seoDescription;
    private String seoKeywords;
    private String remark;
    private Date createTime;
    private Date updateTime;
}
