package org.dromara.ping.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.ping.domain.PingMilestone;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Date;

@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = PingMilestone.class)
public class PingMilestoneVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @ExcelProperty("ID")
    private Long id;

    @ExcelProperty("发生月份")
    private LocalDate milestoneDate;

    @ExcelProperty("里程碑内容")
    private String content;

    @ExcelProperty("状态")
    private String status;

    @ExcelProperty("排序权重")
    private Long sortOrder;

    private String remark;
    private Date createTime;
    private Date updateTime;
}
