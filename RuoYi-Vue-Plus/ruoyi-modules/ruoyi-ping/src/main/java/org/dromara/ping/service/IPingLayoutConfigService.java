package org.dromara.ping.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.ping.domain.bo.PingLayoutConfigBo;
import org.dromara.ping.domain.vo.PingLayoutConfigVo;
import org.dromara.ping.domain.vo.PingPublicLayoutConfigVo;

import java.util.Collection;
import java.util.List;

public interface IPingLayoutConfigService {

    PingLayoutConfigVo queryById(Long id);

    TableDataInfo<PingLayoutConfigVo> queryPageList(PingLayoutConfigBo bo, PageQuery pageQuery);

    List<PingLayoutConfigVo> queryList(PingLayoutConfigBo bo);

    PingPublicLayoutConfigVo queryPublicConfig(String configKey);

    Boolean insertByBo(PingLayoutConfigBo bo);

    Boolean updateByBo(PingLayoutConfigBo bo);

    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
