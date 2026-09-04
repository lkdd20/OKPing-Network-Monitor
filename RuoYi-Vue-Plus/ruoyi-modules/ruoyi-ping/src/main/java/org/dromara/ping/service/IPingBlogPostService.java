package org.dromara.ping.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.ping.domain.bo.PingBlogPostBo;
import org.dromara.ping.domain.vo.PingBlogPostVo;
import org.dromara.ping.domain.vo.PingPublicBlogPageVo;
import org.dromara.ping.domain.vo.PingPublicBlogPostDetailVo;

import java.util.Collection;

public interface IPingBlogPostService {

    PingBlogPostVo queryById(Long id);

    TableDataInfo<PingBlogPostVo> queryPageList(PingBlogPostBo bo, PageQuery pageQuery);

    Boolean insertByBo(PingBlogPostBo bo);

    Boolean updateByBo(PingBlogPostBo bo);

    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);

    PingPublicBlogPageVo queryPublicPage(String keyword, String category, Integer pageNum, Integer pageSize);

    PingPublicBlogPostDetailVo queryPublicDetail(String slug);
}
