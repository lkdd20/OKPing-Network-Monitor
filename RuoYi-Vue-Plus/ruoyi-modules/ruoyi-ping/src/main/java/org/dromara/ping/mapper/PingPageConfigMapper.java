package org.dromara.ping.mapper;

import com.baomidou.mybatisplus.annotation.InterceptorIgnore;
import org.dromara.common.mybatis.core.mapper.BaseMapperPlus;
import org.dromara.ping.domain.PingPageConfig;
import org.dromara.ping.domain.vo.PingPageConfigVo;

@InterceptorIgnore(tenantLine = "true")
public interface PingPageConfigMapper extends BaseMapperPlus<PingPageConfig, PingPageConfigVo> {
}
