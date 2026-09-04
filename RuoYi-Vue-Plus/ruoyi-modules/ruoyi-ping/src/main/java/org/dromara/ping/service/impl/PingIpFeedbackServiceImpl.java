package org.dromara.ping.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.NetUtils;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.ping.domain.PingIpFeedback;
import org.dromara.ping.domain.bo.PingIpFeedbackQueryBo;
import org.dromara.ping.domain.bo.PingIpFeedbackReviewBo;
import org.dromara.ping.domain.bo.PingIpFeedbackSubmitBo;
import org.dromara.ping.domain.vo.PingIpFeedbackVo;
import org.dromara.ping.domain.vo.PingPublicIpFeedbackItemVo;
import org.dromara.ping.domain.vo.PingPublicIpFeedbackPageVo;
import org.dromara.ping.mapper.PingIpFeedbackMapper;
import org.dromara.ping.service.IPingIpFeedbackService;
import org.dromara.ping.service.IPingIpRegionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.Inet6Address;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.math.BigInteger;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;
import java.util.Locale;

@RequiredArgsConstructor
@Service
public class PingIpFeedbackServiceImpl implements IPingIpFeedbackService {

    private static final String PENDING = "pending";
    private static final String APPROVED = "approved";
    private static final int PUBLIC_DEFAULT_PAGE_SIZE = 6;
    private static final int PUBLIC_MAX_PAGE_SIZE = 20;

    private final PingIpFeedbackMapper baseMapper;
    private final IPingIpRegionService ipRegionService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long submit(PingIpFeedbackSubmitBo bo) {
        SubmittedRange range = normalizeRange(bo.getIpVersion(), bo.getStartIp(), bo.getEndIp());
        String location = normalizeLocation(bo.getLocation());
        boolean duplicate = baseMapper.exists(Wrappers.<PingIpFeedback>lambdaQuery()
            .eq(PingIpFeedback::getIpVersion, range.ipVersion())
            .eq(PingIpFeedback::getStartIp, range.startIp())
            .eq(PingIpFeedback::getEndIp, range.endIp())
            .eq(PingIpFeedback::getLocation, location)
            .eq(PingIpFeedback::getStatus, PENDING));
        if (duplicate) {
            throw new ServiceException("相同IP范围的反馈正在审核中，请勿重复提交");
        }

        PingIpFeedback feedback = new PingIpFeedback();
        feedback.setIpVersion(range.ipVersion());
        feedback.setStartIp(range.startIp());
        feedback.setEndIp(range.endIp());
        feedback.setLocation(location);
        feedback.setStatus(PENDING);
        if (baseMapper.insert(feedback) != 1) {
            throw new ServiceException("IP信息纠错提交失败");
        }
        return feedback.getId();
    }

    @Override
    public TableDataInfo<PingIpFeedbackVo> queryPageList(PingIpFeedbackQueryBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<PingIpFeedback> wrapper = Wrappers.lambdaQuery();
        wrapper.orderByAsc(PingIpFeedback::getStatus)
            .orderByDesc(PingIpFeedback::getCreateTime)
            .orderByDesc(PingIpFeedback::getId)
            .eq(StringUtils.isNotBlank(bo.getIpVersion()), PingIpFeedback::getIpVersion, bo.getIpVersion())
            .eq(StringUtils.isNotBlank(bo.getStatus()), PingIpFeedback::getStatus, bo.getStatus())
            .and(StringUtils.isNotBlank(bo.getStartIp()), query -> query
                .like(PingIpFeedback::getStartIp, bo.getStartIp())
                .or()
                .like(PingIpFeedback::getEndIp, bo.getStartIp()));
        Page<PingIpFeedbackVo> result = baseMapper.selectVoPage(pageQuery.build(), wrapper);
        return TableDataInfo.build(result);
    }

