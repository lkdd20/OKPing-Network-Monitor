package org.dromara.ping.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.MapstructUtils;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.ping.domain.PingMilestone;
import org.dromara.ping.domain.bo.PingMilestoneBo;
import org.dromara.ping.domain.vo.PingMilestoneVo;
import org.dromara.ping.domain.vo.PingPublicMilestoneVo;
import org.dromara.ping.mapper.PingMilestoneMapper;
import org.dromara.ping.service.IPingMilestoneService;
import org.jsoup.Jsoup;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

@RequiredArgsConstructor
@Service
public class PingMilestoneServiceImpl implements IPingMilestoneService {

    static final String STATUS_ON = "on";
    static final String STATUS_OFF = "off";

    private final PingMilestoneMapper baseMapper;

    @Override
    public PingMilestoneVo queryById(Long id) {
        return baseMapper.selectVoById(id);
    }

    @Override
    public TableDataInfo<PingMilestoneVo> queryPageList(PingMilestoneBo bo, PageQuery pageQuery) {
        Page<PingMilestoneVo> page = baseMapper.selectVoPage(pageQuery.build(), buildAdminQuery(bo));
        return TableDataInfo.build(page);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean insertByBo(PingMilestoneBo bo) {
        PingMilestone milestone = MapstructUtils.convert(bo, PingMilestone.class);
        normalizeBeforeSave(milestone);
        boolean saved = baseMapper.insert(milestone) > 0;
        if (saved) {
            bo.setId(milestone.getId());
        }
        return saved;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean updateByBo(PingMilestoneBo bo) {
        if (!baseMapper.exists(Wrappers.<PingMilestone>lambdaQuery().eq(PingMilestone::getId, bo.getId()))) {
            throw new ServiceException("项目里程碑不存在");
        }
        PingMilestone milestone = MapstructUtils.convert(bo, PingMilestone.class);
        normalizeBeforeSave(milestone);
        return baseMapper.updateById(milestone) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        return baseMapper.deleteByIds(ids) > 0;
    }

    @Override
    public List<PingPublicMilestoneVo> queryPublicList() {
        return baseMapper.selectList(Wrappers.<PingMilestone>lambdaQuery()
                .eq(PingMilestone::getStatus, STATUS_ON)
                .orderByDesc(PingMilestone::getMilestoneDate)
                .orderByDesc(PingMilestone::getSortOrder)
                .orderByDesc(PingMilestone::getId))
            .stream()
            .map(this::toPublicVo)
            .toList();
    }

    private LambdaQueryWrapper<PingMilestone> buildAdminQuery(PingMilestoneBo bo) {
        String keyword = normalizeQuery(bo.getKeyword(), 100);
        return Wrappers.<PingMilestone>lambdaQuery()
            .eq(StringUtils.isNotBlank(bo.getStatus()), PingMilestone::getStatus, bo.getStatus())
            .and(StringUtils.isNotBlank(keyword), query -> query
                .like(PingMilestone::getContent, keyword)
                .or()
                .like(PingMilestone::getRemark, keyword))
            .orderByDesc(PingMilestone::getMilestoneDate)
            .orderByDesc(PingMilestone::getSortOrder)
            .orderByDesc(PingMilestone::getId);
    }

    void normalizeBeforeSave(PingMilestone milestone) {
        milestone.setContent(normalizePlainText(milestone.getContent(), 1000));
        milestone.setRemark(normalizePlainText(milestone.getRemark(), 512));
        milestone.setSortOrder(milestone.getSortOrder() == null ? 0L : milestone.getSortOrder());

        if (milestone.getMilestoneDate() == null) {
            throw new ServiceException("发生月份不能为空");
        }
        milestone.setMilestoneDate(milestone.getMilestoneDate().withDayOfMonth(1));
        if (!STATUS_ON.equals(milestone.getStatus()) && !STATUS_OFF.equals(milestone.getStatus())) {
            throw new ServiceException("里程碑状态仅支持开启或关闭");
        }
        if (StringUtils.isBlank(milestone.getContent())) {
            throw new ServiceException("里程碑内容不能为空");
        }
    }

    PingPublicMilestoneVo toPublicVo(PingMilestone milestone) {
        LocalDate date = milestone.getMilestoneDate();
        PingPublicMilestoneVo vo = new PingPublicMilestoneVo();
        vo.setId(milestone.getId());
        vo.setYear(String.valueOf(date.getYear()));
        vo.setMonth(date.getMonthValue() + "月");
        vo.setContent(milestone.getContent());
        return vo;
    }

    private String normalizePlainText(String value, int maxLength) {
        if (StringUtils.isBlank(value)) {
            return "";
        }
        String normalized = Jsoup.parse(value).text().trim().replaceAll("\\s+", " ");
        return normalized.length() > maxLength ? normalized.substring(0, maxLength) : normalized;
    }

    private String normalizeQuery(String value, int maxLength) {
        if (StringUtils.isBlank(value)) {
            return "";
        }
        String normalized = value.trim();
        return normalized.length() > maxLength ? normalized.substring(0, maxLength) : normalized;
    }
}
