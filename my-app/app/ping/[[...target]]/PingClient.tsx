"use client";

import {Fragment, useCallback, useEffect, useMemo, useRef, useState,} from "react";
import {toPng} from "html-to-image";

import {ChinaProbeMap} from "@/components/ping/ChinaProbeMap";
import {CopyableIpCell} from "@/components/ping/CopyableIpCell";
import {
  DnsProbeDetails,
  getDnsAnswerRecords,
} from "@/components/ping/DnsProbeDetails";
import {
  getHTTPHeaderSnapshots,
  getHTTPStatusCodeFromHeaders,
  HttpProbeDetails,
} from "@/components/ping/HttpProbeDetails";
import {PingQualityCanvas} from "@/components/ping/PingQualityCanvas";
import {PingCenterAds} from "@/components/ping/PingAdSlots";
import {
  createDefaultHttpOptions,
  type HttpProbeOptions,
  PingHttpOptions,
  toHttpOptionsPayload,
} from "@/components/ping/PingHttpOptions";
import {PingShell} from "@/components/ping/PingShell";
import {PingToast} from "@/components/ping/PingToast";
import {PingDnsQueryTypeSelect} from "@/components/ping/PingDnsQueryTypeSelect";
import {
  getStoredProbeHistory,
  normalizeProbeTarget,
  PingProbeControls,
} from "@/components/ping/PingProbeControls";
import {
  DEFAULT_REGIONS,
  DEFAULT_PING_WS_BASE_URL,
  NODE_RESULT_FILTERS,
  OPERATOR_OPTIONS,
} from "@/lib/ping/constants";
import {
  getIpStats,
  getProbeAddress,
  getProbeAddresses,
  getProbeDurationMs,
  getProbeIp,
  getRespondedCount,
  getTimeoutCount,
  isProbeSuccess,
  mergeNodeMessage,
  toResultNodes,
} from "@/lib/ping/result";
import {buildProbeSharePath, ensureProbeTargetPort} from "@/lib/ping/target";
import {isHttpProbeType, isTcpingProbeType} from "@/lib/ping/probeType";
import type {AccountToolKey, RegionSummary as PreferenceRegionSummary} from "@/lib/auth/account";
import {useToolPreference} from "@/lib/auth/preferencesClient";
import type {
  DnsQueryType,
  IpStat,
  ProbeModel,
  ProbeType,
  PingNode,
  PingNodeMessage,
  PingNodeResult,
  PingPublicLayoutConfig,
  PingResponse
} from "@/lib/ping/types";

const PING_WS_BASE_URL =
  process.env.NEXT_PUBLIC_PING_WS_BASE_URL ?? DEFAULT_PING_WS_BASE_URL;

const DEFAULT_FILTER = { name: "全部", type: "loc" } as const;
const DOMESTIC_ROWS = [
  "全部节点",
  "中国电信",
  "中国联通",
  "中国移动",
  "华东地区",
  "华南地区",
  "华中地区",
  "华北地区",
  "西南地区",
  "西北地区",
  "东北地区",
  "港澳台",
] as const;
const ABROAD_ROWS = [
  "全部节点",
  "亚洲",
  "欧洲",
  "北美洲",
  "南美洲",
  "非洲",
  "大洋洲",
  "海外地区",
] as const;
const NORMAL_TABLE_COLUMNS = [190, 230, 280, 250, 296] as const;
const PERSISTENT_TABLE_COLUMNS = [180, 140, 200, 35, 35, 35, 35, 35, 35, 200, 200] as const;
const HTTP_TABLE_COLUMNS = [180, 130, 200, 70, 80, 65, 65,55, 155, 220] as const;
const DNS_TABLE_COLUMNS = [180, 160, 70, 350, 90, 160, 100, 136] as const;
const SPONSOR_TEXT_LIMIT = 10;
const TABLE_DIVIDER_CLASS = "border-r border-zinc-100 dark:border-gray-700 last:border-r-0";
const TABLE_HEADER_CLASS = "sticky top-14 z-40 bg-zinc-50 text-xs font-medium uppercase text-zinc-500 shadow-sm dark:bg-gray-800 dark:text-gray-400";

type PingClientProps = {
  activePath: string;
  apiPath: string;
  clearPath: string;
  dnsOptionsEnabled?: boolean;
  httpOptionsEnabled?: boolean;
  initialError?: string;
  initialUrl: string;
  layoutConfig?: PingPublicLayoutConfig;
  firstNodesApiPath?: string;
  placeholder: string;
  probeLabel: string;
  probeType: ProbeType;
  secondaryActionLabel?: string;
  secondaryActionModel?: ProbeModel;
  screenshotSuffix: string;
  screenNodesApiPath?: string;
};

type SubmitPingData = {
  accessKey?: unknown;
  target?: unknown;
  taskId?: unknown;
};

type SubmitPingResponse = PingResponse<SubmitPingData | string> & {
  task_id?: unknown;
  taskid?: unknown;
  taskId?: unknown;
};

type WsStatus =
  | "idle"
  | "loading"
  | "submitting"
  | "connecting"
  | "running"
  | "completed"
  | "closed"
  | "error";

type FilterType = "loc" | "ips" | "region";

type ResultFilter = {
  name: string;
  type: FilterType;
};

type RegionSummary = {
  average: string;
  fast: string;
  filter: ResultFilter;
  name: string;
  slow: string;
};

type ProbeMetric = {
  labels?: Record<string, string>;
  name?: string;
  value?: number | string;
};

function getMessage(body: PingResponse<unknown>) {
  const message = body.msg ?? body.message;

  return typeof message === "string" ? message : "";
}

function truncateSponsorText(value: string) {
  return Array.from(value).slice(0, SPONSOR_TEXT_LIMIT).join("");
}

function normalizeSponsorUrl(value?: string | null) {
  const url = value?.trim();

  if (!url || !/^(https?:|mailto:|tel:|\/)/i.test(url)) {
    return "";
  }

  return url;
}

function getInitialErrorMessage(error?: string, probeLabel = "ping") {
  if (error === "url_required") {
    return `请输入要 ${probeLabel} 的域名或 IP。`;
  }
  if (error === "backend_failed") {
    return "后端接口请求失败，请稍后重试。";
  }

  return "";
}

function parseJsonMessage(message: string) {
  try {
    return JSON.parse(message) as PingNodeMessage | PingResponse<unknown>;
  } catch {
    return message;
  }
}

function getAccessKey(body: SubmitPingResponse) {
  const data = body.data;
  if (typeof data === "string" || typeof data === "number") {
    return String(data);
  }
  if (data && typeof data === "object") {
    const accessKey = data.accessKey ?? data.taskId;
    if (typeof accessKey === "string" || typeof accessKey === "number") {
      return String(accessKey);
    }
  }

  const taskId = body.task_id ?? body.taskid ?? body.taskId;

  return typeof taskId === "string" || typeof taskId === "number"
    ? String(taskId)
    : "";
}

function getResponseError(body: PingResponse<unknown> | null, fallback: string) {
  if (!body) {
    return fallback;
  }

  return getMessage(body) || fallback;
}

function getPublicErrorMessage(message: string) {
  if (
    message.includes("RabbitMQ") ||
    message.includes("节点任务") ||
    message.includes("任务UUID") ||
    message.includes("WebSocket")
  ) {
    return "检测任务暂不可用，请稍后重试。";
  }

  return message;
}

