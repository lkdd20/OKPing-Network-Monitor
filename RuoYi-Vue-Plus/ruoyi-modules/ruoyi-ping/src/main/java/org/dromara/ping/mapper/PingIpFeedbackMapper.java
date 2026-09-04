package org.dromara.ping.mapper;

import com.baomidou.mybatisplus.annotation.InterceptorIgnore;
import org.dromara.common.mybatis.core.mapper.BaseMapperPlus;
import org.dromara.ping.domain.PingIpFeedback;
import org.dromara.ping.domain.vo.PingIpFeedbackVo;

@InterceptorIgnore(tenantLine = "true")
public interface PingIpFeedbackMapper extends BaseMapperPlus<PingIpFeedback, PingIpFeedbackVo> {
}
