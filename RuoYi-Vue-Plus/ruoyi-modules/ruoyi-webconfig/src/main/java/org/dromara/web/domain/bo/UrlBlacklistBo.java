package org.dromara.web.domain.bo;

import org.dromara.web.domain.UrlBlacklist;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.validation.constraints.*;
import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * 域名黑名单业务对象 url_blacklist
 *
 * @author Lion Li
 * @date 2026-05-20
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = UrlBlacklist.class, reverseConvertGenerate = false)
public class UrlBlacklistBo extends BaseEntity {

    /**
     * ID
     */
    @NotNull(message = "ID不能为空", groups = { EditGroup.class })
    private Long id;

    /**
     * 匹配值
     */
    private String value;

    /**
     * 是否生效
     */
    private Long status;

    /**
     * 拦截到期时间
     */
    private Date stopTime;


}