function isBackendErrorMessage(message: unknown): message is PingResponse<unknown> {
  if (!message || typeof message !== "object" || !("code" in message)) {
    return false;
  }

  const code = (message as PingResponse<unknown>).code;
  return (
    (typeof code === "number" && code !== 200) ||
    (typeof code === "string" && Number(code) !== 200)
  );
}

async function readPingData<T>(response: Response) {
  const body = (await response.json().catch(() => null)) as PingResponse<T> | null;

  if (!response.ok) {
    throw new Error(getResponseError(body, `请求失败，状态码 ${response.status}。`));
  }

  if (!body) {
    throw new Error("接口响应为空。");
  }

  const code = typeof body.code === "string" ? Number(body.code) : body.code;
  if (typeof code === "number" && code !== 200) {
    throw new Error(getMessage(body) || `接口返回异常状态 ${code}。`);
  }

  return body.data as T;
}

function operatorLabel(operator?: string | null) {
  return operator === "港澳台、海外" ? "海外" : operator || "未知";
}

function operatorBadgeClass(operator?: string | null) {
  switch (operator) {
    case "电信":
      return "bg-emerald-500 text-white";
    case "移动":
      return "bg-blue-500 text-white";
    case "联通":
      return "bg-yellow-400 text-zinc-950";
    case "多线":
      return "bg-fuchsia-500 text-white";
    case "港澳台、海外":
      return "bg-zinc-500 text-white";
    default:
      return "bg-zinc-200 text-zinc-700";
  }
}

function normalizeProvinceName(value?: string | null) {
  return (value || "").replace(/省|市|维吾尔自治区|回族自治区|壮族自治区|自治区|特别行政区/g, "");
}

function isResponded(node: PingNodeResult) {
  return node.dataValue.length > 0;
}

function isTimeout(node: PingNodeResult) {
  return isResponded(node) && !isProbeSuccess(node);
}

function getResponseAddress(node: PingNodeResult) {
  return getProbeAddress(node);
}

function getIpLocation(node: PingNodeResult) {
  return node.ipLocation?.split("|").filter(Boolean).join(" / ") || "--";
}

