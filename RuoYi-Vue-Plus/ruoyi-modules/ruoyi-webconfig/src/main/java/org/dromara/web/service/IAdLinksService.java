package org.dromara.web.service;

import org.dromara.web.domain.vo.AdLinksVo;
import org.dromara.web.domain.vo.AdLinksListVo;
import org.dromara.web.domain.bo.AdLinksBo;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.common.mybatis.core.page.PageQuery;

import java.util.Collection;
import java.util.List;
import java.util.Map;

/**
 * 广告链接Service接口
 *
 * @author Lion Li
 * @date 2026-05-15
 */
public interface IAdLinksService {

    /**
     * 查询广告链接
     *
     * @param id 主键
     * @return 广告链接
     */
    AdLinksVo queryById(Long id);

    /**
     * 分页查询广告链接列表
     *
     * @param bo        查询条件
     * @param pageQuery 分页参数
     * @return 广告链接分页列表
     */
    TableDataInfo<AdLinksVo> queryPageList(AdLinksBo bo, PageQuery pageQuery);

    /**
     * 查询符合条件的广告链接列表
     *
     * @param bo 查询条件
     * @return 广告链接列表
     */
    List<AdLinksVo> queryList(AdLinksBo bo);

    /**
     * 查询全部广告链接列表（按类型分组缓存）
     *
     * @return 广告链接分组列表
     */
    Map<String, List<AdLinksListVo>> queryCachedList();

    /**
     * 新增广告链接
     *
     * @param bo 广告链接
     * @return 是否新增成功
     */
    Boolean insertByBo(AdLinksBo bo);

    /**
     * 修改广告链接
     *
     * @param bo 广告链接
     * @return 是否修改成功
     */
    Boolean updateByBo(AdLinksBo bo);

    /**
     * 校验并批量删除广告链接信息
     *
     * @param ids     待删除的主键集合
     * @param isValid 是否进行有效性校验
     * @return 是否删除成功
     */
    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
