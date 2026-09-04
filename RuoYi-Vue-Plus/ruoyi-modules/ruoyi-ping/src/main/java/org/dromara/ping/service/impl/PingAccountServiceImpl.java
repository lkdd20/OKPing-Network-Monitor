package org.dromara.ping.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.constant.CacheConstants;
import org.dromara.common.core.domain.dto.UserOnlineDTO;
import org.dromara.common.core.domain.model.LoginUser;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.json.utils.JsonUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.common.redis.utils.RedisUtils;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.ping.domain.PingUserLoginLog;
import org.dromara.ping.domain.PingUserPreference;
import org.dromara.ping.domain.vo.PingAccountProfileVo;
import org.dromara.ping.domain.vo.PingAccountSessionVo;
import org.dromara.ping.domain.vo.PingLoginLogVo;
import org.dromara.ping.domain.vo.PingSessionKickVo;
import org.dromara.ping.domain.vo.PingToolPreferenceVo;
import org.dromara.ping.domain.vo.PingUserPreferenceVo;
import org.dromara.ping.mapper.PingUserLoginLogMapper;
import org.dromara.ping.mapper.PingUserPreferenceMapper;
import org.dromara.ping.service.IPingAccountService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RequiredArgsConstructor
@Service
public class PingAccountServiceImpl implements IPingAccountService {

    private static final List<String> TOOL_KEYS = List.of(
        "ping", "ping_v6", "tcping", "tcping_v6", "http", "http_v6",
        "dns", "traceroute", "traceroute_v6", "batch_ping", "batch_tcping"
    );
    private static final List<String> OPERATORS = List.of("移动", "联通", "电信", "多线", "港澳台、海外");
    private static final Set<String> ENTER_ACTIONS = Set.of("single", "continuous");
    private static final Set<String> HISTORY_MODES = Set.of("enabled", "record-only", "display-only", "disabled");
    private static final Set<String> DNS_MODES = Set.of("operator", "custom");
    private static final Set<String> REGION_SUMMARIES = Set.of("china", "overseas");

    private final PingUserPreferenceMapper preferenceMapper;
    private final PingUserLoginLogMapper loginLogMapper;

    @Override
    public PingAccountProfileVo getProfile() {
        LoginUser loginUser = requireLoginUser();
        PingAccountProfileVo profile = new PingAccountProfileVo();
        profile.setUserId(loginUser.getUserId());
        profile.setUsername(loginUser.getUsername());
        profile.setNickname(loginUser.getNickname());
        profile.setTenantId(loginUser.getTenantId());
        return profile;
    }

