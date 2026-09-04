package org.dromara.service.impl;

import org.dromara.common.core.service.DictService;
import org.dromara.common.core.utils.MapstructUtils;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.redis.utils.RedisUtils;
import org.dromara.common.tenant.helper.TenantHelper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dromara.domain.bo.NodeConfigAvailableBo;
import org.springframework.stereotype.Service;
import org.dromara.domain.bo.NodeConfigBo;
import org.dromara.domain.vo.NodeConfigVo;
import org.dromara.domain.NodeConfig;
import org.dromara.mapper.NodeConfigMapper;
import org.dromara.service.INodeConfigService;

import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Collection;
import java.util.stream.Collectors;

/**
 * 节点信息Service业务层处理
 *
 * @author Lion Li
 * @date 2026-06-17
 */
@Slf4j
@RequiredArgsConstructor
@Service
public class NodeConfigServiceImpl implements INodeConfigService {

    private static final String NODE_STATE_DICT_TYPE = "node_state";
    private static final String ENABLED_STATE_LABEL = "开启";
    private static final String ENABLED_STATE_FALLBACK_VALUE = "true";
    private static final String AVAILABLE_CACHE_KEY_PREFIX = "webone:node_config:available:";
    private static final Duration AVAILABLE_CACHE_TTL = Duration.ofMinutes(5);
    private static final String CACHE_ALL_VALUE = "all";
    private static final String DEFAULT_TENANT_VALUE = "default";

    private final NodeConfigMapper baseMapper;
    private final DictService dictService;

    /**
     * 查询节点信息
     *
     * @param id 主键
     * @return 节点信息
     */
    @Override
    public NodeConfigVo queryById(Long id){
        return baseMapper.selectVoById(id);
    }

