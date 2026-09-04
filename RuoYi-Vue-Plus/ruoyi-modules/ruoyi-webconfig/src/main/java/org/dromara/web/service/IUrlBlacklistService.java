package org.dromara.web.service;

import org.dromara.web.domain.vo.UrlBlacklistInfoVo;
import org.dromara.web.domain.vo.UrlBlacklistVo;
import org.dromara.web.domain.bo.UrlBlacklistBo;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.common.mybatis.core.page.PageQuery;

import java.util.Collection;
import java.util.List;

/**
 * 域名黑名单Service接口
 *
 * @author Lion Li
 * @date 2026-05-20
 */
public interface IUrlBlacklistService {

    /**
     * 查询域名黑名单
     *
     * @param id 主键
     * @return 域名黑名单
     */
    UrlBlacklistVo queryById(Long id);

    /**
     * 分页查询域名黑名单列表
     *
     * @param bo        查询条件
     * @param pageQuery 分页参数
     * @return 域名黑名单分页列表
     */
    TableDataInfo<UrlBlacklistVo> queryPageList(UrlBlacklistBo bo, PageQuery pageQuery);

    /**
     * 查询符合条件的域名黑名单列表
     *
     * @param bo 查询条件
     * @return 域名黑名单列表
     */
    List<UrlBlacklistVo> queryList(UrlBlacklistBo bo);

    /**
     * 查询 URL/IP 是否命中黑名单
     *
     * @param value URL/IP/域名
     * @return 命中结果
     */
    UrlBlacklistInfoVo queryInfo(String value);

    /**
     * 新增域名黑名单
     *
     * @param bo 域名黑名单
     * @return 是否新增成功
     */
    Boolean insertByBo(UrlBlacklistBo bo);

    /**
     * 修改域名黑名单
     *
     * @param bo 域名黑名单
     * @return 是否修改成功
     */
    Boolean updateByBo(UrlBlacklistBo bo);

    /**
     * 校验并批量删除域名黑名单信息
     *
     * @param ids     待删除的主键集合
     * @param isValid 是否进行有效性校验
     * @return 是否删除成功
     */
    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
