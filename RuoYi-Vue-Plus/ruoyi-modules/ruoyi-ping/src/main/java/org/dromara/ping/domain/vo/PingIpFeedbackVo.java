package org.dromara.ping.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.ping.domain.PingIpFeedback;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = PingIpFeedback.class)
public class PingIpFeedbackVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @ExcelProperty(value = "ID")
    private Long id;

    @ExcelProperty(value = "IP版本")
    private String ipVersion;

    @ExcelProperty(value = "起始IP")
    private String startIp;

    @ExcelProperty(value = "结束IP")
    private String endIp;

    @ExcelProperty(value = "正确归属地")
    private String location;

    @ExcelProperty(value = "审核状态")
    private String status;

    @ExcelProperty(value = "审核备注")
    private String reviewRemark;

    @ExcelProperty(value = "提交时间")
    private Date createTime;

    @ExcelProperty(value = "审核时间")
    private Date reviewTime;
}
