package org.dromara.ping.mapper;

import com.baomidou.mybatisplus.annotation.InterceptorIgnore;
import org.dromara.common.mybatis.core.mapper.BaseMapperPlus;
import org.dromara.ping.domain.PingLayoutConfig;
import org.dromara.ping.domain.vo.PingLayoutConfigVo;

@InterceptorIgnore(tenantLine = "true")
public interface PingLayoutConfigMapper extends BaseMapperPlus<PingLayoutConfig, PingLayoutConfigVo> {
}
