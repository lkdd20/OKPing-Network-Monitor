package org.dromara.ping.mapper;

import com.baomidou.mybatisplus.annotation.InterceptorIgnore;
import org.dromara.common.mybatis.core.mapper.BaseMapperPlus;
import org.dromara.ping.domain.PingNodeConfig;
import org.dromara.ping.domain.vo.PingNodeConfigVo;

@InterceptorIgnore(tenantLine = "true")
public interface PingNodeConfigMapper extends BaseMapperPlus<PingNodeConfig, PingNodeConfigVo> {
}
