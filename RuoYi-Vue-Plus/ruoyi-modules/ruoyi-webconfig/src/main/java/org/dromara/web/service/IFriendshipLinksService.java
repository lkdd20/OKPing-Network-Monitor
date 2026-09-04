package org.dromara.web.service;

import org.dromara.web.domain.vo.FriendshipLinksVo;
import org.dromara.web.domain.bo.FriendshipLinksBo;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.common.mybatis.core.page.PageQuery;

import java.util.Collection;
import java.util.List;

/**
 * 友情链接Service接口
 *
 * @author Lion Li
 * @date 2026-05-14
 */
public interface IFriendshipLinksService {

    /**
     * 查询友情链接
     *
     * @param id 主键
     * @return 友情链接
     */
    FriendshipLinksVo queryById(Long id);

    /**
     * 分页查询友情链接列表
     *
     * @param bo        查询条件
     * @param pageQuery 分页参数
     * @return 友情链接分页列表
     */
    TableDataInfo<FriendshipLinksVo> queryPageList(FriendshipLinksBo bo, PageQuery pageQuery);

    /**
     * 查询符合条件的友情链接列表
     *
     * @param bo 查询条件
     * @return 友情链接列表
     */
    List<FriendshipLinksVo> queryList(FriendshipLinksBo bo);

    /**
     * 查询全部友情链接列表（缓存）
     *
     * @return 友情链接列表
     */
    List<FriendshipLinksVo> queryCachedList();

    /**
     * 新增友情链接
     *
     * @param bo 友情链接
     * @return 是否新增成功
     */
    Boolean insertByBo(FriendshipLinksBo bo);

    /**
     * 修改友情链接
     *
     * @param bo 友情链接
     * @return 是否修改成功
     */
    Boolean updateByBo(FriendshipLinksBo bo);

    /**
     * 校验并批量删除友情链接信息
     *
     * @param ids     待删除的主键集合
     * @param isValid 是否进行有效性校验
     * @return 是否删除成功
     */
    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