    @Override
    public PingPublicIpFeedbackPageVo queryPublicPage(String ip, Integer pageNum, Integer pageSize) {
        int safePageNum = pageNum == null || pageNum < 1 ? 1 : pageNum;
        int safePageSize = pageSize == null || pageSize < 1
            ? PUBLIC_DEFAULT_PAGE_SIZE
            : Math.min(pageSize, PUBLIC_MAX_PAGE_SIZE);
        List<PingIpFeedback> feedbackRows;
        long total;

        if (StringUtils.isNotBlank(ip)) {
            ParsedIp searchedIp = parseIp(ip, "搜索IP");
            List<PingIpFeedback> matchedRows = baseMapper.selectList(publicListWrapper()
                    .eq(PingIpFeedback::getIpVersion, searchedIp.version()))
                .stream()
                .filter(feedback -> containsIp(feedback, searchedIp))
                .toList();
            total = matchedRows.size();
            long offset = (long) (safePageNum - 1) * safePageSize;
            if (offset >= total) {
                feedbackRows = List.of();
            } else {
                int fromIndex = (int) offset;
                int toIndex = Math.min(fromIndex + safePageSize, matchedRows.size());
                feedbackRows = matchedRows.subList(fromIndex, toIndex);
            }
        } else {
            Page<PingIpFeedback> page = baseMapper.selectPage(
                new Page<>(safePageNum, safePageSize),
                publicListWrapper()
            );
            feedbackRows = page.getRecords();
            total = page.getTotal();
        }

        Date sevenDaysAgo = Date.from(Instant.now().minus(7, ChronoUnit.DAYS));
        List<PingIpFeedback> submittedInSevenDays = baseMapper.selectList(
            Wrappers.<PingIpFeedback>lambdaQuery().ge(PingIpFeedback::getCreateTime, sevenDaysAgo)
        );
        List<PingIpFeedback> updatedInSevenDays = baseMapper.selectList(
            Wrappers.<PingIpFeedback>lambdaQuery()
                .eq(PingIpFeedback::getStatus, APPROVED)
                .ge(PingIpFeedback::getReviewTime, sevenDaysAgo)
        );

        PingPublicIpFeedbackPageVo result = new PingPublicIpFeedbackPageVo();
        result.setSubmittedIpCount7d(countIps(submittedInSevenDays).toString());
        result.setUpdatedIpCount7d(countIps(updatedInSevenDays).toString());
        result.setTotal(total);
        result.setPageNum(safePageNum);
        result.setPageSize(safePageSize);
        result.setRows(feedbackRows.stream().map(this::toPublicItem).toList());
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean review(PingIpFeedbackReviewBo bo) {
        PingIpFeedback feedback = baseMapper.selectById(bo.getId());
        if (feedback == null) {
            throw new ServiceException("IP信息纠错记录不存在");
        }
        if (!PENDING.equals(feedback.getStatus())) {
            throw new ServiceException("该反馈已审核，不能重复处理");
        }

        feedback.setStatus(bo.getStatus().trim().toLowerCase(Locale.ROOT));
        feedback.setReviewRemark(StringUtils.trim(bo.getReviewRemark()));
        feedback.setReviewTime(new Date());
        boolean updated = baseMapper.updateById(feedback) == 1;
        if (updated && APPROVED.equals(feedback.getStatus())) {
            ipRegionService.refreshApprovedCorrections();
        }
        return updated;
    }

    private SubmittedRange normalizeRange(String ipVersion, String rawStartIp, String rawEndIp) {
        String version = ipVersion == null ? "" : ipVersion.trim().toLowerCase(Locale.ROOT);
        ParsedIp start = parseIp(rawStartIp, "起始IP");
        ParsedIp end = parseIp(StringUtils.blankToDefault(rawEndIp, rawStartIp), "结束IP");
        if (!version.equals(start.version()) || !version.equals(end.version())) {
            throw new ServiceException("IP版本必须与起始IP、结束IP一致");
        }
        if (start.value().compareTo(end.value()) > 0) {
            throw new ServiceException("起始IP不能大于结束IP");
        }
        return new SubmittedRange(version, start.canonicalIp(), end.canonicalIp());
    }

    private String normalizeLocation(String rawLocation) {
        String location = rawLocation == null ? "" : rawLocation.trim();
        String normalized = String.join("|", java.util.Arrays.stream(location.split("[|/]"))
            .map(String::trim)
            .filter(StringUtils::isNotBlank)
            .toList());
        if (StringUtils.isBlank(normalized)) {
            throw new ServiceException("正确归属地不能为空");
        }
        return normalized;
    }

    private LambdaQueryWrapper<PingIpFeedback> publicListWrapper() {
        return Wrappers.<PingIpFeedback>lambdaQuery()
            .orderByDesc(PingIpFeedback::getCreateTime)
            .orderByDesc(PingIpFeedback::getId);
    }

    private boolean containsIp(PingIpFeedback feedback, ParsedIp searchedIp) {
        try {
            ParsedIp start = parseIp(feedback.getStartIp(), "起始IP");
            ParsedIp end = parseIp(feedback.getEndIp(), "结束IP");
            return searchedIp.version().equals(start.version())
                && searchedIp.value().compareTo(start.value()) >= 0
                && searchedIp.value().compareTo(end.value()) <= 0;
        } catch (ServiceException ignored) {
            return false;
        }
    }

    private BigInteger countIps(List<PingIpFeedback> feedbackRows) {
        BigInteger count = BigInteger.ZERO;
        for (PingIpFeedback feedback : feedbackRows) {
            try {
                ParsedIp start = parseIp(feedback.getStartIp(), "起始IP");
                ParsedIp end = parseIp(feedback.getEndIp(), "结束IP");
                if (start.version().equals(end.version()) && start.value().compareTo(end.value()) <= 0) {
                    count = count.add(end.value().subtract(start.value()).add(BigInteger.ONE));
                }
            } catch (ServiceException ignored) {
                // Ignore invalid historical records instead of breaking the public page.
            }
        }
        return count;
    }

    private PingPublicIpFeedbackItemVo toPublicItem(PingIpFeedback feedback) {
        boolean approved = APPROVED.equals(feedback.getStatus());
        PingPublicIpFeedbackItemVo item = new PingPublicIpFeedbackItemVo();
        item.setId(feedback.getId());
        item.setIpVersion(feedback.getIpVersion());
        item.setStartIp(feedback.getStartIp());
        item.setEndIp(feedback.getEndIp());
        item.setSubmittedLocation(approved ? feedback.getLocation() : null);
        item.setActualStartIp(approved ? feedback.getStartIp() : null);
        item.setActualEndIp(approved ? feedback.getEndIp() : null);
        item.setActualLocation(approved ? feedback.getLocation() : null);
        item.setStatus(feedback.getStatus());
        item.setCreateTime(feedback.getCreateTime());
        item.setReviewTime(feedback.getReviewTime());
        return item;
    }

    private ParsedIp parseIp(String rawIp, String fieldName) {
        String ip = rawIp == null ? "" : rawIp.trim();
        if (ip.startsWith("[") && ip.endsWith("]")) {
            ip = ip.substring(1, ip.length() - 1);
        }
        if (StringUtils.isBlank(ip)) {
            throw new ServiceException(fieldName + "不能为空");
        }
        try {
            InetAddress address;
            String version;
            if (NetUtils.isIPv4(ip)) {
                address = InetAddress.getByName(ip);
                version = "ipv4";
            } else if (ip.contains(":")) {
                address = InetAddress.getByName(ip);
                if (!(address instanceof Inet6Address)) {
                    throw new ServiceException(fieldName + "格式不正确");
                }
                version = "ipv6";
            } else {
                throw new ServiceException(fieldName + "格式不正确");
            }
            return new ParsedIp(version, address.getHostAddress(), new java.math.BigInteger(1, address.getAddress()));
        } catch (UnknownHostException e) {
            throw new ServiceException(fieldName + "格式不正确");
        }
    }

    private record ParsedIp(String version, String canonicalIp, java.math.BigInteger value) {
    }

    private record SubmittedRange(String ipVersion, String startIp, String endIp) {
    }
}
