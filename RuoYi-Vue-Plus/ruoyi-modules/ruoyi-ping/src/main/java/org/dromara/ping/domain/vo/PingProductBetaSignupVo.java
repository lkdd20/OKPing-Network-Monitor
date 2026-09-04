package org.dromara.ping.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.ping.domain.PingProductBetaSignup;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = PingProductBetaSignup.class)
public class PingProductBetaSignupVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @ExcelProperty("报名ID")
    private Long id;

    @ExcelProperty("用户ID")
    private Long userId;

    @ExcelProperty("用户账号")
    private String userName;

    @ExcelProperty("用户昵称")
    private String nickname;

    @ExcelProperty("报名状态")
    private String status;

    @ExcelProperty("报名来源")
    private String source;

    @ExcelProperty("报名时间")
    private Date createTime;

    @ExcelProperty("通知时间")
    private Date notifiedTime;

    private String remark;
    private Date updateTime;
}
