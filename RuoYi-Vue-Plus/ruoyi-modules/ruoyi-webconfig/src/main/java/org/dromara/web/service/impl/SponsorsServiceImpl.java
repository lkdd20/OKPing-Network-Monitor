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
import org.dromara.web.domain.Sponsors;
import org.dromara.web.domain.bo.SponsorsBo;
import org.dromara.web.domain.vo.SponsorsListVo;
import org.dromara.web.domain.vo.SponsorsVo;
import org.dromara.web.mapper.SponsorsMapper;
import org.dromara.web.service.ISponsorsService;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 赞助商Service业务层处理
 *
 * @author Lion Li
 * @date 2026-06-04
 */
@Slf4j
@RequiredArgsConstructor
@Service
public class SponsorsServiceImpl implements ISponsorsService {

    private static final String CACHE_KEY = "web:sponsors:list:v1";

    private final SponsorsMapper baseMapper;

    /**
     * 查询赞助商
     *
     * @param id 主键
     * @return 赞助商
     */
    @Override
    public SponsorsVo queryById(Long id){
        return baseMapper.selectVoById(id);
    }

    /**
     * 分页查询赞助商列表
     *
     * @param bo        查询条件
     * @param pageQuery 分页参数
     * @return 赞助商分页列表
     */
    @Override
    public TableDataInfo<SponsorsVo> queryPageList(SponsorsBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<Sponsors> lqw = buildQueryWrapper(bo);
        Page<SponsorsVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    /**
     * 查询符合条件的赞助商列表
     *
     * @param bo 查询条件
     * @return 赞助商列表
     */
    @Override
    public List<SponsorsVo> queryList(SponsorsBo bo) {
        LambdaQueryWrapper<Sponsors> lqw = buildQueryWrapper(bo);
        return baseMapper.selectVoList(lqw);
    }

    /**
     * 查询公开赞助商列表
     *
     * @return 公开赞助商列表
     */
    @Override
    public List<SponsorsListVo> queryCachedList() {
        List<SponsorsVo> data = TenantHelper.ignore(() -> RedisUtils.getCacheObject(CACHE_KEY));
        if (data != null) {
            return toListData(data);
        }
        return refreshCache();
    }

    private LambdaQueryWrapper<Sponsors> buildQueryWrapper(SponsorsBo bo) {
        LambdaQueryWrapper<Sponsors> lqw = Wrappers.lambdaQuery();
        lqw.orderByDesc(Sponsors::getWeight);
        lqw.orderByAsc(Sponsors::getId);
        lqw.like(StringUtils.isNotBlank(bo.getName()), Sponsors::getName, bo.getName());
        lqw.eq(StringUtils.isNotBlank(bo.getUrl()), Sponsors::getUrl, bo.getUrl());
        lqw.eq(StringUtils.isNotBlank(bo.getImgUrl()), Sponsors::getImgUrl, bo.getImgUrl());
        lqw.eq(bo.getWeight() != null, Sponsors::getWeight, bo.getWeight());
        return lqw;
    }

    private List<SponsorsListVo> refreshCache() {
        List<SponsorsVo> data = TenantHelper.ignore(() -> baseMapper.selectVoList(Wrappers.<Sponsors>lambdaQuery()
            .orderByDesc(Sponsors::getWeight)
            .orderByAsc(Sponsors::getId)));
        TenantHelper.ignore(() -> {
            RedisUtils.deleteObject(CACHE_KEY);
            RedisUtils.setCacheObject(CACHE_KEY, data, Duration.ofHours(1));
        });
        return toListData(data);
    }

    private List<SponsorsListVo> toListData(List<SponsorsVo> data) {
        return data.stream()
            .map(this::toListVo)
            .collect(Collectors.toList());
    }

    private SponsorsListVo toListVo(SponsorsVo vo) {
        SponsorsListVo listVo = new SponsorsListVo();
        listVo.setName(vo.getName());
        listVo.setUrl(vo.getUrl());
        listVo.setImgUrl(vo.getImgUrl());
        return listVo;
    }

    /**
     * 新增赞助商
     *
     * @param bo 赞助商
     * @return 是否新增成功
     */
    @Override
    public Boolean insertByBo(SponsorsBo bo) {
        Sponsors add = MapstructUtils.convert(bo, Sponsors.class);
        validEntityBeforeSave(add);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
            refreshCache();
        }
        return flag;
    }

    /**
     * 修改赞助商
     *
     * @param bo 赞助商
     * @return 是否修改成功
     */
    @Override
    public Boolean updateByBo(SponsorsBo bo) {
        Sponsors update = MapstructUtils.convert(bo, Sponsors.class);
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
    private void validEntityBeforeSave(Sponsors entity){
        if (entity.getWeight() == null) {
            entity.setWeight(0L);
        }
    }

    /**
     * 校验并批量删除赞助商信息
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
