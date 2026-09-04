import { OPERATOR_OPTIONS } from "@/lib/ping/constants";

export const ACCOUNT_TOOL_DEFINITIONS = [
  { key: "ping", label: "在线 Ping 工具", group: "IPv4" },
  { key: "ping_v6", label: "在线 Ping 工具（IPv6）", group: "IPv6" },
  { key: "tcping", label: "在线 TCPing 工具", group: "IPv4" },
  { key: "tcping_v6", label: "在线 TCPing 工具（IPv6）", group: "IPv6" },
  { key: "http", label: "网站测速工具", group: "IPv4" },
  { key: "http_v6", label: "网站测速工具（IPv6）", group: "IPv6" },
  { key: "dns", label: "DNS 查询工具", group: "DNS" },
  { key: "traceroute", label: "路由追踪工具", group: "IPv4" },
  { key: "traceroute_v6", label: "路由追踪工具（IPv6）", group: "IPv6" },
  { key: "batch_ping", label: "批量 Ping 工具", group: "批量" },
  { key: "batch_tcping", label: "批量 TCPing 工具", group: "批量" },
] as const;

export type AccountToolKey = (typeof ACCOUNT_TOOL_DEFINITIONS)[number]["key"];
export type EnterAction = "single" | "continuous";
export type HistoryMode = "enabled" | "record-only" | "display-only" | "disabled";
export type DnsMode = "operator" | "custom";
export type RegionSummary = "china" | "overseas";

export type ToolPreference = {
  enterAction: EnterAction;
  historyMode: HistoryMode;
  operators: string[];
  dnsMode: DnsMode;
  customDns: string;
  mapTimeoutMarker: boolean;
  regionSummary: RegionSummary;
  dnsStatsExpanded: boolean;
  quickActions: boolean;
};

export type AccountPreferences = {
  revision: number;
  tools: Record<AccountToolKey, ToolPreference>;
};

export type AccountProfile = {
  userId: number;
  username: string;
  nickname?: string | null;
  tenantId: string;
};

export type AccountSession = {
  sessionKey: string;
  clientKey?: string | null;
  deviceType?: string | null;
  ipaddr?: string | null;
  loginLocation?: string | null;
  browser?: string | null;
  os?: string | null;
  loginTime?: number | null;
  current: boolean;
};

export type AccountLoginLog = {
  id: number;
  clientKey?: string | null;
  deviceType?: string | null;
  status?: string | null;
  ipaddr?: string | null;
  loginLocation?: string | null;
  browser?: string | null;
  os?: string | null;
  message?: string | null;
  loginTime?: string | null;
};

export function createDefaultToolPreference(): ToolPreference {
  return {
    enterAction: "single",
    historyMode: "enabled",
    operators: [...OPERATOR_OPTIONS],
    dnsMode: "operator",
    customDns: "",
    mapTimeoutMarker: true,
    regionSummary: "china",
    dnsStatsExpanded: true,
    quickActions: true,
  };
}

export function createDefaultAccountPreferences(): AccountPreferences {
  return {
    revision: 0,
    tools: Object.fromEntries(
      ACCOUNT_TOOL_DEFINITIONS.map(({ key }) => [key, createDefaultToolPreference()]),
    ) as Record<AccountToolKey, ToolPreference>,
  };
}

export function isAccountToolKey(value: string): value is AccountToolKey {
  return ACCOUNT_TOOL_DEFINITIONS.some((tool) => tool.key === value);
}
