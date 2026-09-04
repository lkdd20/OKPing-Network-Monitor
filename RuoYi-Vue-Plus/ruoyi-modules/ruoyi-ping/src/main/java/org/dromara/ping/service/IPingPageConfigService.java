package org.dromara.ping.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.ping.domain.bo.PingPageConfigBo;
import org.dromara.ping.domain.vo.PingPageConfigVo;
import org.dromara.ping.domain.vo.PingPublicPageConfigVo;

import java.util.Collection;
import java.util.List;

public interface IPingPageConfigService {

    PingPageConfigVo queryById(Long id);

    TableDataInfo<PingPageConfigVo> queryPageList(PingPageConfigBo bo, PageQuery pageQuery);

    List<PingPageConfigVo> queryList(PingPageConfigBo bo);

    PingPublicPageConfigVo queryPublicConfig(String pageKey, String target, String canonicalPath);

    Boolean insertByBo(PingPageConfigBo bo);

    Boolean updateByBo(PingPageConfigBo bo);

    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
