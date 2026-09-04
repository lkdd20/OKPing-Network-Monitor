package org.dromara.ping.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.ping.domain.bo.PingMilestoneBo;
import org.dromara.ping.domain.vo.PingMilestoneVo;
import org.dromara.ping.domain.vo.PingPublicMilestoneVo;

import java.util.Collection;
import java.util.List;

public interface IPingMilestoneService {

    PingMilestoneVo queryById(Long id);

    TableDataInfo<PingMilestoneVo> queryPageList(PingMilestoneBo bo, PageQuery pageQuery);

    Boolean insertByBo(PingMilestoneBo bo);

    Boolean updateByBo(PingMilestoneBo bo);

    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);

    List<PingPublicMilestoneVo> queryPublicList();
}