    /**
     * 分页查询节点信息列表
     *
     * @param bo        查询条件
     * @param pageQuery 分页参数
     * @return 节点信息分页列表
     */
    @Override
    public TableDataInfo<NodeConfigVo> queryPageList(NodeConfigBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<NodeConfig> lqw = buildQueryWrapper(bo);
        Page<NodeConfigVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    /**
     * 查询符合条件的节点信息列表
     *
     * @param bo 查询条件
     * @return 节点信息列表
     */
    @Override
    public List<NodeConfigVo> queryList(NodeConfigBo bo) {
        LambdaQueryWrapper<NodeConfig> lqw = buildQueryWrapper(bo);
        return baseMapper.selectVoList(lqw);
    }

    /**
     * 查询开启状态且符合节点能力条件的节点列表
     *
     * @param bo 查询条件
     * @return 节点信息列表
     */
    @Override
    public List<NodeConfigVo> queryAvailableNodes(NodeConfigAvailableBo bo) {
        NodeConfigAvailableBo queryBo = bo == null ? new NodeConfigAvailableBo() : bo;
        List<String> operatorList = normalizeOperators(queryBo.getOperators());
        String ipv6 = StringUtils.trim(queryBo.getIpv6());
        String traceroute = StringUtils.trim(queryBo.getTraceroute());
        String cacheKey = buildAvailableCacheKey(operatorList, ipv6, traceroute);
        List<NodeConfigVo> cacheList = RedisUtils.getCacheObject(cacheKey);
        if (cacheList != null) {
            return cacheList;
        }
        String enabledState = getEnabledStateValue();
        LambdaQueryWrapper<NodeConfig> lqw = Wrappers.lambdaQuery();
        lqw.eq(NodeConfig::getState, enabledState);
        lqw.in(!operatorList.isEmpty(), NodeConfig::getOperators, operatorList);
        lqw.eq(StringUtils.isNotBlank(ipv6), NodeConfig::getIpv6, ipv6);
        lqw.eq(StringUtils.isNotBlank(traceroute), NodeConfig::getTraceroute, traceroute);
        lqw.orderByDesc(NodeConfig::getWeight);
        lqw.orderByAsc(NodeConfig::getId);
        List<NodeConfigVo> list = baseMapper.selectVoList(lqw);
        RedisUtils.setCacheObject(cacheKey, list, AVAILABLE_CACHE_TTL);
        return list;
    }

    private List<String> normalizeOperators(List<String> operators) {
        if (operators == null || operators.isEmpty()) {
            return List.of();
        }
        return operators.stream()
            .filter(StringUtils::isNotBlank)
            .flatMap(operator -> Arrays.stream(operator.split("[,，]")))
            .map(String::trim)
            .filter(StringUtils::isNotBlank)
            .distinct()
            .toList();
    }

    private String getEnabledStateValue() {
        String enabledState = dictService.getDictValue(NODE_STATE_DICT_TYPE, ENABLED_STATE_LABEL);
        return StringUtils.isNotBlank(enabledState) ? enabledState : ENABLED_STATE_FALLBACK_VALUE;
    }

    private String buildAvailableCacheKey(List<String> operatorList, String ipv6, String traceroute) {
        String tenantId = StringUtils.blankToDefault(TenantHelper.getTenantId(), DEFAULT_TENANT_VALUE);
        String operators = operatorList.stream().sorted().collect(Collectors.joining(","));
        return AVAILABLE_CACHE_KEY_PREFIX
            + tenantId
            + ":operators=" + StringUtils.blankToDefault(operators, CACHE_ALL_VALUE)
            + ":ipv6=" + StringUtils.blankToDefault(ipv6, CACHE_ALL_VALUE)
            + ":traceroute=" + StringUtils.blankToDefault(traceroute, CACHE_ALL_VALUE);
    }

    private void clearAvailableCache() {
        RedisUtils.deleteKeys(AVAILABLE_CACHE_KEY_PREFIX + "*");
    }

    private LambdaQueryWrapper<NodeConfig> buildQueryWrapper(NodeConfigBo bo) {
        Map<String, Object> params = bo.getParams();
        LambdaQueryWrapper<NodeConfig> lqw = Wrappers.lambdaQuery();
        lqw.orderByDesc(NodeConfig::getWeight);
        lqw.orderByAsc(NodeConfig::getId);
        lqw.eq(StringUtils.isNotBlank(bo.getCountry()), NodeConfig::getCountry, bo.getCountry());
        lqw.eq(StringUtils.isNotBlank(bo.getOverseas()), NodeConfig::getOverseas, bo.getOverseas());
        lqw.eq(StringUtils.isNotBlank(bo.getRegion()), NodeConfig::getRegion, bo.getRegion());
        lqw.eq(StringUtils.isNotBlank(bo.getCity()), NodeConfig::getCity, bo.getCity());
        lqw.eq(StringUtils.isNotBlank(bo.getOperators()), NodeConfig::getOperators, bo.getOperators());
        lqw.like(StringUtils.isNotBlank(bo.getName()), NodeConfig::getName, bo.getName());
        lqw.eq(bo.getWeight() != null, NodeConfig::getWeight, bo.getWeight());
        lqw.eq(StringUtils.isNotBlank(bo.getCoordinate()), NodeConfig::getCoordinate, bo.getCoordinate());
        lqw.eq(StringUtils.isNotBlank(bo.getState()), NodeConfig::getState, bo.getState());
        lqw.eq(StringUtils.isNotBlank(bo.getContent()), NodeConfig::getContent, bo.getContent());
        lqw.eq(StringUtils.isNotBlank(bo.getContent2()), NodeConfig::getContent2, bo.getContent2());
        lqw.eq(StringUtils.isNotBlank(bo.getContent3()), NodeConfig::getContent3, bo.getContent3());
        lqw.eq(bo.getOnline() != null, NodeConfig::getOnline, bo.getOnline());
        lqw.eq(StringUtils.isNotBlank(bo.getHomeState()), NodeConfig::getHomeState, bo.getHomeState());
        lqw.eq(StringUtils.isNotBlank(bo.getProvince()), NodeConfig::getProvince, bo.getProvince());
        lqw.eq(StringUtils.isNotBlank(bo.getTraceroute()), NodeConfig::getTraceroute, bo.getTraceroute());
        lqw.eq(StringUtils.isNotBlank(bo.getIpv6()), NodeConfig::getIpv6, bo.getIpv6());
        return lqw;
    }

    /**
     * 新增节点信息
     *
     * @param bo 节点信息
     * @return 是否新增成功
     */
    @Override
    public Boolean insertByBo(NodeConfigBo bo) {
        NodeConfig add = MapstructUtils.convert(bo, NodeConfig.class);
        validEntityBeforeSave(add);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
            clearAvailableCache();
        }
        return flag;
    }

    /**
     * 修改节点信息
     *
     * @param bo 节点信息
     * @return 是否修改成功
     */
    @Override
    public Boolean updateByBo(NodeConfigBo bo) {
        NodeConfig update = MapstructUtils.convert(bo, NodeConfig.class);
        validEntityBeforeSave(update);
        boolean flag = baseMapper.updateById(update) > 0;
        if (flag) {
            clearAvailableCache();
        }
        return flag;
    }

    /**
     * 保存前的数据校验
     */
    private void validEntityBeforeSave(NodeConfig entity){
        //TODO 做一些数据校验,如唯一约束
    }

    /**
     * 校验并批量删除节点信息信息
     *
     * @param ids     待删除的主键集合
     * @param isValid 是否进行有效性校验
     * @return 是否删除成功
     */
    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        if(isValid){
            //TODO 做一些业务上的校验,判断是否需要校验
        }
        boolean flag = baseMapper.deleteByIds(ids) > 0;
        if (flag) {
            clearAvailableCache();
        }
        return flag;
    }
}
