package org.dromara.ping.service.impl;

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
import org.dromara.ping.domain.PingPageConfig;
import org.dromara.ping.domain.bo.PingPageConfigBo;
import org.dromara.ping.domain.vo.PingPageConfigVo;
import org.dromara.ping.domain.vo.PingPublicPageConfigVo;
import org.dromara.ping.mapper.PingPageConfigMapper;
import org.dromara.ping.service.IPingPageConfigService;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Collection;
import java.util.List;
import java.util.Map;

@Slf4j
@RequiredArgsConstructor
@Service
public class PingPageConfigServiceImpl implements IPingPageConfigService {

    private static final String ENABLED_STATUS = "on";
    private static final String DEFAULT_PAGE_KEY = "ping";
    private static final String CACHE_KEY_PREFIX = "ping:page-config:public:";
    private static final Duration CACHE_TTL = Duration.ofMinutes(5);
    private static final Map<String, String> FALLBACK_TITLES = Map.ofEntries(
        Map.entry("ping", "在线 Ping - okping"),
        Map.entry("tcping", "在线 TCPing - okping"),
        Map.entry("http", "网站测速 - okping"),
        Map.entry("dns", "DNS 查询 - okping"),
        Map.entry("traceroute", "路由追踪 - okping"),
        Map.entry("batch_ping", "批量 Ping - okping"),
        Map.entry("batch_tcping", "批量 TCPing - okping"),
        Map.entry("ping_v6", "IPv6 在线 Ping - okping"),
        Map.entry("tcping_v6", "IPv6 在线 TCPing - okping"),
        Map.entry("http_v6", "IPv6 网站测速 - okping"),
        Map.entry("traceroute_v6", "IPv6 路由追踪 - okping"),
        Map.entry("ip", "IP 查询 - okping"),
        Map.entry("whois", "WHOIS 查询 - okping")
    );
    private static final Map<String, String> FALLBACK_DESCRIPTIONS = Map.ofEntries(
        Map.entry("ping", "okping 未登录用户在线 Ping 检测"),
        Map.entry("tcping", "okping 未登录用户在线 TCPing 检测"),
        Map.entry("http", "okping 未登录用户网站测速"),
        Map.entry("dns", "okping 未登录用户 DNS 记录查询"),
        Map.entry("traceroute", "okping 未登录用户路由追踪"),
        Map.entry("batch_ping", "okping 未登录用户批量 Ping 检测"),
        Map.entry("batch_tcping", "okping 未登录用户批量 TCPing 检测"),
        Map.entry("ping_v6", "okping 未登录用户 IPv6 在线 Ping 检测"),
        Map.entry("tcping_v6", "okping 未登录用户 IPv6 在线 TCPing 检测"),
        Map.entry("http_v6", "okping 未登录用户 IPv6 网站测速"),
        Map.entry("traceroute_v6", "okping 未登录用户 IPv6 路由追踪"),
        Map.entry("ip", "okping 未登录用户 IPv4 / IPv6 信息查询"),
        Map.entry("whois", "okping 未登录用户域名 WHOIS 信息查询")
    );

    private final PingPageConfigMapper baseMapper;

    @Override
    public PingPageConfigVo queryById(Long id) {
        return baseMapper.selectVoById(id);
    }

    @Override
    public TableDataInfo<PingPageConfigVo> queryPageList(PingPageConfigBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<PingPageConfig> lqw = buildQueryWrapper(bo);
        Page<PingPageConfigVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    @Override
    public List<PingPageConfigVo> queryList(PingPageConfigBo bo) {
        return baseMapper.selectVoList(buildQueryWrapper(bo));
    }

    @Override
    public PingPublicPageConfigVo queryPublicConfig(String pageKey, String target, String canonicalPath) {
        String safePageKey = "/" + pageKey.trim();

        String safeTarget = StringUtils.blankToDefault(target, "");
        String safeCanonicalPath = StringUtils.blankToDefault(canonicalPath, "/" + safePageKey);
        String cacheKey = CACHE_KEY_PREFIX + safePageKey + ":" + Integer.toHexString((safeTarget + "|" + safeCanonicalPath).hashCode());
        PingPublicPageConfigVo cached = RedisUtils.getCacheObject(cacheKey);
        if (cached != null && cached.getEnabled() != null) {
            return cached;
        }

        PingPageConfig config = baseMapper.selectOne(Wrappers.<PingPageConfig>lambdaQuery()
            .eq(PingPageConfig::getPageKey, safePageKey)
            .orderByAsc(PingPageConfig::getSortOrder)
            .last("limit 1"));
        PingPublicPageConfigVo vo = buildPublicConfig(config, safePageKey, safeTarget, safeCanonicalPath);
        RedisUtils.setCacheObject(cacheKey, vo, CACHE_TTL);
        return vo;
    }

    PingPublicPageConfigVo buildPublicConfig(
        PingPageConfig config,
        String pageKey,
        String target,
        String canonicalPath
    ) {
        return config == null
            ? fallbackPublicConfig(pageKey, target, canonicalPath)
            : toPublicConfig(config, target, canonicalPath);
    }

    @Override
    public Boolean insertByBo(PingPageConfigBo bo) {
        PingPageConfig add = MapstructUtils.convert(bo, PingPageConfig.class);
        validEntityBeforeSave(add);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
            clearPublicCache();
        }
        return flag;
    }

