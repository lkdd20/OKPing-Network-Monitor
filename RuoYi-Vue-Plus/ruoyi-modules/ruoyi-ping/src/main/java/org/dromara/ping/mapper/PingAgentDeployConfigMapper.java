package org.dromara.ping.mapper;

import com.baomidou.mybatisplus.annotation.InterceptorIgnore;
import org.dromara.common.mybatis.core.mapper.BaseMapperPlus;
import org.dromara.ping.domain.PingAgentDeployConfig;
import org.dromara.ping.domain.vo.PingAgentDeployConfigVo;

@InterceptorIgnore(tenantLine = "true")
public interface PingAgentDeployConfigMapper
    extends BaseMapperPlus<PingAgentDeployConfig, PingAgentDeployConfigVo> {
}
