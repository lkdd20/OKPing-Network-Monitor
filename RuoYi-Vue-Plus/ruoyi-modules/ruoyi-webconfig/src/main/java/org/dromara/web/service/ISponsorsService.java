package org.dromara.web.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.web.domain.bo.SponsorsBo;
import org.dromara.web.domain.vo.SponsorsListVo;
import org.dromara.web.domain.vo.SponsorsVo;

import java.util.Collection;
import java.util.List;

/**
 * 赞助商Service接口
 *
 * @author Lion Li
 * @date 2026-06-04
 */
public interface ISponsorsService {

    /**
     * 查询赞助商
     *
     * @param id 主键
     * @return 赞助商
     */
    SponsorsVo queryById(Long id);

    /**
     * 分页查询赞助商列表
     *
     * @param bo        查询条件
     * @param pageQuery 分页参数
     * @return 赞助商分页列表
     */
    TableDataInfo<SponsorsVo> queryPageList(SponsorsBo bo, PageQuery pageQuery);

    /**
     * 查询符合条件的赞助商列表
     *
     * @param bo 查询条件
     * @return 赞助商列表
     */
    List<SponsorsVo> queryList(SponsorsBo bo);

    /**
     * 查询公开赞助商列表
     *
     * @return 公开赞助商列表
     */
    List<SponsorsListVo> queryCachedList();

    /**
     * 新增赞助商
     *
     * @param bo 赞助商
     * @return 是否新增成功
     */
    Boolean insertByBo(SponsorsBo bo);

    /**
     * 修改赞助商
     *
     * @param bo 赞助商
     * @return 是否修改成功
     */
    Boolean updateByBo(SponsorsBo bo);

    /**
     * 校验并批量删除赞助商信息
     *
     * @param ids     待删除的主键集合
     * @param isValid 是否进行有效性校验
     * @return 是否删除成功
     */
    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