    @Override
    public Boolean updateByBo(PingPageConfigBo bo) {
        PingPageConfig update = MapstructUtils.convert(bo, PingPageConfig.class);
        validEntityBeforeSave(update);
        boolean flag = baseMapper.updateById(update) > 0;
        if (flag) {
            clearPublicCache();
        }
        return flag;
    }

    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        boolean flag = baseMapper.deleteByIds(ids) > 0;
        if (flag) {
            clearPublicCache();
        }
        return flag;
    }

    private LambdaQueryWrapper<PingPageConfig> buildQueryWrapper(PingPageConfigBo bo) {
        LambdaQueryWrapper<PingPageConfig> lqw = Wrappers.lambdaQuery();
        lqw.orderByAsc(PingPageConfig::getSortOrder);
        lqw.orderByAsc(PingPageConfig::getId);
        lqw.like(StringUtils.isNotBlank(bo.getPageName()), PingPageConfig::getPageName, bo.getPageName());
        lqw.eq(StringUtils.isNotBlank(bo.getPageKey()), PingPageConfig::getPageKey, bo.getPageKey());
        lqw.eq(StringUtils.isNotBlank(bo.getStatus()), PingPageConfig::getStatus, bo.getStatus());
        return lqw;
    }

    private void validEntityBeforeSave(PingPageConfig entity) {
        if (entity.getSortOrder() == null) {
            entity.setSortOrder(0L);
        }
        if (StringUtils.isBlank(entity.getStatus())) {
            entity.setStatus(ENABLED_STATUS);
        }
    }

    private PingPublicPageConfigVo fallbackPublicConfig(String pageKey, String target, String canonicalPath) {
        PingPublicPageConfigVo vo = new PingPublicPageConfigVo();
        vo.setPageKey(pageKey);
        vo.setPageName(pageKey);
        vo.setEnabled(true);
        vo.setTarget(target);
        vo.setCanonicalPath(canonicalPath);
        vo.setTitle(renderTemplate(FALLBACK_TITLES.getOrDefault(pageKey, "okping"), target, pageKey, canonicalPath));
        vo.setDescription(renderTemplate(FALLBACK_DESCRIPTIONS.getOrDefault(pageKey, "okping 网络拨测工具"), target, pageKey, canonicalPath));
        vo.setKeywords(renderTemplate( pageKey + ",网络检测", target, pageKey, canonicalPath));
        vo.setH1(renderTemplate("在线 " + pageKey, target, pageKey, canonicalPath));
        vo.setIntro(renderTemplate(vo.getDescription(), target, pageKey, canonicalPath));
        return vo;
    }

    private PingPublicPageConfigVo toPublicConfig(PingPageConfig config, String target, String canonicalPath) {
        PingPublicPageConfigVo vo = new PingPublicPageConfigVo();
        vo.setPageKey(config.getPageKey());
        vo.setPageName(config.getPageName());
        vo.setEnabled(ENABLED_STATUS.equals(config.getStatus()));
        vo.setTarget(target);
        vo.setCanonicalPath(canonicalPath);
        vo.setTitle(renderTemplate(config.getTitleTemplate(), target, config.getPageName(), canonicalPath));
        vo.setDescription(renderTemplate(config.getDescriptionTemplate(), target, config.getPageName(), canonicalPath));
        vo.setKeywords(renderTemplate(config.getKeywordsTemplate(), target, config.getPageName(), canonicalPath));
        vo.setH1(renderTemplate(config.getH1Template(), target, config.getPageName(), canonicalPath));
        vo.setIntro(renderTemplate(config.getIntroTemplate(), target, config.getPageName(), canonicalPath));
        if (StringUtils.isBlank(vo.getH1())) {
            vo.setH1(vo.getTitle());
        }
        if (StringUtils.isBlank(vo.getIntro())) {
            vo.setIntro(vo.getDescription());
        }
        return vo;
    }

    private String renderTemplate(String template, String target, String pageName, String canonicalPath) {
        if (StringUtils.isBlank(template)) {
            return "";
        }
        String safeTarget = StringUtils.blankToDefault(target, "");
        String displayTarget = StringUtils.isBlank(safeTarget) ? "目标地址" : safeTarget;
        return template
            .replace("{target}", safeTarget)
            .replace("{displayTarget}", displayTarget)
            .replace("{pageName}", StringUtils.blankToDefault(pageName, "okping"))
            .replace("{canonicalPath}", StringUtils.blankToDefault(canonicalPath, ""));
    }

    private void clearPublicCache() {
        RedisUtils.deleteKeys(CACHE_KEY_PREFIX + "*");
    }
}
