package org.dromara.service;

import org.dromara.domain.vo.NodeConfigVo;
import org.dromara.domain.bo.NodeConfigAvailableBo;
import org.dromara.domain.bo.NodeConfigBo;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.common.mybatis.core.page.PageQuery;

import java.util.Collection;
import java.util.List;

/**
 * 节点信息Service接口
 *
 * @author Lion Li
 * @date 2026-06-17
 */
public interface INodeConfigService {

    /**
     * 查询节点信息
     *
     * @param id 主键
     * @return 节点信息
     */
    NodeConfigVo queryById(Long id);

    /**
     * 分页查询节点信息列表
     *
     * @param bo        查询条件
     * @param pageQuery 分页参数
     * @return 节点信息分页列表
     */
    TableDataInfo<NodeConfigVo> queryPageList(NodeConfigBo bo, PageQuery pageQuery);

    /**
     * 查询符合条件的节点信息列表
     *
     * @param bo 查询条件
     * @return 节点信息列表
     */
    List<NodeConfigVo> queryList(NodeConfigBo bo);

    /**
     * 查询开启状态且符合节点能力条件的节点列表
     *
     * @param bo 查询条件
     * @return 节点信息列表
     */
    List<NodeConfigVo> queryAvailableNodes(NodeConfigAvailableBo bo);

    /**
     * 新增节点信息
     *
     * @param bo 节点信息
     * @return 是否新增成功
     */
    Boolean insertByBo(NodeConfigBo bo);

    /**
     * 修改节点信息
     *
     * @param bo 节点信息
     * @return 是否修改成功
     */
    Boolean updateByBo(NodeConfigBo bo);

    /**
     * 校验并批量删除节点信息信息
     *
     * @param ids     待删除的主键集合
     * @param isValid 是否进行有效性校验
     * @return 是否删除成功
     */
    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
