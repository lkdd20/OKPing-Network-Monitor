package org.dromara.ping.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.core.type.TypeReference;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dromara.common.core.utils.MapstructUtils;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.json.utils.JsonUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.common.redis.utils.RedisUtils;
import org.dromara.ping.domain.PingLayoutConfig;
import org.dromara.ping.domain.bo.PingLayoutConfigBo;
import org.dromara.ping.domain.vo.PingLayoutConfigVo;
import org.dromara.ping.domain.vo.PingPublicLayoutConfigVo;
import org.dromara.ping.mapper.PingLayoutConfigMapper;
import org.dromara.ping.service.IPingLayoutConfigService;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class PingLayoutConfigServiceImpl implements IPingLayoutConfigService {

    private static final String ENABLED_STATUS = "on";
    private static final String DEFAULT_CONFIG_KEY = "default";
    private static final String CACHE_KEY_PREFIX = "ping:layout-config:public:";
    private static final Duration CACHE_TTL = Duration.ofMinutes(5);
    private static final List<String> ANNOUNCEMENT_LEVELS = List.of("info", "warning", "danger");
    private static final List<String> HOME_TOOL_ICONS = List.of(
        "activity", "cable", "globe", "network", "route", "search", "rows", "radar", "shield", "server", "wifi"
    );
    private static final List<String> HOME_TOOL_CATEGORIES = List.of("ipv4", "ipv6", "batch");

    private static final TypeReference<List<PingPublicLayoutConfigVo.NavItem>> NAV_TYPE = new TypeReference<>() {
    };
    private static final TypeReference<List<PingPublicLayoutConfigVo.FooterColumn>> FOOTER_TYPE = new TypeReference<>() {
    };
    private static final TypeReference<List<PingPublicLayoutConfigVo.LinkItem>> LINK_TYPE = new TypeReference<>() {
    };
    private static final TypeReference<List<PingPublicLayoutConfigVo.AnnouncementItem>> ANNOUNCEMENT_TYPE = new TypeReference<>() {
    };
    private static final TypeReference<List<PingPublicLayoutConfigVo.HomeToolItem>> HOME_TOOL_TYPE = new TypeReference<>() {
    };

    private final PingLayoutConfigMapper baseMapper;

    @Override
    public PingLayoutConfigVo queryById(Long id) {
        return baseMapper.selectVoById(id);
    }

    @Override
    public TableDataInfo<PingLayoutConfigVo> queryPageList(PingLayoutConfigBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<PingLayoutConfig> lqw = buildQueryWrapper(bo);
        Page<PingLayoutConfigVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    @Override
    public List<PingLayoutConfigVo> queryList(PingLayoutConfigBo bo) {
        return baseMapper.selectVoList(buildQueryWrapper(bo));
    }

    @Override
    public PingPublicLayoutConfigVo queryPublicConfig(String configKey) {
        String safeConfigKey = StringUtils.isBlank(configKey) ? DEFAULT_CONFIG_KEY : configKey.trim();
        String cacheKey = CACHE_KEY_PREFIX + safeConfigKey;
        PingPublicLayoutConfigVo cached = RedisUtils.getCacheObject(cacheKey);
        if (cached != null) {
            return cached;
        }

        PingLayoutConfig config = baseMapper.selectOne(Wrappers.<PingLayoutConfig>lambdaQuery()
            .eq(PingLayoutConfig::getConfigKey, safeConfigKey)
            .eq(PingLayoutConfig::getStatus, ENABLED_STATUS)
            .last("limit 1"));
        PingPublicLayoutConfigVo vo = config == null ? fallbackPublicConfig(safeConfigKey) : toPublicConfig(config);
        RedisUtils.setCacheObject(cacheKey, vo, CACHE_TTL);
        return vo;
    }

    @Override
    public Boolean insertByBo(PingLayoutConfigBo bo) {
        PingLayoutConfig add = MapstructUtils.convert(bo, PingLayoutConfig.class);
        validEntityBeforeSave(add);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
            clearPublicCache();
        }
        return flag;
    }

    @Override
    public Boolean updateByBo(PingLayoutConfigBo bo) {
        PingLayoutConfig update = MapstructUtils.convert(bo, PingLayoutConfig.class);
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

    private LambdaQueryWrapper<PingLayoutConfig> buildQueryWrapper(PingLayoutConfigBo bo) {
        LambdaQueryWrapper<PingLayoutConfig> lqw = Wrappers.lambdaQuery();
        lqw.orderByAsc(PingLayoutConfig::getId);
        lqw.like(StringUtils.isNotBlank(bo.getSiteName()), PingLayoutConfig::getSiteName, bo.getSiteName());
        lqw.eq(StringUtils.isNotBlank(bo.getConfigKey()), PingLayoutConfig::getConfigKey, bo.getConfigKey());
        lqw.eq(StringUtils.isNotBlank(bo.getStatus()), PingLayoutConfig::getStatus, bo.getStatus());
        return lqw;
    }

    private void validEntityBeforeSave(PingLayoutConfig entity) {
        if (StringUtils.isBlank(entity.getConfigKey())) {
            entity.setConfigKey(DEFAULT_CONFIG_KEY);
        }
        if (StringUtils.isBlank(entity.getStatus())) {
            entity.setStatus(ENABLED_STATUS);
        }
        validateJson(entity.getNavItemsJson(), NAV_TYPE, "导航JSON");
        validateJson(entity.getFooterColumnsJson(), FOOTER_TYPE, "页脚栏目JSON");
        validateJson(entity.getFriendshipLinksJson(), LINK_TYPE, "友情链接JSON");
        validateAnnouncementsJson(entity.getAnnouncementsJson());
        validateHomeToolsJson(entity.getHomeToolsJson());
    }

    private <T> void validateJson(String text, TypeReference<T> typeReference, String fieldName) {
        if (StringUtils.isBlank(text)) {
            return;
        }
        try {
            JsonUtils.parseObject(text, typeReference);
        } catch (RuntimeException e) {
            throw new IllegalArgumentException(fieldName + "格式不正确", e);
        }
    }

    private void validateAnnouncementsJson(String text) {
        if (StringUtils.isBlank(text)) {
            return;
        }
        List<PingPublicLayoutConfigVo.AnnouncementItem> announcements;
        try {
            announcements = JsonUtils.parseObject(text, ANNOUNCEMENT_TYPE);
        } catch (RuntimeException e) {
            throw new IllegalArgumentException("公告JSON格式不正确", e);
        }
        if (announcements == null) {
            return;
        }
        for (PingPublicLayoutConfigVo.AnnouncementItem announcement : announcements) {
            if (announcement == null) {
                continue;
            }
            if (!ANNOUNCEMENT_LEVELS.contains(announcement.getLevel())) {
                throw new IllegalArgumentException("公告等级仅支持 info、warning、danger");
            }
            if (StringUtils.isBlank(announcement.getContent()) || StringUtils.isBlank(announcement.getUrl())) {
                throw new IllegalArgumentException("公告内容和跳转地址不能为空");
            }
            if (!isValidAnnouncementUrl(announcement.getUrl())) {
                throw new IllegalArgumentException("公告跳转地址仅支持站内路径、http、https、mailto、tel");
            }
        }
    }

    private boolean isValidAnnouncementUrl(String url) {
        String trimUrl = url == null ? "" : url.trim();
        return trimUrl.startsWith("/") || trimUrl.matches("(?i)^(https?:|mailto:|tel:).+");
    }

    private void validateHomeToolsJson(String text) {
        if (StringUtils.isBlank(text)) {
            return;
        }
        List<PingPublicLayoutConfigVo.HomeToolItem> tools;
        try {
            tools = JsonUtils.parseObject(text, HOME_TOOL_TYPE);
        } catch (RuntimeException e) {
            throw new IllegalArgumentException("首页功能卡片JSON格式不正确", e);
        }
        if (tools == null) {
            return;
        }
        if (tools.size() > 24) {
            throw new IllegalArgumentException("首页功能卡片最多配置24个");
        }
        for (PingPublicLayoutConfigVo.HomeToolItem tool : tools) {
            if (tool == null
                || StringUtils.isBlank(tool.getTitle())
                || StringUtils.isBlank(tool.getDescription())
                || StringUtils.isBlank(tool.getUrl())) {
                throw new IllegalArgumentException("首页功能卡片标题、描述和地址不能为空");
            }
            if (!HOME_TOOL_ICONS.contains(tool.getIcon())) {
                throw new IllegalArgumentException("首页功能卡片图标不受支持");
            }
            if (StringUtils.isNotBlank(tool.getCategory()) && !HOME_TOOL_CATEGORIES.contains(tool.getCategory())) {
                throw new IllegalArgumentException("首页功能卡片分类仅支持 ipv4、ipv6、batch");
            }
            if (StringUtils.isBlank(tool.getColor()) || !tool.getColor().matches("^#[0-9a-fA-F]{6}$")) {
                throw new IllegalArgumentException("首页功能卡片颜色必须为六位十六进制颜色");
            }
            if (!isValidHomeToolUrl(tool.getUrl())) {
                throw new IllegalArgumentException("首页功能卡片地址仅支持站内路径、http或https");
            }
        }
    }

    private boolean isValidHomeToolUrl(String url) {
        String trimUrl = url == null ? "" : url.trim();
        return trimUrl.startsWith("/") || trimUrl.matches("(?i)^https?://.+");
    }

    private PingPublicLayoutConfigVo fallbackPublicConfig(String configKey) {
        PingPublicLayoutConfigVo vo = new PingPublicLayoutConfigVo();

        return vo;
    }

    private PingPublicLayoutConfigVo toPublicConfig(PingLayoutConfig config) {
        PingPublicLayoutConfigVo fallback = fallbackPublicConfig(config.getConfigKey());
        PingPublicLayoutConfigVo vo = new PingPublicLayoutConfigVo();
        vo.setConfigKey(config.getConfigKey());
        vo.setSiteName(StringUtils.blankToDefault(config.getSiteName(), fallback.getSiteName()));
        vo.setLogoUrl(StringUtils.blankToDefault(config.getLogoUrl(), fallback.getLogoUrl()));
        vo.setFooterLogoUrl(StringUtils.blankToDefault(config.getFooterLogoUrl(), fallback.getFooterLogoUrl()));
        vo.setFooterSlogan(StringUtils.blankToDefault(config.getFooterSlogan(), fallback.getFooterSlogan()));
        vo.setCopyright(StringUtils.blankToDefault(config.getCopyright(), fallback.getCopyright()));
        vo.setIcpText(StringUtils.blankToDefault(config.getIcpText(), fallback.getIcpText()));
        vo.setIcpUrl(StringUtils.blankToDefault(config.getIcpUrl(), fallback.getIcpUrl()));
        vo.setServiceText(StringUtils.blankToDefault(config.getServiceText(), fallback.getServiceText()));
        vo.setServiceLinkText(StringUtils.blankToDefault(config.getServiceLinkText(), fallback.getServiceLinkText()));
        vo.setServiceLinkUrl(StringUtils.blankToDefault(config.getServiceLinkUrl(), fallback.getServiceLinkUrl()));
        vo.setNavItems(parseList(config.getNavItemsJson(), NAV_TYPE, fallback.getNavItems()));
        vo.setFooterColumns(parseList(config.getFooterColumnsJson(), FOOTER_TYPE, fallback.getFooterColumns()));
        vo.setFriendshipLinks(parseList(config.getFriendshipLinksJson(), LINK_TYPE, fallback.getFriendshipLinks()));
        vo.setAnnouncements(parseList(config.getAnnouncementsJson(), ANNOUNCEMENT_TYPE, fallback.getAnnouncements()));
        vo.setHomeTools(parseList(config.getHomeToolsJson(), HOME_TOOL_TYPE, fallback.getHomeTools()));
        return vo;
    }

    private <T> List<T> parseList(String text, TypeReference<List<T>> typeReference, List<T> fallback) {
        if (StringUtils.isBlank(text)) {
            return fallback;
        }
        try {
            List<T> list = JsonUtils.parseObject(text, typeReference);
            return list == null ? fallback : list;
        } catch (RuntimeException e) {
            log.warn("ping layout config json parse failed", e);
            return fallback;
        }
    }

    private List<PingPublicLayoutConfigVo.NavItem> defaultNavItems() {
        List<PingPublicLayoutConfigVo.NavItem> list = new ArrayList<>();
        list.add(nav("首页", "/"));
        list.add(nav("在线Ping", "/ping"));
        list.add(nav("在线TCPing", "/tcping"));
        list.add(nav("网站测速", "/http"));
        list.add(nav("DNS查询", "/dns"));
        list.add(nav("路由追踪", "/traceroute"));
        list.add(nav("IP查询", "/ip"));
        list.add(nav("Whois查询", "/whois"));
        PingPublicLayoutConfigVo.NavItem batch = nav("批量查询", "/batch");
        batch.setChildren(List.of(nav("批量Ping", "/batch_ping"), nav("批量TCPing", "/batch_tcping")));
        list.add(batch);
        PingPublicLayoutConfigVo.NavItem ipv6 = nav("IPv6工具", "/v6");
        ipv6.setChildren(List.of(
            nav("在线Ping", "/ping_v6"),
            nav("在线TCPing", "/tcping_v6"),
            nav("网站测速", "/http_v6"),
            nav("路由追踪", "/traceroute_v6")
        ));
        list.add(ipv6);
        return list;
    }

    private List<PingPublicLayoutConfigVo.FooterColumn> defaultFooterColumns() {
        return List.of(
            column("关于我们", List.of(
                link("公司介绍", "/about"),
                link("联系我们", "/contact"),
                link("发展历程", "/develop"),
                link("赞助节点", "/joinus"),
                link("公告通知", "/")
            )),
            column("拨测工具", List.of(
                link("在线Ping", "/ping"),
                link("在线Tcping", "/tcping"),
                link("网站测速", "/http"),
                link("路由追踪", "/traceroute"),
                link("DNS查询", "/dns"),
                link("IP查询", "/ip"),
                link("WHOIS查询", "/whois")
            )),
            column("产品与服务", List.of(
                link("网站监控", "/product"),
                link("Api监控", "/applicationpi"),
                link("SSL证书", "/ssl"),
                link("广告服务", "/ad"),
                link("产品定制", "/product_pricing")
            ))
        );
    }

    private List<PingPublicLayoutConfigVo.HomeToolItem> defaultHomeTools() {
        return List.of(
            homeTool("在线 Ping", "使用 ICMP 检测目标可达性与网络延迟", "/ping", "ipv4", "activity", "#2563EB"),
            homeTool("在线 TCPing", "检测目标主机指定 TCP 端口的连通性", "/tcping", "ipv4", "cable", "#0891B2"),
            homeTool("网站测速", "分析 HTTP 状态、连接与响应耗时", "/http", "ipv4", "globe", "#059669"),
            homeTool("DNS 查询", "查看不同地区和线路的域名解析结果", "/dns", "ipv4", "network", "#7C3AED"),
            homeTool("路由追踪", "以 MTR 视图定位网络路径和丢包节点", "/traceroute", "ipv4", "route", "#D97706"),
            homeTool("WHOIS 查询", "查询域名注册商、注册时间、到期时间与DNS服务器", "/whois", "ipv4", "search", "#475569"),
            homeTool("批量 Ping", "同时检测多个域名、IP 范围或 CIDR", "/batch_ping", "batch", "rows", "#DC2626"),
            homeTool("批量 TCPing", "批量检测多个目标的 TCP 端口", "/batch_tcping", "batch", "server", "#0F766E"),
            homeTool("IPv6 Ping", "使用 IPv6 节点检测目标可达性", "/ping_v6", "ipv6", "radar", "#0284C7"),
            homeTool("IPv6 TCPing", "检测 IPv6 目标端口连通性", "/tcping_v6", "ipv6", "cable", "#4F46E5"),
            homeTool("IPv6 网站测速", "通过 IPv6 网络分析网站响应性能", "/http_v6", "ipv6", "globe", "#16A34A"),
            homeTool("IPv6 路由追踪", "查看 IPv6 网络路径、时延与丢包", "/traceroute_v6", "ipv6", "route", "#BE123C")
        );
    }

    private PingPublicLayoutConfigVo.NavItem nav(String text, String url) {
        PingPublicLayoutConfigVo.NavItem item = new PingPublicLayoutConfigVo.NavItem();
        item.setText(text);
        item.setUrl(url);
        return item;
    }

    private PingPublicLayoutConfigVo.FooterColumn column(String title, List<PingPublicLayoutConfigVo.LinkItem> links) {
        PingPublicLayoutConfigVo.FooterColumn column = new PingPublicLayoutConfigVo.FooterColumn();
        column.setTitle(title);
        column.setLinks(links);
        return column;
    }

    private PingPublicLayoutConfigVo.LinkItem link(String title, String url) {
        PingPublicLayoutConfigVo.LinkItem item = new PingPublicLayoutConfigVo.LinkItem();
        item.setTitle(title);
        item.setUrl(url);
        return item;
    }

    private PingPublicLayoutConfigVo.HomeToolItem homeTool(
        String title, String description, String url, String category, String icon, String color
    ) {
        PingPublicLayoutConfigVo.HomeToolItem item = new PingPublicLayoutConfigVo.HomeToolItem();
        item.setTitle(title);
        item.setDescription(description);
        item.setUrl(url);
        item.setCategory(category);
        item.setIcon(icon);
        item.setColor(color);
        item.setEnabled(true);
        return item;
    }

    private void clearPublicCache() {
        RedisUtils.deleteKeys(CACHE_KEY_PREFIX + "*");
    }
}
