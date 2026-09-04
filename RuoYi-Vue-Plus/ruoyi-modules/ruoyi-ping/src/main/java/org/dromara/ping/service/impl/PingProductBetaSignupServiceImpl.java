package org.dromara.ping.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.model.LoginUser;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.ping.domain.PingProductBetaSignup;
import org.dromara.ping.domain.bo.PingProductBetaSignupBo;
import org.dromara.ping.domain.vo.PingProductBetaSignupVo;
import org.dromara.ping.domain.vo.PingProductBetaStatusVo;
import org.dromara.ping.domain.vo.PingProductBetaSummaryVo;
import org.dromara.ping.mapper.PingProductBetaSignupMapper;
import org.dromara.ping.service.IPingProductBetaSignupService;
import org.jsoup.Jsoup;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.Map;

@RequiredArgsConstructor
@Service
public class PingProductBetaSignupServiceImpl implements IPingProductBetaSignupService {

    static final String STATUS_REGISTERED = "registered";
    static final String STATUS_NOTIFIED = "notified";
    private static final String SOURCE_PRODUCT_PAGE = "product_page";

    private final PingProductBetaSignupMapper baseMapper;

    @Override
    public PingProductBetaStatusVo getCurrentStatus() {
        LoginUser loginUser = requireLoginUser();
        return toStatusVo(findByUser(loginUser));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PingProductBetaStatusVo signup() {
        LoginUser loginUser = requireLoginUser();
        PingProductBetaSignup existing = findByUser(loginUser);
        if (existing != null) {
            return toStatusVo(existing);
        }

        PingProductBetaSignup signup = new PingProductBetaSignup();
        signup.setTenantId(loginUser.getTenantId());
        signup.setUserId(loginUser.getUserId());
        signup.setUserName(normalizePlainText(loginUser.getUsername(), 64));
        signup.setNickname(normalizePlainText(loginUser.getNickname(), 64));
        signup.setStatus(STATUS_REGISTERED);
        signup.setSource(SOURCE_PRODUCT_PAGE);
        try {
            baseMapper.insert(signup);
            return toStatusVo(signup);
        } catch (DuplicateKeyException ignored) {
            PingProductBetaSignup duplicated = findByUser(loginUser);
            if (duplicated == null) {
                throw new ServiceException("报名失败，请稍后重试");
            }
            return toStatusVo(duplicated);
        }
    }

    @Override
    public TableDataInfo<PingProductBetaSignupVo> queryPageList(
        PingProductBetaSignupBo bo, PageQuery pageQuery) {
        Page<PingProductBetaSignupVo> page = baseMapper.selectVoPage(
            pageQuery.build(), buildAdminQuery(bo));
        return TableDataInfo.build(page);
    }

    @Override
    public PingProductBetaSummaryVo querySummary() {
        Date today = Date.from(LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant());
        Date sevenDaysAgo = Date.from(LocalDate.now().minusDays(6)
            .atStartOfDay(ZoneId.systemDefault()).toInstant());
        return new PingProductBetaSummaryVo(
            count(Wrappers.lambdaQuery()),
            count(Wrappers.<PingProductBetaSignup>lambdaQuery()
                .eq(PingProductBetaSignup::getStatus, STATUS_REGISTERED)),
            count(Wrappers.<PingProductBetaSignup>lambdaQuery()
                .eq(PingProductBetaSignup::getStatus, STATUS_NOTIFIED)),
            count(Wrappers.<PingProductBetaSignup>lambdaQuery()
                .ge(PingProductBetaSignup::getCreateTime, today)),
            count(Wrappers.<PingProductBetaSignup>lambdaQuery()
                .ge(PingProductBetaSignup::getCreateTime, sevenDaysAgo))
        );
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean updateStatus(PingProductBetaSignupBo bo) {
        PingProductBetaSignup signup = baseMapper.selectById(bo.getId());
        if (signup == null) {
            throw new ServiceException("内测报名记录不存在");
        }
        if (!STATUS_REGISTERED.equals(bo.getStatus()) && !STATUS_NOTIFIED.equals(bo.getStatus())) {
            throw new ServiceException("报名状态无效");
        }
        signup.setStatus(bo.getStatus());
        signup.setNotifiedTime(STATUS_NOTIFIED.equals(bo.getStatus()) ? new Date() : null);
        signup.setRemark(normalizePlainText(bo.getRemark(), 512));
        return baseMapper.updateById(signup) > 0;
    }

    private LambdaQueryWrapper<PingProductBetaSignup> buildAdminQuery(
        PingProductBetaSignupBo bo) {
        String keyword = normalizePlainText(bo.getKeyword(), 100);
        Map<String, Object> params = bo.getParams();
        return Wrappers.<PingProductBetaSignup>lambdaQuery()
            .eq(StringUtils.isNotBlank(bo.getStatus()),
                PingProductBetaSignup::getStatus, bo.getStatus())
            .and(StringUtils.isNotBlank(keyword), query -> query
                .like(PingProductBetaSignup::getUserName, keyword)
                .or()
                .like(PingProductBetaSignup::getNickname, keyword))
            .between(params.get("beginTime") != null && params.get("endTime") != null,
                PingProductBetaSignup::getCreateTime,
                params.get("beginTime"), params.get("endTime"))
            .orderByDesc(PingProductBetaSignup::getCreateTime)
            .orderByDesc(PingProductBetaSignup::getId);
    }

    private long count(LambdaQueryWrapper<PingProductBetaSignup> query) {
        return baseMapper.selectCount(query);
    }

    private PingProductBetaSignup findByUser(LoginUser loginUser) {
        return baseMapper.selectOne(Wrappers.<PingProductBetaSignup>lambdaQuery()
            .eq(PingProductBetaSignup::getTenantId, loginUser.getTenantId())
            .eq(PingProductBetaSignup::getUserId, loginUser.getUserId())
            .last("limit 1"));
    }

    private PingProductBetaStatusVo toStatusVo(PingProductBetaSignup signup) {
        if (signup == null) {
            return new PingProductBetaStatusVo(false, null, null);
        }
        return new PingProductBetaStatusVo(true, signup.getStatus(), signup.getCreateTime());
    }

    private LoginUser requireLoginUser() {
        LoginUser loginUser = LoginHelper.getLoginUser();
        if (loginUser == null || loginUser.getUserId() == null) {
            throw new ServiceException("登录状态已失效，请重新登录");
        }
        return loginUser;
    }

    private String normalizePlainText(String value, int maxLength) {
        if (StringUtils.isBlank(value)) {
            return "";
        }
        String normalized = Jsoup.parse(value).text().trim().replaceAll("\\s+", " ");
        return normalized.length() > maxLength ? normalized.substring(0, maxLength) : normalized;
    }
}