    @Override
    public PingUserPreferenceVo getPreferences() {
        PingUserPreference preference = findCurrentPreference();
        if (preference == null || StringUtils.isBlank(preference.getConfigJson())) {
            return defaultPreferences(0L);
        }
        try {
            PingUserPreferenceVo parsed = JsonUtils.parseObject(
                preference.getConfigJson(), PingUserPreferenceVo.class);
            PingUserPreferenceVo normalized = normalizePreferences(parsed);
            normalized.setRevision(preference.getRevision());
            return normalized;
        } catch (RuntimeException ignored) {
            return defaultPreferences(preference.getRevision());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PingUserPreferenceVo savePreferences(PingUserPreferenceVo preferences) {
        LoginUser loginUser = requireLoginUser();
        PingUserPreferenceVo normalized = normalizePreferences(preferences);
        PingUserPreference current = findCurrentPreference();
        long currentRevision = current == null || current.getRevision() == null ? 0L : current.getRevision();
        long revision = currentRevision + 1L;
        normalized.setRevision(revision);

        PingUserPreference entity = current == null ? new PingUserPreference() : current;
        entity.setTenantId(loginUser.getTenantId());
        entity.setUserId(loginUser.getUserId());
        entity.setRevision(revision);
        entity.setConfigJson(JsonUtils.toJsonString(normalized));
        if (current == null) {
            preferenceMapper.insert(entity);
        } else {
            preferenceMapper.updateById(entity);
        }
        return normalized;
    }

    @Override
    public List<PingAccountSessionVo> getSessions() {
        String loginId = StpUtil.getLoginIdAsString();
        String currentToken = StpUtil.getTokenValue();
        List<PingAccountSessionVo> sessions = new ArrayList<>();
        for (String token : StpUtil.getTokenValueListByLoginId(loginId)) {
            if (StpUtil.stpLogic.getTokenActiveTimeoutByToken(token) < -1) {
                continue;
            }
            UserOnlineDTO online = RedisUtils.getCacheObject(CacheConstants.ONLINE_TOKEN_KEY + token);
            if (online == null) {
                continue;
            }
            PingAccountSessionVo session = new PingAccountSessionVo();
            session.setSessionKey(sessionKey(token));
            session.setClientKey(online.getClientKey());
            session.setDeviceType(online.getDeviceType());
            session.setIpaddr(online.getIpaddr());
            session.setLoginLocation(online.getLoginLocation());
            session.setBrowser(online.getBrowser());
            session.setOs(online.getOs());
            session.setLoginTime(online.getLoginTime());
            session.setCurrent(token.equals(currentToken));
            sessions.add(session);
        }
        sessions.sort(Comparator.comparing(PingAccountSessionVo::getCurrent).reversed()
            .thenComparing(PingAccountSessionVo::getLoginTime,
                Comparator.nullsLast(Comparator.reverseOrder())));
        return sessions;
    }

    @Override
    public PingSessionKickVo kickSession(String sessionKey) {
        if (StringUtils.isBlank(sessionKey) || !sessionKey.matches("^[0-9a-f]{32}$")) {
            throw new ServiceException("登录设备标识无效");
        }
        String currentToken = StpUtil.getTokenValue();
        String matchedToken = StpUtil.getTokenValueListByLoginId(StpUtil.getLoginIdAsString()).stream()
            .filter(token -> MessageDigest.isEqual(
                sessionKey.getBytes(StandardCharsets.US_ASCII),
                sessionKey(token).getBytes(StandardCharsets.US_ASCII)))
            .findFirst()
            .orElseThrow(() -> new ServiceException("登录设备不存在或已下线"));
        boolean currentSession = matchedToken.equals(currentToken);
        StpUtil.kickoutByTokenValue(matchedToken);
        return new PingSessionKickVo(currentSession);
    }

    @Override
    public TableDataInfo<PingLoginLogVo> getLoginLogs(PageQuery pageQuery) {
        int pageNum = pageQuery.getPageNum() == null ? 1 : Math.max(1, pageQuery.getPageNum());
        int pageSize = pageQuery.getPageSize() == null ? 10 : Math.min(50, Math.max(1, pageQuery.getPageSize()));
        Page<PingUserLoginLog> page = loginLogMapper.selectPage(
            new Page<>(pageNum, pageSize),
            Wrappers.<PingUserLoginLog>lambdaQuery()
                .eq(PingUserLoginLog::getTenantId, LoginHelper.getTenantId())
                .eq(PingUserLoginLog::getUserName, LoginHelper.getUsername())
                .orderByDesc(PingUserLoginLog::getLoginTime)
                .orderByDesc(PingUserLoginLog::getInfoId)
        );
        List<PingLoginLogVo> rows = page.getRecords().stream().map(this::toLoginLogVo).toList();
        return new TableDataInfo<>(rows, page.getTotal());
    }

    private LoginUser requireLoginUser() {
        LoginUser loginUser = LoginHelper.getLoginUser();
        if (loginUser == null || loginUser.getUserId() == null) {
            throw new ServiceException("登录状态已失效，请重新登录");
        }
        return loginUser;
    }

    private PingUserPreference findCurrentPreference() {
        LoginUser loginUser = requireLoginUser();
        return preferenceMapper.selectOne(Wrappers.<PingUserPreference>lambdaQuery()
            .eq(PingUserPreference::getTenantId, loginUser.getTenantId())
            .eq(PingUserPreference::getUserId, loginUser.getUserId())
            .last("limit 1"));
    }

    private PingUserPreferenceVo defaultPreferences(Long revision) {
        PingUserPreferenceVo defaults = normalizePreferences(null);
        defaults.setRevision(revision == null ? 0L : revision);
        return defaults;
    }

    private PingUserPreferenceVo normalizePreferences(PingUserPreferenceVo submitted) {
        Map<String, PingToolPreferenceVo> submittedTools = submitted == null || submitted.getTools() == null
            ? Map.of() : submitted.getTools();
        LinkedHashMap<String, PingToolPreferenceVo> tools = new LinkedHashMap<>();
        for (String toolKey : TOOL_KEYS) {
            tools.put(toolKey, normalizeToolPreference(submittedTools.get(toolKey)));
        }
        PingUserPreferenceVo normalized = new PingUserPreferenceVo();
        normalized.setTools(tools);
        return normalized;
    }

    private PingToolPreferenceVo normalizeToolPreference(PingToolPreferenceVo submitted) {
        PingToolPreferenceVo normalized = new PingToolPreferenceVo();
        normalized.setEnterAction(validValue(submitted == null ? null : submitted.getEnterAction(), ENTER_ACTIONS, "single"));
        normalized.setHistoryMode(validValue(submitted == null ? null : submitted.getHistoryMode(), HISTORY_MODES, "enabled"));
        normalized.setDnsMode(validValue(submitted == null ? null : submitted.getDnsMode(), DNS_MODES, "operator"));
        normalized.setRegionSummary(validValue(submitted == null ? null : submitted.getRegionSummary(), REGION_SUMMARIES, "china"));
        normalized.setMapTimeoutMarker(submitted == null || submitted.getMapTimeoutMarker() == null || submitted.getMapTimeoutMarker());
        normalized.setDnsStatsExpanded(submitted == null || submitted.getDnsStatsExpanded() == null || submitted.getDnsStatsExpanded());
        normalized.setQuickActions(submitted == null || submitted.getQuickActions() == null || submitted.getQuickActions());

        String customDns = submitted == null || submitted.getCustomDns() == null ? "" : submitted.getCustomDns().trim();
        normalized.setCustomDns(customDns.length() > 255 ? customDns.substring(0, 255) : customDns);

        List<String> submittedOperators = submitted == null || submitted.getOperators() == null
            ? OPERATORS : submitted.getOperators();
        LinkedHashSet<String> operators = new LinkedHashSet<>();
        for (String supported : OPERATORS) {
            if (submittedOperators.contains(supported)) {
                operators.add(supported);
            }
        }
        normalized.setOperators(new ArrayList<>(operators));
        return normalized;
    }

    private String validValue(String value, Set<String> allowed, String fallback) {
        return value != null && allowed.contains(value) ? value : fallback;
    }

    private PingLoginLogVo toLoginLogVo(PingUserLoginLog log) {
        PingLoginLogVo vo = new PingLoginLogVo();
        vo.setId(log.getInfoId());
        vo.setClientKey(log.getClientKey());
        vo.setDeviceType(log.getDeviceType());
        vo.setStatus(log.getStatus());
        vo.setIpaddr(log.getIpaddr());
        vo.setLoginLocation(log.getLoginLocation());
        vo.setBrowser(log.getBrowser());
        vo.setOs(log.getOs());
        vo.setMessage(log.getMsg());
        vo.setLoginTime(log.getLoginTime());
        return vo;
    }

    private String sessionKey(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                .digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(64);
            for (byte value : digest) {
                hex.append(String.format("%02x", value & 0xff));
            }
            return hex.substring(0, 32);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is not available", e);
        }
    }
}
