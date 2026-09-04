package org.dromara.web.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dromara.common.core.utils.MapstructUtils;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.common.redis.utils.RedisUtils;
import org.dromara.common.tenant.helper.TenantHelper;
import org.dromara.web.domain.AdLinks;
import org.dromara.web.domain.bo.AdLinksBo;
import org.dromara.web.domain.vo.AdLinksListVo;
import org.dromara.web.domain.vo.AdLinksVo;
import org.dromara.web.mapper.AdLinksMapper;
import org.dromara.web.service.IAdLinksService;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Collection;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 广告链接Service业务层处理
 *
 * @author Lion Li
 * @date 2026-05-15
 */
@Slf4j
@RequiredArgsConstructor
@Service
public class AdLinksServiceImpl implements IAdLinksService {

    private static final String CACHE_KEY = "web:ad_links:list:v3";
    private static final String OLD_CACHE_KEY = "web:ad_links:list";
    private static final String OLD_LIST_CACHE_KEY = "web:ad_links:list:v2";

    private final AdLinksMapper baseMapper;

    /**
     * 查询广告链接
     *
     * @param id 主键
     * @return 广告链接
     */
    @Override
    public AdLinksVo queryById(Long id){
        return baseMapper.selectVoById(id);
    }

    /**
     * 分页查询广告链接列表
     *
     * @param bo        查询条件
     * @param pageQuery 分页参数
     * @return 广告链接分页列表
     */
    @Override
    public TableDataInfo<AdLinksVo> queryPageList(AdLinksBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<AdLinks> lqw = buildQueryWrapper(bo);
        Page<AdLinksVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    /**
     * 查询符合条件的广告链接列表
     *
     * @param bo 查询条件
     * @return 广告链接列表
     */
    @Override
    public List<AdLinksVo> queryList(AdLinksBo bo) {
        LambdaQueryWrapper<AdLinks> lqw = buildQueryWrapper(bo);
        return baseMapper.selectVoList(lqw);
    }

    /**
     * 查询全部广告链接列表（按类型分组缓存）
     *
     * @return 广告链接分组列表
     */
    @Override
    public Map<String, List<AdLinksListVo>> queryCachedList() {
        Map<String, List<AdLinksVo>> data = RedisUtils.getCacheObject(CACHE_KEY);
        if (data != null) {
            return toListData(filterValidData(data));
        }
        return refreshCache();
    }

    private LambdaQueryWrapper<AdLinks> buildQueryWrapper(AdLinksBo bo) {
        LambdaQueryWrapper<AdLinks> lqw = Wrappers.lambdaQuery();
        lqw.orderByDesc(AdLinks::getWeight);
        lqw.orderByAsc(AdLinks::getId);
        lqw.like(StringUtils.isNotBlank(bo.getName()), AdLinks::getName, bo.getName());
        lqw.eq(bo.getType() != null, AdLinks::getType, bo.getType());
        lqw.eq(StringUtils.isNotBlank(bo.getUrl()), AdLinks::getUrl, bo.getUrl());
        lqw.eq(StringUtils.isNotBlank(bo.getImgUrl()), AdLinks::getImgUrl, bo.getImgUrl());
        lqw.eq(bo.getDelTime() != null, AdLinks::getDelTime, bo.getDelTime());
        lqw.eq(bo.getWeight() != null, AdLinks::getWeight, bo.getWeight());
        return lqw;
    }

    private Map<String, List<AdLinksListVo>> refreshCache() {
        Date now = new Date();
        List<AdLinksVo> list = TenantHelper.ignore(() -> baseMapper.selectVoList(Wrappers.<AdLinks>lambdaQuery()
            .gt(AdLinks::getDelTime, now)
            .orderByDesc(AdLinks::getWeight)
            .orderByAsc(AdLinks::getId)));
        Map<String, List<AdLinksVo>> data = list.stream()
            .filter(item -> StringUtils.isNotBlank(item.getType()))
            .collect(Collectors.groupingBy(AdLinksVo::getType, LinkedHashMap::new, Collectors.toList()));
        RedisUtils.deleteObject(OLD_CACHE_KEY);
        RedisUtils.deleteObject(OLD_LIST_CACHE_KEY);
        RedisUtils.deleteObject(CACHE_KEY);
        RedisUtils.setCacheObject(CACHE_KEY, data, Duration.ofHours(1));
        return toListData(data);
    }

    private Map<String, List<AdLinksVo>> filterValidData(Map<String, List<AdLinksVo>> data) {
        Date now = new Date();
        Map<String, List<AdLinksVo>> validData = new LinkedHashMap<>();
        data.forEach((type, list) -> {
            List<AdLinksVo> validList = list.stream()
                .filter(item -> item.getDelTime() != null && item.getDelTime().after(now))
                .collect(Collectors.toList());
            if (!validList.isEmpty()) {
                validData.put(type, validList);
            }
        });
        return validData;
    }

    private Map<String, List<AdLinksListVo>> toListData(Map<String, List<AdLinksVo>> data) {
        Map<String, List<AdLinksListVo>> listData = new LinkedHashMap<>();
        data.forEach((type, list) -> listData.put(type, list.stream()
            .map(this::toListVo)
            .collect(Collectors.toList())));
        return listData;
    }

    private AdLinksListVo toListVo(AdLinksVo vo) {
        AdLinksListVo listVo = new AdLinksListVo();
        listVo.setName(vo.getName());
        listVo.setUrl(vo.getUrl());
        listVo.setImgUrl(vo.getImgUrl());
        return listVo;
    }

    /**
     * 新增广告链接
     *
     * @param bo 广告链接
     * @return 是否新增成功
     */
    @Override
    public Boolean insertByBo(AdLinksBo bo) {
        AdLinks add = MapstructUtils.convert(bo, AdLinks.class);
        validEntityBeforeSave(add);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
            refreshCache();
        }
        return flag;
    }

    /**
     * 修改广告链接
     *
     * @param bo 广告链接
     * @return 是否修改成功
     */
    @Override
    public Boolean updateByBo(AdLinksBo bo) {
        AdLinks update = MapstructUtils.convert(bo, AdLinks.class);
        validEntityBeforeSave(update);
        boolean flag = baseMapper.updateById(update) > 0;
        if (flag) {
            refreshCache();
        }
        return flag;
    }

    /**
     * 保存前的数据校验
     */
    private void validEntityBeforeSave(AdLinks entity){
        if (entity.getWeight() == null) {
            entity.setWeight(0L);
        }
    }

    /**
     * 校验并批量删除广告链接信息
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
            refreshCache();
        }
        return flag;
    }
}
