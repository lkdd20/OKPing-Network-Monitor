package org.dromara.web.service.impl;

import com.baomidou.dynamic.datasource.annotation.DS;
import org.dromara.common.core.utils.MapstructUtils;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.redis.utils.RedisUtils;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.dromara.web.domain.bo.FriendshipLinksBo;
import org.dromara.web.domain.vo.FriendshipLinksVo;
import org.dromara.web.domain.FriendshipLinks;
import org.dromara.web.mapper.FriendshipLinksMapper;
import org.dromara.web.service.IFriendshipLinksService;

import java.util.List;
import java.util.Map;
import java.util.Collection;

/**
 * 友情链接Service业务层处理
 *
 * @author Lion Li
 * @date 2026-05-14
 */
@Slf4j
@RequiredArgsConstructor

@Service
public class FriendshipLinksServiceImpl implements IFriendshipLinksService {

    private static final String CACHE_KEY = "web:friendship_links:list";

    private final FriendshipLinksMapper baseMapper;

    /**
     * 查询友情链接
     *
     * @param id 主键
     * @return 友情链接
     */
    @Override
    public FriendshipLinksVo queryById(Long id){
        return baseMapper.selectVoById(id);
    }

    /**
     * 分页查询友情链接列表
     *
     * @param bo        查询条件
     * @param pageQuery 分页参数
     * @return 友情链接分页列表
     */
    @Override
    public TableDataInfo<FriendshipLinksVo> queryPageList(FriendshipLinksBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<FriendshipLinks> lqw = buildQueryWrapper(bo);
        Page<FriendshipLinksVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    /**
     * 查询符合条件的友情链接列表
     *
     * @param bo 查询条件
     * @return 友情链接列表
     */
    @Override
    public List<FriendshipLinksVo> queryList(FriendshipLinksBo bo) {
        LambdaQueryWrapper<FriendshipLinks> lqw = buildQueryWrapper(bo);
        return baseMapper.selectVoList(lqw);
    }

    /**
     * 查询全部友情链接列表（缓存）
     *
     * @return 友情链接列表
     */
    @Override
    public List<FriendshipLinksVo> queryCachedList() {
        List<FriendshipLinksVo> list = RedisUtils.getCacheObject(CACHE_KEY);
        System.out.println("list:" + list);
        if (list != null) {
            return list;
        }
        return refreshCache();
    }

    private LambdaQueryWrapper<FriendshipLinks> buildQueryWrapper(FriendshipLinksBo bo) {
        Map<String, Object> params = bo.getParams();
        LambdaQueryWrapper<FriendshipLinks> lqw = Wrappers.lambdaQuery();
        lqw.orderByDesc(FriendshipLinks::getWeight);
        lqw.orderByAsc(FriendshipLinks::getId);
        lqw.like(StringUtils.isNotBlank(bo.getName()), FriendshipLinks::getName, bo.getName());
        lqw.eq(StringUtils.isNotBlank(bo.getUrl()), FriendshipLinks::getUrl, bo.getUrl());
        lqw.eq(bo.getWeight() != null, FriendshipLinks::getWeight, bo.getWeight());
        return lqw;
    }

    private List<FriendshipLinksVo> refreshCache() {
        List<FriendshipLinksVo> list = baseMapper.selectVoList(Wrappers.<FriendshipLinks>lambdaQuery()
            .orderByDesc(FriendshipLinks::getWeight)
            .orderByAsc(FriendshipLinks::getId));
        RedisUtils.setCacheObject(CACHE_KEY, list);
        return list;
    }

    /**
     * 新增友情链接
     *
     * @param bo 友情链接
     * @return 是否新增成功
     */
    @Override
    public Boolean insertByBo(FriendshipLinksBo bo) {
        FriendshipLinks add = MapstructUtils.convert(bo, FriendshipLinks.class);
        validEntityBeforeSave(add);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
            refreshCache();
        }
        return flag;
    }

    /**
     * 修改友情链接
     *
     * @param bo 友情链接
     * @return 是否修改成功
     */
    @Override
    public Boolean updateByBo(FriendshipLinksBo bo) {
        FriendshipLinks update = MapstructUtils.convert(bo, FriendshipLinks.class);
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
    private void validEntityBeforeSave(FriendshipLinks entity){
        if (entity.getWeight() == null) {
            entity.setWeight(0L);
        }
    }

    /**
     * 校验并批量删除友情链接信息
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
