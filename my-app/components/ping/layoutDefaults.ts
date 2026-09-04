import type { PingPublicLayoutConfig } from "@/lib/ping/types";

export const DEFAULT_LAYOUT_CONFIG: PingPublicLayoutConfig = {
  announcements: [],
  configKey: "default",
  copyright: "©2026  okping.net All Rights Reserved ",
  footerColumns: [
    {
      links: [
        { title: "公司介绍", url: "/about" },
        { title: "联系我们", url: "/contact" },
        { title: "发展历程", url: "/develop" },
        { title: "赞助节点", url: "/joinus" },
        { title: "公告通知", url: "/" },
        { title: "问题反馈", url: "/feedback" },
      ],
      title: "关于我们",
    },
    {
      links: [
        { title: "在线Ping", url: "/ping" },
        { title: "在线Tcping", url: "/tcping" },
        { title: "网站测速", url: "/http" },
        { title: "路由追踪", url: "/traceroute" },
        { title: "DNS查询", url: "/dns" },
        { title: "IP查询", url: "/ip" },
        { title: "WHOIS查询", url: "/whois" },
      ],
      title: "拨测工具",
    },
    {
      links: [
        { title: "网站监控", url: "/product" },
        { title: "Api监控", url: "/applicationpi" },
        { title: "SSL证书", url: "/ssl" },
        { title: "广告服务", url: "/ad" },
        { title: "产品定制", url: "/product_pricing" },
      ],
      title: "产品与服务",
    },
  ],
  footerLogoUrl: "/logo.png",
  footerSlogan: "企业级开放型一站式监控解决方案",
  friendshipLinks: [],
  homeTools: [
    { category: "ipv4", title: "在线 Ping", description: "使用 ICMP 检测目标可达性与网络延迟", url: "/ping", icon: "activity", color: "#2563EB", enabled: true },
    { category: "ipv4", title: "在线 TCPing", description: "检测目标主机指定 TCP 端口的连通性", url: "/tcping", icon: "cable", color: "#0891B2", enabled: true },
    { category: "ipv4", title: "网站测速", description: "分析 HTTP 状态、连接与响应耗时", url: "/http", icon: "globe", color: "#059669", enabled: true },
    { category: "ipv4", title: "DNS 查询", description: "查看不同地区和线路的域名解析结果", url: "/dns", icon: "network", color: "#7C3AED", enabled: true },
    { category: "ipv4", title: "路由追踪", description: "以 MTR 视图定位网络路径和丢包节点", url: "/traceroute", icon: "route", color: "#D97706", enabled: true },
    { category: "ipv4", title: "WHOIS 查询", description: "查询域名注册商、注册时间、到期时间与DNS服务器", url: "/whois", icon: "search", color: "#475569", enabled: true },
    { category: "batch", title: "批量 Ping", description: "同时检测多个域名、IP 范围或 CIDR", url: "/batch_ping", icon: "rows", color: "#DC2626", enabled: true },
    { category: "batch", title: "批量 TCPing", description: "批量检测多个目标的 TCP 端口", url: "/batch_tcping", icon: "server", color: "#0F766E", enabled: true },
    { category: "ipv6", title: "IPv6 Ping", description: "使用 IPv6 节点检测目标可达性", url: "/ping_v6", icon: "radar", color: "#0284C7", enabled: true },
    { category: "ipv6", title: "IPv6 TCPing", description: "检测 IPv6 目标端口连通性", url: "/tcping_v6", icon: "cable", color: "#4F46E5", enabled: true },
    { category: "ipv6", title: "IPv6 网站测速", description: "通过 IPv6 网络分析网站响应性能", url: "/http_v6", icon: "globe", color: "#16A34A", enabled: true },
    { category: "ipv6", title: "IPv6 路由追踪", description: "查看 IPv6 网络路径、时延与丢包", url: "/traceroute_v6", icon: "route", color: "#BE123C", enabled: true },
  ],
  icpText: "",
  icpUrl: "https://beian.miit.gov.cn/",
  logoUrl: "/logo_t.png",
  navItems: [
    { icon: "home", text: "首页", url: "/" },
    { icon: "ping", text: "在线Ping", url: "/ping" },
    { icon: "tcping", text: "在线TCPing", url: "/tcping" },
    { icon: "http", text: "网站测速", url: "/http" },
    { icon: "dns", text: "DNS查询", url: "/dns" },
    { icon: "traceroute", text: "路由追踪", url: "/traceroute" },
    { icon: "ip", text: "IP查询", url: "/ip" },
    { icon: "whois", text: "Whois查询", url: "/whois" },
    {
      children: [
        { icon: "ping", text: "批量Ping", url: "/batch_ping" },
        { icon: "tcping", text: "批量TCPing", url: "/batch_tcping" },
      ],
      icon: "batch",
      text: "批量查询",
      url: "/batch",
    },
    {
      children: [
        { icon: "ping", text: "在线Ping", url: "/ping_v6" },
        { icon: "tcping", text: "在线TCPing", url: "/tcping_v6" },
        { icon: "http", text: "网站测速", url: "/http_v6" },
        { icon: "traceroute", text: "路由追踪", url: "/traceroute_v6" },
      ],
      icon: "radar",
      text: "IPv6工具",
      url: "/v6",
    },
  ],
  serviceLinkText: "",
  serviceLinkUrl: "",
  serviceText: "",
  siteName: "",
};

export function mergeLayoutConfig(config?: PingPublicLayoutConfig): PingPublicLayoutConfig {
  return {
    ...DEFAULT_LAYOUT_CONFIG,
    ...(config ?? {}),
    footerColumns: config?.footerColumns?.length
      ? config.footerColumns
      : DEFAULT_LAYOUT_CONFIG.footerColumns,
    announcements: config?.announcements ?? DEFAULT_LAYOUT_CONFIG.announcements,
    friendshipLinks: config?.friendshipLinks ?? DEFAULT_LAYOUT_CONFIG.friendshipLinks,
    homeTools: config?.homeTools ?? DEFAULT_LAYOUT_CONFIG.homeTools,
    navItems: config?.navItems?.length ? config.navItems : DEFAULT_LAYOUT_CONFIG.navItems,
  };
}