function toFiniteNumber(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getProbeMetrics(node: PingNodeResult): ProbeMetric[] {
  const metrics = node.probeResult?.metrics;
  if (!Array.isArray(metrics)) {
    return [];
  }

  return metrics.filter((metric): metric is ProbeMetric => Boolean(metric) && typeof metric === "object");
}

function getMetricValue(
  node: PingNodeResult,
  name: string,
  labels?: Record<string, string>,
) {
  const metric = getProbeMetrics(node).find((item) => {
    if (item.name !== name) {
      return false;
    }
    if (!labels) {
      return true;
    }

    return Object.entries(labels).every(([key, value]) => item.labels?.[key] === value);
  });

  return toFiniteNumber(metric?.value);
}

function getHTTPStatusCode(node: PingNodeResult) {
  return getHTTPStatusCodeFromHeaders(node) ?? getMetricValue(node, "probe_http_status_code");
}

function getHTTPPhaseMs(node: PingNodeResult, phase: string) {
  const value =
    getMetricValue(node, "probe_http_duration_seconds", { phase }) ??
    (phase === "resolve" ? getMetricValue(node, "probe_dns_lookup_time_seconds") : null);

  return value == null ? "--" : String(Math.round(value * 1000));
}

function getHTTPDurationText(node: PingNodeResult) {
  if (!isResponded(node)) {
    return "等待中";
  }
  if (!node.probeResult) {
    return getResultError(node.error);
  }

  return `${(getProbeDurationMs(node) / 1000).toFixed(2)}s`;
}

function getHTTPStatusText(node: PingNodeResult) {
  const statusCode = getHTTPStatusCode(node);
  if (statusCode == null || statusCode <= 0) {
    return isResponded(node) ? "失败" : "--";
  }

  return String(Math.round(statusCode));
}

function getHTTPStatusClass(node: PingNodeResult) {
  const statusCode = getHTTPStatusCode(node);
  if (!isResponded(node)) {
    return "text-zinc-400 dark:text-gray-500";
  }
  if (statusCode != null && statusCode >= 200 && statusCode < 400) {
    return "text-blue-600 dark:text-blue-400";
  }

  return "text-red-600 dark:text-red-400";
}

function getDisplayTime(node: PingNodeResult) {
  if (!isResponded(node)) {
    return "等待中";
  }
  if (!isProbeSuccess(node)) {
    return getResultError(node.error);
  }

  return `${getProbeDurationMs(node)}ms`;
}

function getResultError(error?: string | null) {
  if (error === "unsupported task type: dns") {
    return "节点版本过旧，请更新 Agent";
  }
  if (!error || error === "ping timeout" || error === "tcping timeout") {
    return "响应超时";
  }
  if (error === "http probe failed") {
    return "请求失败";
  }
  if (error === "dns probe failed") {
    return "查询失败";
  }
  if (error.startsWith("resolve ")) {
    return "解析失败";
  }
  return error;
}

function getSuccessfulValues(node: PingNodeResult) {
  return node.dataValue
    .filter((item) => !item.timeout)
    .map((item) => item.value)
    .filter((value) => Number.isFinite(value));
}

function getPacketLoss(node: PingNodeResult) {
  if (!node.dataValue.length) {
    return "--";
  }

  const timeoutCount = node.dataValue.filter((item) => item.timeout).length;
  return `${Math.round((timeoutCount / node.dataValue.length) * 100)}%`;
}

function getLatestValue(node: PingNodeResult) {
  const latest = node.dataValue.at(-1);
  if (!latest) {
    return "--";
  }
  if (latest.timeout) {
    return getResultError(node.error);
  }

  return String(Math.round(latest.value));
}

function getFastValue(node: PingNodeResult) {
  const values = getSuccessfulValues(node);

  return values.length ? String(Math.round(Math.min(...values))) : "--";
}

function getSlowValue(node: PingNodeResult) {
  const values = getSuccessfulValues(node);

  return values.length ? String(Math.round(Math.max(...values))) : "--";
}

function getAverageValue(node: PingNodeResult) {
  const values = getSuccessfulValues(node);
  if (!values.length) {
    return "--";
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return String(Math.round(total / values.length));
}

function getFilterCount(filter: string, nodes: PingNodeResult[]) {
  if (filter === "全部") {
    return nodes.length;
  }
  if (filter === "海外") {
    return nodes.filter((node) => node.operators === "港澳台、海外").length;
  }
  if (filter === "超时") {
    return getTimeoutCount(nodes);
  }

  return nodes.filter((node) => node.operators === filter).length;
}

function filterNodes(filter: ResultFilter, nodes: PingNodeResult[]) {
  if (filter.type === "ips") {
    return nodes.filter((node) => getProbeAddresses(node).includes(filter.name));
  }

  if (filter.type === "region") {
    const normalizedName = normalizeProvinceName(filter.name);
    return nodes.filter(
      (node) =>
        node.region === filter.name ||
        normalizeProvinceName(node.province) === normalizedName,
    );
  }

  if (filter.name === "全部") {
    return nodes;
  }
  if (filter.name === "海外") {
    return nodes.filter((node) => node.operators === "港澳台、海外");
  }
  if (filter.name === "超时") {
    return nodes.filter(isTimeout);
  }

  return nodes.filter((node) => node.operators === filter.name);
}

function getSummaryNodes(name: string, nodes: PingNodeResult[]) {
  if (name === "全部节点") {
    return nodes;
  }
  if (name === "中国电信") {
    return nodes.filter((node) => node.operators === "电信");
  }
  if (name === "中国联通") {
    return nodes.filter((node) => node.operators === "联通");
  }
  if (name === "中国移动") {
    return nodes.filter((node) => node.operators === "移动");
  }

  return nodes.filter((node) => node.region === name);
}

function getSummaryFilter(name: string): ResultFilter {
  if (name === "全部节点") {
    return DEFAULT_FILTER;
  }
  if (name === "中国电信") {
    return { name: "电信", type: "loc" };
  }
  if (name === "中国联通") {
    return { name: "联通", type: "loc" };
  }
  if (name === "中国移动") {
    return { name: "移动", type: "loc" };
  }
  if (name === "海外地区") {
    return { name: "海外", type: "loc" };
  }

  return { name, type: "region" };
}

function buildSummary(name: string, nodes: PingNodeResult[]): RegionSummary {
  const matchedNodes = getSummaryNodes(name, nodes);
  const successNodes = matchedNodes.filter(isProbeSuccess);

  if (!successNodes.length) {
    return {
      average: "--",
      fast: "--",
      filter: getSummaryFilter(name),
      name,
      slow: "--",
    };
  }

  const sortedByTime = [...successNodes].sort(
    (left, right) => getProbeDurationMs(left) - getProbeDurationMs(right),
  );
  const totalTime = successNodes.reduce((sum, node) => sum + getProbeDurationMs(node), 0);
  const fastest = sortedByTime[0];
  const slowest = sortedByTime.at(-1) ?? fastest;

  return {
    average: `${(totalTime / successNodes.length).toFixed(2)}`,
    fast: `${fastest.name ?? "未知节点"}/${operatorLabel(fastest.operators)}/${getProbeDurationMs(fastest)}ms`,
    filter: getSummaryFilter(name),
    name,
    slow: `${slowest.name ?? "未知节点"}/${operatorLabel(slowest.operators)}/${getProbeDurationMs(slowest)}ms`,
  };
}

function sameFilter(left: ResultFilter, right: ResultFilter) {
  return left.name === right.name && left.type === right.type;
}

function ProgressPanel({
  activeFilter,
  defaultArea,
  hasSubmitted,
  model,
  nodes,
  onSelectFilter,
  probeType,
  showDownMarkers,
}: {
  activeFilter: ResultFilter;
  defaultArea: PreferenceRegionSummary;
  hasSubmitted: boolean;
  model: ProbeModel;
  nodes: PingNodeResult[];
  onSelectFilter: (value: ResultFilter) => void;
  probeType: ProbeType;
  showDownMarkers: boolean;
}) {
  const [area, setArea] = useState<"china" | "abroad">(defaultArea === "overseas" ? "abroad" : "china");

  useEffect(() => {
    setArea(defaultArea === "overseas" ? "abroad" : "china");
  }, [defaultArea]);
  const domesticNodes = nodes.filter((node) => node.operators !== "港澳台、海外");
  const abroadNodes = nodes.filter((node) => node.operators === "港澳台、海外");
  const areaNodes = area === "china" ? domesticNodes : abroadNodes;
  const rows = (area === "china" ? DOMESTIC_ROWS : ABROAD_ROWS).map((name) =>
    buildSummary(name, areaNodes),
  );
  const totalNodeCount = areaNodes.length;
  const respondedNodeCount = getRespondedCount(areaNodes);
  const progress = totalNodeCount
    ? Math.round((respondedNodeCount / totalNodeCount) * 100)
    : 0;

  if (model === "persistent") {
    return null;
  }

  return (
    <section className="mx-auto grid w-full max-w-7xl grid-cols-2 items-stretch gap-4 px-4">
      <ChinaProbeMap
        activeProvince={activeFilter.type === "region" ? activeFilter.name : undefined}
        defaultShowDownMarkers={showDownMarkers}
        hasSubmitted={hasSubmitted}
        nodes={nodes}
        onSelectProvince={(province) => onSelectFilter({ name: province, type: "region" })}
        probeType={probeType}
        key={showDownMarkers ? "markers-on" : "markers-off"}
      />

      <div className="flex h-[550px] min-w-0 flex-col rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-1 dark:border-gray-700">
          <div className="flex items-center">
            <button
              className={`px-3 py-1 text-sm font-medium ${
                area === "china"
                  ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
              onClick={() => setArea("china")}
              type="button"
            >
              中国地区
            </button>
            <button
              className={` px-3 py-1 text-sm font-medium ${
                area === "abroad"
                  ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
              onClick={() => setArea("abroad")}
              type="button"
            >
              海外地区
            </button>
          </div>
          <div className="flex min-w-[270px] items-center justify-end gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="whitespace-nowrap">
              {hasSubmitted ? `节点进度 ${respondedNodeCount}/${totalNodeCount}` : `总节点 ${totalNodeCount}`}
            </span>
            <div
              aria-label={`节点响应进度 ${progress}%`}
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={progress}
              className="h-2 w-28 overflow-hidden rounded-full bg-zinc-200 dark:bg-gray-700"
              role="progressbar"
            >
              <div
                className="h-full rounded-full bg-blue-600 transition-[width] duration-300 dark:bg-blue-400"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="w-8 text-right font-medium text-zinc-700 dark:text-zinc-200">
              {hasSubmitted ? `${progress}%` : "--"}
            </span>
          </div>
        </div>

        <div className="mt-1 min-h-0 flex-1 overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-white text-xs font-medium text-zinc-500 dark:bg-gray-900 dark:text-zinc-400">
              <tr className="border-b border-zinc-100 dark:border-gray-700">
                <th className={`px-3 py-2 text-center ${TABLE_DIVIDER_CLASS}`}>区域/运营商</th>
                <th className={`px-3 py-2 text-center ${TABLE_DIVIDER_CLASS}`}>最快</th>
                <th className={`px-3 py-2 text-center ${TABLE_DIVIDER_CLASS}`}>最慢</th>
                <th className={`px-3 py-2 text-center ${TABLE_DIVIDER_CLASS}`}>平均/ms</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  className={`cursor-pointer border-b border-zinc-50 transition hover:bg-zinc-50 dark:border-gray-800 dark:hover:bg-gray-800 ${
                    sameFilter(activeFilter, row.filter) ? "bg-blue-50 dark:bg-blue-950/40" : ""
                  }`}
                  key={row.name}
                  onClick={() => onSelectFilter(row.filter)}
                >
                  <td className={`px-3 py-2 text-center text-zinc-700 dark:text-zinc-200 ${TABLE_DIVIDER_CLASS}`}>
                    <div className="font-medium">{row.name}</div>
                  </td>
                  <td className={`max-w-52 px-3 py-2 text-center text-zinc-600 dark:text-zinc-300 ${TABLE_DIVIDER_CLASS}`}>
                    <span className="line-clamp-2 break-words">{row.fast}</span>
                  </td>
                  <td className={`max-w-52 px-3 py-2 text-center text-zinc-600 dark:text-zinc-300 ${TABLE_DIVIDER_CLASS}`}>
                    <span className="line-clamp-2 break-words">{row.slow}</span>
                  </td>
                  <td className={`px-3 py-2 text-center font-medium text-zinc-700 dark:text-zinc-200 ${TABLE_DIVIDER_CLASS}`}>
                    {row.average}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function IpStatsPanel({
  activeFilter,
  defaultExpanded,
  model,
  onSelectFilter,
  probeType,
  stats,
}: {
  activeFilter: ResultFilter;
  defaultExpanded: boolean;
  model: ProbeModel;
  onSelectFilter: (value: ResultFilter) => void;
  probeType: ProbeType;
  stats: IpStat[];
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const title = isTcpingProbeType(probeType) ? "响应IP:端口统计" : "响应IP统计";

  useEffect(() => {
    setExpanded(defaultExpanded);
  }, [defaultExpanded]);

  if (model === "persistent") {
    return null;
  }

  async function copyIps() {
    const text = stats.map((item) => item.value).join("\n");
    if (!text) {
      return;
    }

    await navigator.clipboard?.writeText(text).catch(() => undefined);
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4">
      <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-600 dark:text-gray-300">{title}</span>
            <span className="rounded bg-blue-600 px-2.5 py-0.5 text-xs font-medium text-white">
              {stats.length}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              className="rounded-lg bg-yellow-400 px-3 py-2 text-xs font-medium text-zinc-950 transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:bg-yellow-200"
              disabled={!stats.length}
              onClick={() => void copyIps()}
              type="button"
            >
              复制
            </button>
            <button
              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700"
              onClick={() => setExpanded((current) => !current)}
              type="button"
            >
              {expanded ? "收起" : "展开"}
            </button>
          </div>
        </div>
        <div
          className="mt-3 flex flex-wrap gap-2 overflow-hidden transition-[max-height]"
          style={{ maxHeight: expanded ? "none" : 300 }}
        >
          {stats.length ? (
            stats.map((item) => {
              const selected = activeFilter.type === "ips" && activeFilter.name === item.value;

              return (
                <button
                  className={`rounded-lg border px-2 py-2 text-left text-xs transition ${
                    item.value.length > 16 ? "w-[305px]" : "w-[155px]"
                  } ${
                    selected
                      ? "border-blue-400 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-300"
                      : "border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                  }`}
                  key={item.value}
                  onClick={() =>
                    onSelectFilter(selected ? DEFAULT_FILTER : { name: item.value, type: "ips" })
                  }
                  type="button"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate">{item.value}</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{item.percentage}</span>
                  </div>
                </button>
              );
            })
          ) : (
            <span className="px-1 py-2 text-sm text-zinc-400 dark:text-gray-500">暂无响应结果</span>
          )}
        </div>
      </div>
    </section>
  );
}

function FilterTabs({
  activeFilter,
  nodes,
  onSelectFilter,
}: {
  activeFilter: ResultFilter;
  nodes: PingNodeResult[];
  onSelectFilter: (value: ResultFilter) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {NODE_RESULT_FILTERS.map((filter) => {
        const selected = activeFilter.type === "loc" && activeFilter.name === filter;
        const count = getFilterCount(filter, nodes);

        return (
          <button
            className={`relative rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
              selected
                ? "border-blue-500 bg-blue-500 text-white"
                : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 hover:text-blue-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
            }`}
            key={filter}
            onClick={() => onSelectFilter({ name: filter, type: "loc" })}
            type="button"
          >
            {filter}
            {filter === "超时" && count > 0 ? (
              <span className="absolute -right-2 -top-2 rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                {count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function NodeNameCell({ node }: { node: PingNodeResult }) {
  return (
    <div className="text-xs">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={`rounded px-2.5 py-0.5 text-xs font-medium ${operatorBadgeClass(node.operators)}`}>
          {operatorLabel(node.operators)}
        </span>
        <span className="font-medium text-zinc-900 dark:text-zinc-100">{node.name || `节点 ${node.key}`}</span>
        {node.homeState ? (
          <span className="rounded bg-indigo-500 px-2.5 py-0.5 text-xs font-medium text-white">家庭</span>
        ) : null}
      </div>
      {/*<div className="mt-1 text-xs text-zinc-400 dark:text-gray-500">*/}
      {/*  {[node.region, node.province, node.city].filter(Boolean).join(" / ")}*/}
      {/*</div>*/}
    </div>
  );
}

function SponsorCell({ text, url }: { text?: string | null; url?: string | null }) {
  const label = truncateSponsorText(text?.trim() || "");
  const href = normalizeSponsorUrl(url);

  if (!label) {
    return <span className="text-zinc-400">--</span>;
  }

  if (!href) {
    return <span className="truncate text-zinc-700 dark:text-gray-200">{label}</span>;
  }

  return (
    <a
      className="inline-block max-w-full truncate font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
      title={text ?? label}
    >
      {label}
    </a>
  );
}

function HTTPHeadersCell({
  expanded,
  node,
  onToggle,
}: {
  expanded: boolean;
  node: PingNodeResult;
  onToggle: () => void;
}) {
  const hasDetails = getHTTPHeaderSnapshots(node).length > 0;

  if (!hasDetails) {
    return <span className="text-zinc-400 dark:text-gray-500">--</span>;
  }

  return (
    <button
      aria-controls={`http-details-${node.key}`}
      aria-expanded={expanded}
      className="text-xs font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
      onClick={onToggle}
      type="button"
    >
      {expanded ? "收起详情" : "查看详情"}
    </button>
  );
}
//获取重定向次数
function getRedirectCount(node:PingNodeResult){
  const value = getHTTPHeaderSnapshots(node).filter((snapshot): boolean => {
    const statusCode = snapshot.status_code ?? 0;
    return statusCode >= 300 && statusCode < 400;
  }).length
  return value
}
function ResultTable({
  activeFilter,
  dnsQueryType,
  dnsServer,
  model,
  nodes,
  onSelectFilter,
  probeType,
  quickActions,
  target,
}: {
  activeFilter: ResultFilter;
  dnsQueryType: DnsQueryType;
  dnsServer: string;
  model: ProbeModel;
  nodes: PingNodeResult[];
  onSelectFilter: (value: ResultFilter) => void;
  probeType: ProbeType;
  quickActions: boolean;
  target: string;
}) {
  const [expandedDnsRows, setExpandedDnsRows] = useState<number[]>([]);
  const [expandedHttpRows, setExpandedHttpRows] = useState<number[]>([]);
  const visibleNodes = filterNodes(activeFilter, nodes);
  const respondedCount = getRespondedCount(nodes);
  const tableColumns = model === "persistent" ? PERSISTENT_TABLE_COLUMNS : NORMAL_TABLE_COLUMNS;

  const toggleHttpRow = (nodeId: number) => {
    setExpandedHttpRows((current) =>
      current.includes(nodeId)
        ? current.filter((id) => id !== nodeId)
        : [...current, nodeId],
    );
  };

  const toggleDnsRow = (nodeId: number) => {
    setExpandedDnsRows((current) =>
      current.includes(nodeId)
        ? current.filter((id) => id !== nodeId)
        : [...current, nodeId],
    );
  };


  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-8">
      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-100 p-3 dark:border-gray-700">
          <FilterTabs activeFilter={activeFilter} nodes={nodes} onSelectFilter={onSelectFilter} />
          <span className="text-sm text-blue-600 dark:text-blue-400">
            当前显示：{visibleNodes.filter(isResponded).length || respondedCount}/{nodes.length}
          </span>
        </div>
        <div className="overflow-visible">
          {probeType === "dns" ? (
            <table className="w-full table-fixed text-xs text-zinc-500 dark:text-gray-400">
              <colgroup>
                {DNS_TABLE_COLUMNS.map((width, index) => (
                  <col key={`${width}-${index}`} style={{ width }} />
                ))}
              </colgroup>
              <thead className={TABLE_HEADER_CLASS}>
                <tr>
                  <th className={`px-3 py-3 text-left ${TABLE_DIVIDER_CLASS}`}>节点名称</th>
                  <th className={`px-3 py-3 text-center ${TABLE_DIVIDER_CLASS}`}>目标</th>
                  <th className={`px-3 py-3 text-center ${TABLE_DIVIDER_CLASS}`}>类型</th>
                  <th className={`px-3 py-3 text-center ${TABLE_DIVIDER_CLASS}`}>解析结果（默认显示5条）</th>
                  <th className={`px-3 py-3 text-center ${TABLE_DIVIDER_CLASS}`}>耗时</th>
                  <th className={`px-3 py-3 text-center ${TABLE_DIVIDER_CLASS}`}>DNS</th>
                  <th className={`px-3 py-3 text-center ${TABLE_DIVIDER_CLASS}`}>详情</th>
                  <th className={`px-3 py-3 text-center ${TABLE_DIVIDER_CLASS}`}>赞助商</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {visibleNodes.map((node) => {
                  const expanded = expandedDnsRows.includes(node.key);
                  const records = getDnsAnswerRecords(node);
                  const effectiveDns = node.probeResult?.effective_target?.trim() || dnsServer || "运营商DNS";

                  return (
                    <Fragment key={node.key}>
                      <tr className="border-t border-zinc-100 align-middle hover:bg-zinc-50 dark:border-gray-700 dark:hover:bg-gray-800">
                        <td className={`px-3 py-3 ${TABLE_DIVIDER_CLASS}`}>
                          <NodeNameCell node={node} />
                        </td>
                        <td className={`break-all px-3 py-3 text-center text-zinc-700 dark:text-gray-200 ${TABLE_DIVIDER_CLASS}`} title={node.probeResult?.target || target}>
                          <span className="line-clamp-2">{node.probeResult?.target || target || "--"}</span>
                        </td>
                        <td className={`px-3 py-3 text-center font-medium text-zinc-700 dark:text-gray-200 ${TABLE_DIVIDER_CLASS}`}>
                          {dnsQueryType}
                        </td>
                        <td className={`px-3 py-3 text-left text-zinc-700 dark:text-gray-200 ${TABLE_DIVIDER_CLASS}`}>
                          {!isResponded(node) ? (
                            <span className="block text-center text-zinc-400 dark:text-gray-500">等待中</span>
                          ) : records.length ? (
                            <div className="space-y-1">
                              {records.slice(0, 5).map((record, index) => (
                                <p className="truncate" key={`${record}-${index}`} title={record}>{record}</p>
                              ))}
                            </div>
                          ) : (
                            <span className={`block text-center ${isProbeSuccess(node) ? "" : "text-red-600 dark:text-red-400"}`}>
                              {isProbeSuccess(node) ? "无记录" : getResultError(node.error)}
                            </span>
                          )}
                        </td>
                        <td className={`px-3 py-3 text-center font-semibold ${TABLE_DIVIDER_CLASS} ${
                          !isResponded(node)
                            ? "text-zinc-400 dark:text-gray-500"
                            : isProbeSuccess(node)
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-red-600 dark:text-red-400"
                        }`}>
                          {getDisplayTime(node)}
                        </td>
                        <td className={`break-all px-3 py-3 text-center text-zinc-700 dark:text-gray-200 ${TABLE_DIVIDER_CLASS}`} title={effectiveDns}>
                          <span className="line-clamp-2">{effectiveDns}</span>
                        </td>
                        <td className={`px-3 py-3 text-center ${TABLE_DIVIDER_CLASS}`}>
                          {isResponded(node) ? (
                            <button
                              aria-controls={`dns-details-${node.key}`}
                              aria-expanded={expanded}
                              className="text-xs font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
                              onClick={() => toggleDnsRow(node.key)}
                              type="button"
                            >
                              {expanded ? "收起详情" : "查看详情"}
                            </button>
                          ) : (
                            <span className="text-zinc-400 dark:text-gray-500">--</span>
                          )}
                        </td>
                        <td className={`px-3 py-3 text-center text-zinc-700 dark:text-gray-200 ${TABLE_DIVIDER_CLASS}`}>
                          <SponsorCell text={node.sponsorText} url={node.sponsorUrl} />
                        </td>
                      </tr>
                      {expanded ? (
                        <tr
                          className="border-t border-zinc-200 bg-zinc-50 dark:border-gray-700 dark:bg-gray-950"
                          id={`dns-details-${node.key}`}
                        >
                          <td className="px-5 py-4" colSpan={DNS_TABLE_COLUMNS.length}>
                            <DnsProbeDetails
                              dnsServer={dnsServer}
                              node={node}
                              queryType={dnsQueryType}
                              target={target}
                            />
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          ) : isHttpProbeType(probeType) ? (
            <table className="w-full table-fixed text-xs text-zinc-500 dark:text-gray-400">
              <colgroup>
                {HTTP_TABLE_COLUMNS.map((width, index) => (
                  <col key={`${width}-${index}`} style={{ width }} />
                ))}
              </colgroup>
              <thead className={TABLE_HEADER_CLASS}>
                <tr>
                  <th className={`px-3 py-3 text-left ${TABLE_DIVIDER_CLASS}`}>节点名称</th>
                  <th className={`px-3 py-3 text-center ${TABLE_DIVIDER_CLASS}`}>响应IP</th>
                  <th className={`px-3 py-3 text-center ${TABLE_DIVIDER_CLASS}`}>IP归属地</th>
                  <th className={`px-3 py-3 text-center ${TABLE_DIVIDER_CLASS}`}>状态码</th>
                  <th className={`px-3 py-3 text-center ${TABLE_DIVIDER_CLASS}`}>响应时间</th>
                  <th className={`px-2 py-3 text-center ${TABLE_DIVIDER_CLASS}`}>DNS/ms</th>
                  <th className={`px-2 py-3 text-center ${TABLE_DIVIDER_CLASS}`}>连接/ms</th>
                  <th className={`px-2 py-3 text-center ${TABLE_DIVIDER_CLASS}`}>重定向</th>
                  <th className={`px-3 py-3 text-center ${TABLE_DIVIDER_CLASS}`}>头部</th>
                  <th className={`px-3 py-3 text-center ${TABLE_DIVIDER_CLASS}`}>赞助商</th>
                </tr>
              </thead>
              <tbody>
                {visibleNodes.map((node) => {
                  const expanded = expandedHttpRows.includes(node.key);

                  return (
                      <Fragment key={node.key} >
                        <tr className="border-t border-zinc-100 align-middle hover:bg-zinc-50 dark:border-gray-700 dark:hover:bg-gray-800">
                          <td className={`px-3 text-xs py-3 ${TABLE_DIVIDER_CLASS}`}>
                            <NodeNameCell node={node} />
                          </td>
                        <td className={`wrap-break-word px-3 py-3 text-center text-zinc-700 dark:text-gray-200 ${TABLE_DIVIDER_CLASS}`}>
                          <CopyableIpCell ip={getProbeIp(node)} ipLocation={node.ipLocation} showActions={quickActions} value={getResponseAddress(node)} version={probeType.endsWith("_v6") ? "ipv6" : "ipv4"} />
                        </td>
                        <td className={`wrap-break-word px-3 py-3 text-center text-zinc-700 dark:text-gray-200 ${TABLE_DIVIDER_CLASS}`}>
                          {getIpLocation(node)}
                        </td>
                        <td className={`px-3 py-3 text-center font-semibold ${TABLE_DIVIDER_CLASS} ${getHTTPStatusClass(node)}`}>
                          {getHTTPStatusText(node)}
                        </td>
                        <td className={`px-3 py-3 text-center font-semibold ${TABLE_DIVIDER_CLASS} ${
                          !isResponded(node)
                            ? "text-zinc-400 dark:text-gray-500"
                            : isProbeSuccess(node)
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-red-600 dark:text-red-400"
                        }`}>
                          {getHTTPDurationText(node)}
                        </td>
                        <td className={`px-2 py-3 text-center text-zinc-700 dark:text-gray-200 ${TABLE_DIVIDER_CLASS}`}>
                          {getHTTPPhaseMs(node, "resolve")}
                        </td>
                        <td className={`px-2 py-3 text-center text-zinc-700 dark:text-gray-200 ${TABLE_DIVIDER_CLASS}`}>
                          {getHTTPPhaseMs(node, "connect")}
                        </td>
                          <td className={`px-2 py-3 text-center text-zinc-700 dark:text-gray-200 ${TABLE_DIVIDER_CLASS}`}>
                            {getRedirectCount(node)}
                          </td>
                        <td className={`px-3 py-3 text-center text-zinc-700 dark:text-gray-200 ${TABLE_DIVIDER_CLASS}`}>
                          <HTTPHeadersCell
                            expanded={expanded}
                            node={node}
                            onToggle={() => toggleHttpRow(node.key)}
                          />
                        </td>
                        <td className={`px-3 py-3 text-center text-zinc-700 dark:text-gray-200 ${TABLE_DIVIDER_CLASS}`}>
                          <SponsorCell text={node.sponsorText} url={node.sponsorUrl} />
                        </td>
                      </tr>
                      {expanded ? (
                        <tr
                          className="border-t border-zinc-200 bg-zinc-50 dark:border-gray-700 dark:bg-gray-950"
                          id={`http-details-${node.key}`}
                        >
                          <td className="px-5 py-4" colSpan={HTTP_TABLE_COLUMNS.length}>
                            <HttpProbeDetails node={node} />
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          ) : model === "persistent" ? (
            <table className="w-full table-fixed text-xs text-zinc-500 dark:text-gray-400">
              <colgroup>
                {tableColumns.map((width, index) => (
                  <col key={`${width}-${index}`} style={{ width }} />
                ))}
              </colgroup>
              <thead className={TABLE_HEADER_CLASS}>
                <tr>
                  <th className={`px-3 py-3 text-left ${TABLE_DIVIDER_CLASS}`}>节点名称</th>
                  <th className={`px-3 py-3 text-center ${TABLE_DIVIDER_CLASS}`}>
                    {isTcpingProbeType(probeType) ? "响应IP:端口" : "响应IP"}
                  </th>
                  <th className={`px-3 py-3 text-center ${TABLE_DIVIDER_CLASS}`}>IP归属地</th>
                  <th className={`px-1 py-3 text-center ${TABLE_DIVIDER_CLASS}`}>丢包</th>
                  <th className={`px-1 py-3 text-center ${TABLE_DIVIDER_CLASS}`}>发包</th>
                  <th className={`px-1 py-3 text-center ${TABLE_DIVIDER_CLASS}`}>最新</th>
                  <th className={`px-1 py-3 text-center ${TABLE_DIVIDER_CLASS}`}>最快</th>
                  <th className={`px-1 py-3 text-center ${TABLE_DIVIDER_CLASS}`}>最慢</th>
                  <th className={`px-1 py-3 text-center ${TABLE_DIVIDER_CLASS}`}>平均</th>
                  <th className={`px-3 py-3 text-center ${TABLE_DIVIDER_CLASS}`}>网络质量</th>
                  <th className={`px-3 py-3 text-center ${TABLE_DIVIDER_CLASS}`}>赞助商</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {visibleNodes.map((node) => (
                  <tr className="border-t border-zinc-100 align-middle hover:bg-zinc-50 dark:border-gray-700 dark:hover:bg-gray-800" key={node.key}>
                    <td className={`px-3 py-3 ${TABLE_DIVIDER_CLASS}`}>
                      <NodeNameCell node={node} />
                    </td>
                    <td className={`break-words px-3 py-3 text-center text-zinc-700 dark:text-gray-200 ${TABLE_DIVIDER_CLASS}`}>
                      <CopyableIpCell ip={getProbeIp(node)} ipLocation={node.ipLocation} showActions={quickActions} value={getResponseAddress(node)} version={probeType.endsWith("_v6") ? "ipv6" : "ipv4"} />
                    </td>
                    <td className={`break-words px-3 py-3 text-center text-zinc-700 dark:text-gray-200 ${TABLE_DIVIDER_CLASS}`}>
                      {getIpLocation(node)}
                    </td>
                    <td className={`px-1 py-3 text-center text-zinc-700 dark:text-gray-200 ${TABLE_DIVIDER_CLASS}`}>{getPacketLoss(node)}</td>
                    <td className={`px-1 py-3 text-center text-zinc-700 dark:text-gray-200 ${TABLE_DIVIDER_CLASS}`}>{node.dataValue.length}</td>
                    <td
                      className={`px-1 py-3 text-center font-medium ${TABLE_DIVIDER_CLASS} ${
                        isTimeout(node) ? "text-red-600 dark:text-red-400" : "text-zinc-700 dark:text-gray-200"
                      }`}
                    >
                      {getLatestValue(node)}
                    </td>
                    <td className={`px-1 py-3 text-center text-zinc-700 dark:text-gray-200 ${TABLE_DIVIDER_CLASS}`}>{getFastValue(node)}</td>
                    <td className={`px-1 py-3 text-center text-zinc-700 dark:text-gray-200 ${TABLE_DIVIDER_CLASS}`}>{getSlowValue(node)}</td>
                    <td className={`px-1 py-3 text-center text-zinc-700 dark:text-gray-200 ${TABLE_DIVIDER_CLASS}`}>{getAverageValue(node)}</td>
                    <td className={`px-3 py-3 ${TABLE_DIVIDER_CLASS}`}>
                      <PingQualityCanvas points={node.dataValue} />
                    </td>
                    <td className={`px-3 py-3 text-center text-zinc-700 dark:text-gray-200 ${TABLE_DIVIDER_CLASS}`}>
                      <SponsorCell text={node.sponsorText} url={node.sponsorUrl} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full table-fixed text-xs text-zinc-500 dark:text-gray-400">
              <colgroup>
                {tableColumns.map((width, index) => (
                  <col key={`${width}-${index}`} style={{ width }} />
                ))}
              </colgroup>
              <thead className={TABLE_HEADER_CLASS}>
                <tr>
                  <th className={`px-4 py-3 text-left ${TABLE_DIVIDER_CLASS}`}>节点名称</th>
                  <th className={`px-4 py-3 text-center ${TABLE_DIVIDER_CLASS}`}>
                    {isTcpingProbeType(probeType) ? "响应IP:端口" : "响应IP"}
                  </th>
                  <th className={`px-4 py-3 text-center ${TABLE_DIVIDER_CLASS}`}>IP归属地</th>
                  <th className={`px-4 py-3 text-center ${TABLE_DIVIDER_CLASS}`}>响应时间</th>
                  <th className={`px-4 py-3 text-center ${TABLE_DIVIDER_CLASS}`}>赞助商</th>
                </tr>
              </thead>
              <tbody>
                {visibleNodes.map((node) => (
                  <tr className="border-t border-zinc-100 align-middle hover:bg-zinc-50 dark:border-gray-700 dark:hover:bg-gray-800" key={node.key}>
                    <td className={`px-4 py-3 ${TABLE_DIVIDER_CLASS}`}>
                      <NodeNameCell node={node} />
                    </td>
                    <td className={`break-words px-4 py-3 text-center text-zinc-700 dark:text-gray-200 ${TABLE_DIVIDER_CLASS}`}>
                      <CopyableIpCell ip={getProbeIp(node)} ipLocation={node.ipLocation} showActions={quickActions} value={getResponseAddress(node)} version={probeType.endsWith("_v6") ? "ipv6" : "ipv4"} />
                    </td>
                    <td className={`break-words px-4 py-3 text-center text-zinc-700 dark:text-gray-200 ${TABLE_DIVIDER_CLASS}`}>
                      {getIpLocation(node)}
                    </td>
                    <td
                      className={`px-4 py-3 text-center font-semibold ${TABLE_DIVIDER_CLASS} ${
                        !isResponded(node)
                          ? "text-zinc-400 dark:text-gray-500"
                          : isProbeSuccess(node)
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {getDisplayTime(node)}
                    </td>
                    <td className={`px-4 py-3 text-center text-zinc-700 dark:text-gray-200 ${TABLE_DIVIDER_CLASS}`}>
                      <SponsorCell text={node.sponsorText} url={node.sponsorUrl} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {!visibleNodes.length ? (
          <div className="px-4 py-10 text-center text-sm text-zinc-400 dark:text-gray-500">暂无节点数据</div>
        ) : null}
      </div>
    </section>
  );
}

export default function PingClient({
  activePath,
  apiPath,
  clearPath,
  dnsOptionsEnabled = false,
  httpOptionsEnabled = false,
  firstNodesApiPath = "/api/ping/nodes/first",
  initialError,
  initialUrl,
  layoutConfig,
  placeholder,
  probeLabel,
  probeType,
  secondaryActionLabel = "持续测试",
  secondaryActionModel = "persistent",
  screenshotSuffix,
  screenNodesApiPath = "/api/ping/nodes/screen",
}: PingClientProps) {
  const [url, setUrl] = useState(initialUrl);
  const [history, setHistory] = useState<string[]>(getStoredProbeHistory);
  const [nodes, setNodes] = useState<PingNodeResult[]>([]);
  const [selectedOperators, setSelectedOperators] = useState<string[]>([...OPERATOR_OPTIONS]);
  const [useCustomDns, setUseCustomDns] = useState(false);
  const [dns, setDns] = useState("");
  const [dnsQueryType, setDnsQueryType] = useState<DnsQueryType>("A");
  const [submittedDns, setSubmittedDns] = useState("");
  const [submittedDnsQueryType, setSubmittedDnsQueryType] = useState<DnsQueryType>("A");
  const [submittedTarget, setSubmittedTarget] = useState(initialUrl);
  const [model, setModel] = useState<ProbeModel>("");
  const [httpOptions, setHttpOptions] = useState<HttpProbeOptions>(createDefaultHttpOptions);
  const [activeFilter, setActiveFilter] = useState<ResultFilter>(DEFAULT_FILTER);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [status, setStatus] = useState<WsStatus>("idle");
  const [error, setError] = useState(getInitialErrorMessage(initialError, probeLabel));
  const [notice, setNotice] = useState("");
  const [isSnapshotting, setIsSnapshotting] = useState(false);
  const toolPreference = useToolPreference(probeType as AccountToolKey);
  const preferenceAppliedRef = useRef(false);
  const socketRef = useRef<WebSocket | null>(null);
  const runIdRef = useRef(0);
  const currentModelRef = useRef<ProbeModel>("");

  useEffect(() => {
    if (!toolPreference || preferenceAppliedRef.current) return;
    preferenceAppliedRef.current = true;
    setSelectedOperators(toolPreference.operators);
    setUseCustomDns(toolPreference.dnsMode === "custom");
    setDns(toolPreference.dnsMode === "custom" ? toolPreference.customDns : "");
  }, [toolPreference]);

  const isBusy = status === "submitting" || status === "connecting";
  const respondedCount = useMemo(() => getRespondedCount(nodes), [nodes]);
  const ipStats = useMemo(() => getIpStats(nodes), [nodes]);

  const closeSocket = useCallback(() => {
    socketRef.current?.close();
    socketRef.current = null;
  }, []);

  const connectWebSocket = useCallback(
    (nextAccessKey: string, runId: number) => {
      closeSocket();
      setStatus("connecting");
      setError("");
      setNotice("");

      const wsUrl = `${PING_WS_BASE_URL.replace(/\/$/, "")}/${encodeURIComponent(nextAccessKey)}`;
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.addEventListener("open", () => {
        if (runIdRef.current !== runId) {
          socket.close();
          return;
        }

        setStatus("running");
        socket.send("start");
      });

      socket.addEventListener("message", (event) => {
        if (runIdRef.current !== runId) {
          return;
        }

        const parsedMessage = parseJsonMessage(String(event.data));
        if (isBackendErrorMessage(parsedMessage)) {
          setError(getMessage(parsedMessage) || "任务不存在或已过期");
          setStatus("error");
          return;
        }

        if (parsedMessage && typeof parsedMessage === "object") {
          setNodes((currentNodes) =>
            mergeNodeMessage(currentNodes, parsedMessage as PingNodeMessage),
          );
        }
      });

      socket.addEventListener("error", () => {
        if (runIdRef.current !== runId) {
          return;
        }

        setError("WebSocket 连接失败，请确认后端服务已启动。");
        setStatus("error");
      });

      socket.addEventListener("close", () => {
        if (socketRef.current === socket) {
          socketRef.current = null;
        }

        if (runIdRef.current !== runId) {
          return;
        }

        setStatus((currentStatus) =>
          currentStatus === "completed" || currentStatus === "error"
            ? currentStatus
            : "closed",
        );
      });
    },
    [closeSocket],
  );

  useEffect(() => {
    let ignore = false;

    async function loadFirstNodes() {
      setStatus("loading");
      try {
        const response = await fetch(firstNodesApiPath, {
          cache: "no-store",
        });
        const data = await readPingData<PingNode[]>(response);
        if (!ignore) {
          setNodes(toResultNodes(data ?? []));
          setStatus("idle");
        }
      } catch (loadError) {
        if (!ignore) {
          setError(
            loadError instanceof Error && loadError.message
              ? loadError.message
              : "节点列表加载失败。",
          );
          setStatus("error");
        }
      }
    }

    loadFirstNodes();

    return () => {
      ignore = true;
      runIdRef.current += 1;
      closeSocket();
    };
  }, [closeSocket, firstNodesApiPath]);

  useEffect(() => {
    if (status !== "running" || nodes.length === 0) {
      return;
    }
    const completed = currentModelRef.current === "persistent"
      ? nodes.every((node) => node.finalResult)
      : respondedCount >= nodes.length;
    if (completed) {
      setStatus("completed");
    }
  }, [nodes, respondedCount, status]);

  async function loadScreenNodes(operators: string[]) {
    const response = await fetch(screenNodesApiPath, {
      body: JSON.stringify({
        operators,
        region: [...DEFAULT_REGIONS],
      }),
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const data = await readPingData<PingNode[]>(response);
    const resultNodes = toResultNodes(data ?? []);

    if (!resultNodes.length) {
      throw new Error("当前没有可用的在线节点，请稍后重试。");
    }

    setNodes(resultNodes);
    return resultNodes;
  }

  async function submitPing(nextModel: ProbeModel) {
    const nextUrl = normalizeProbeTarget(url);
    const operators = selectedOperators.length ? selectedOperators : [];

    if (!nextUrl) {
      setError(`请输入要 ${probeLabel} 的域名或 IP。`);
      setStatus("error");
      return;
    }

    if (!operators.length) {
      setError("请至少选择一个运营商。");
      setStatus("error");
      return;
    }

    if (useCustomDns && !dns.trim()) {
      setError("请输入完整的 DNS 地址。");
      setStatus("error");
      return;
    }

    runIdRef.current += 1;
    const runId = runIdRef.current;
    closeSocket();
    currentModelRef.current = nextModel;
    setModel(nextModel);
    setSubmittedDns(useCustomDns ? dns.trim() : "");
    setSubmittedDnsQueryType(dnsQueryType);
    setSubmittedTarget(nextUrl);
    setHasSubmitted(true);
    setStatus("submitting");
    setError("");
    setNotice("");
    setActiveFilter(DEFAULT_FILTER);
    setNodes([]);
    window.history.replaceState(null, "", buildProbeSharePath(clearPath, nextUrl));

    try {
      await loadScreenNodes(operators);
      const submissionUrl =
        isTcpingProbeType(probeType) ? ensureProbeTargetPort(nextUrl, 80) : nextUrl;

      const requestBody: Record<string, unknown> = {
          dns: useCustomDns ? dns.trim() : null,
          model: nextModel,
          operators,
          region: [...DEFAULT_REGIONS],
          url: submissionUrl,
      };

      if (isHttpProbeType(probeType)) {
        requestBody.http = toHttpOptionsPayload(httpOptions);
      }
      if (probeType === "dns") {
        requestBody.dnsQueryType = dnsQueryType;
      }

      const response = await fetch(apiPath, {
        body: JSON.stringify(requestBody),
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const body = (await response.json().catch(() => null)) as SubmitPingResponse | null;

      if (!response.ok) {
        throw new Error(
          getResponseError(body, `任务提交失败，状态码 ${response.status}。`),
        );
      }

      const code = typeof body?.code === "string" ? Number(body.code) : body?.code;
      if (typeof code === "number" && code !== 200) {
        throw new Error(getResponseError(body, `任务提交失败，状态码 ${code}。`));
      }

      const nextAccessKey = body ? getAccessKey(body) : "";
      if (!nextAccessKey) {
        throw new Error("后端响应中没有任务 UUID。");
      }

      setUrl(nextUrl);
      connectWebSocket(nextAccessKey, runId);
    } catch (submitError) {
      const message =
        submitError instanceof Error && submitError.message
          ? submitError.message
          : "后端接口请求失败，请稍后重试。";

      setError(message);
      setStatus("error");
    }
  }

  async function handleSnapshot() {
    const target = normalizeProbeTarget(url) || probeType;
    setIsSnapshotting(true);
    setNotice("正在生成完整截图...");

    try {
      const dataUrl = await toPng(document.body, { quality: 1, pixelRatio: 1 });
      const link = document.createElement("a");
      link.download = `${target}_${screenshotSuffix}_ping测速网.png`;
      link.href = dataUrl;
      link.click();
      setNotice("完整截图已生成。");
    } catch {
      setError("截图失败，请稍后重试。");
      setNotice("");
    } finally {
      setIsSnapshotting(false);
    }
  }

  return (
    <PingShell activePath={activePath} layoutConfig={layoutConfig}>
      <PingToast
        message={error ? getPublicErrorMessage(error) : notice}
        onClose={() => {
          setError("");
          setNotice("");
        }}
        variant={error ? "error" : "success"}
      />
      <div className="w-full min-w-[1280px]">
        <section className="mx-auto w-full max-w-7xl px-4 py-6">
          <div className="w-full rounded-lg border border-zinc-200 bg-white px-6 py-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <PingProbeControls
              clearPath={clearPath}
              dns={dns}
              enterAction={toolPreference?.enterAction}
              history={history}
              historyMode={toolPreference?.historyMode}
              isBusy={isBusy}
              isSnapshotting={isSnapshotting}
              onDnsChange={setDns}
              onHistoryChange={setHistory}
              onOperatorsChange={setSelectedOperators}
              onPersistent={() => void submitPing(secondaryActionModel)}
              onSnapshot={() => void handleSnapshot()}
              onStart={() => void submitPing("")}
              onUrlChange={setUrl}
              onUseCustomDnsChange={setUseCustomDns}
              placeholder={placeholder}
              secondaryActionLabel={secondaryActionLabel}
              showSecondaryAction={!dnsOptionsEnabled}
              selectedOperators={selectedOperators}
              trailingControl={dnsOptionsEnabled ? (
                <PingDnsQueryTypeSelect
                  disabled={isBusy || isSnapshotting}
                  onChange={setDnsQueryType}
                  value={dnsQueryType}
                />
              ) : undefined}
              url={url}
              useCustomDns={useCustomDns}
            />
          </div>
        </section>
        {httpOptionsEnabled ? (
            <PingHttpOptions
                disabled={isBusy || isSnapshotting}
                onChange={setHttpOptions}
                value={httpOptions}
            />
        ) : null}
        <PingCenterAds ads={layoutConfig?.adLinks} />



        <div className="space-y-5">
          <ProgressPanel
            activeFilter={activeFilter}
            defaultArea={toolPreference?.regionSummary ?? "china"}
            hasSubmitted={hasSubmitted}
            model={model}
            nodes={nodes}
            onSelectFilter={setActiveFilter}
            probeType={probeType}
            showDownMarkers={toolPreference?.mapTimeoutMarker ?? true}
          />
          {probeType !== "dns" || submittedDnsQueryType === "A" || submittedDnsQueryType === "AAAA" ? (
            <IpStatsPanel
              activeFilter={activeFilter}
              defaultExpanded={probeType === "dns" ? (toolPreference?.dnsStatsExpanded ?? true) : false}
              model={model}
              onSelectFilter={setActiveFilter}
              probeType={probeType}
              stats={ipStats}
            />
          ) : null}
          <ResultTable
            activeFilter={activeFilter}
            dnsQueryType={submittedDnsQueryType}
            dnsServer={submittedDns}
            model={model}
            nodes={nodes}
            onSelectFilter={setActiveFilter}
            probeType={probeType}
            quickActions={toolPreference?.quickActions ?? true}
            target={submittedTarget}
          />
        </div>
      </div>
    </PingShell>
  );
}
