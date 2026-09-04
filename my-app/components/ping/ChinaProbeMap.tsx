"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as echarts from "echarts";

import chinaGeoJson from "@/lib/ping/china.json";
import {
  getProbeDurationMs,
  isProbeSuccess,
} from "@/lib/ping/result";
import type { ProbeType, PingNodeResult } from "@/lib/ping/types";
import { isHttpProbeType } from "@/lib/ping/probeType";

type GeoFeature = {
  properties: {
    cp?: number[];
    name: string;
  };
};

type ChinaGeoJson = {
  features: GeoFeature[];
};

type ProvinceMetric = {
  done: number;
  fastest: number | null;
  success: number;
  timeout: number;
  total: number;
  value: number | null;
};

type MapDatum = {
  itemStyle?: {
    areaColor?: string;
    borderColor?: string;
    borderWidth?: number;
  };
  name: string;
  value?: number;
};

type EchartsClickParams = {
  componentType?: string;
  name?: unknown;
};

type TooltipParams = {
  name?: unknown;
  seriesType?: unknown;
};

const GEO = chinaGeoJson as ChinaGeoJson;
const CHINA_MAP_NAME = "ping-china";
const MAP_LOGO_WIDTH =40;
const MAP_DOWN_SYMBOL = "⚡";
const MAP_INITIAL_AREA_COLOR = "#22c55e";
const HTTP_TIMEOUT_VALUE = 1_000_000_000;
const PROBE_TIMEOUT_VALUE = 2000;
let chinaMapRegistered = false;

function registerChinaMap() {
  if (chinaMapRegistered) {
    return;
  }

  echarts.registerMap(
    CHINA_MAP_NAME,
    chinaGeoJson as unknown as Parameters<typeof echarts.registerMap>[1],
  );
  chinaMapRegistered = true;
}

function normalizeProvince(value?: string | null) {
  return (value || "")
    .replace(/省|市|维吾尔自治区|回族自治区|壮族自治区|自治区|特别行政区/g, "")
    .replace("内蒙古", "内蒙古")
    .replace("黑龙江", "黑龙江");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function operatorWeight(node: PingNodeResult) {
  const homeWeight = node.homeState ? -10.1 : 0;
  switch (node.operators) {
    case "多线":
      return homeWeight;
    case "电信":
      return homeWeight + 1;
    case "移动":
      return homeWeight + 2;
    case "联通":
      return homeWeight + 3;
    case "港澳台、海外":
      return homeWeight + 4;
    default:
      return homeWeight + 5;
  }
}

function operatorBadgeHtml(operator?: string | null) {
  const label = operator === "港澳台、海外" ? "海外" : operator || "未知";
  const color =
    operator === "电信"
      ? "#9bd56e"
      : operator === "移动"
        ? "#7fb7ff"
        : operator === "联通"
          ? "#ffba49"
          : operator === "多线"
            ? "#d8a7ff"
            : "#d1d5db";

  return `<span style="color:${color};font-weight:800;">[${escapeHtml(label)}]</span>`;
}

function homeBadgeHtml(homeState?: boolean) {
  if (!homeState) {
    return "";
  }

  return `<span style="display:inline-block;margin-left:4px;border-radius:4px;background:#818cf8;color:#fff;font-size:11px;font-weight:600;line-height:16px;padding:0 6px;">家庭</span>`;
}

function getNodeValue(node: PingNodeResult, probeType: ProbeType) {
  if (!node.dataValue.length) {
    return null;
  }
  if (!isProbeSuccess(node)) {
    return isHttpProbeType(probeType) ? HTTP_TIMEOUT_VALUE : PROBE_TIMEOUT_VALUE;
  }

  return getProbeDurationMs(node);
}

function isDownNode(node: PingNodeResult) {
  return node.dataValue.length > 0 && !isProbeSuccess(node);
}

function isSuccessNode(node: PingNodeResult) {
  return node.dataValue.length > 0 && isProbeSuccess(node);
}

function buildMetrics(nodes: PingNodeResult[], probeType: ProbeType) {
  const metrics = new Map<string, ProvinceMetric>();

  nodes.forEach((node) => {
    const province = normalizeProvince(node.province);
    if (!province || node.operators === "港澳台、海外") {
      return;
    }

    const metric = metrics.get(province) ?? {
      done: 0,
      fastest: null,
      success: 0,
      timeout: 0,
      total: 0,
      value: null,
    };
    metric.total += 1;

    const value = getNodeValue(node, probeType);
    if (value !== null) {
      metric.done += 1;
      if (isProbeSuccess(node)) {
        metric.success += 1;
        metric.fastest = metric.fastest === null ? value : Math.min(metric.fastest, value);
        metric.value = metric.value === null ? value : Math.min(metric.value, value);
      } else {
        metric.timeout += 1;
      }
    }

    metrics.set(province, metric);
  });

  metrics.forEach((metric) => {
    if (metric.total > 0 && metric.timeout === metric.total) {
      metric.value = isHttpProbeType(probeType) ? HTTP_TIMEOUT_VALUE : PROBE_TIMEOUT_VALUE;
    }
  });

  return metrics;
}

function buildMapData(
  nodes: PingNodeResult[],
  neutralAreaColor: string,
  probeType: ProbeType,
  activeProvince?: string,
  hasSubmitted = true,
) {
  const active = normalizeProvince(activeProvince);

  if (!hasSubmitted) {
    return GEO.features.map<MapDatum>((feature) => {
      const province = normalizeProvince(feature.properties.name);
      const selected = Boolean(active && active === province);

      return {
        itemStyle: selected
          ? {
              borderColor: "#2563eb",
              borderWidth: 2.5,
            }
          : undefined,
        name: feature.properties.name,
      };
    });
  }

  const metrics = buildMetrics(nodes, probeType);

  return GEO.features.map<MapDatum>((feature) => {
    const province = normalizeProvince(feature.properties.name);
    const metric = metrics.get(province);
    const selected = Boolean(active && active === province);
    const hasResultColor = metric?.value !== null && metric?.value !== undefined;

    return {
      itemStyle: {
        ...(!hasResultColor ? { areaColor: neutralAreaColor } : {}),
        ...(selected ? { borderColor: "#2563eb", borderWidth: 2.5 } : {}),
      },
      name: feature.properties.name,
      value: metric?.value ?? undefined,
    };
  });
}

function buildDownMarkers(nodes: PingNodeResult[], probeType: ProbeType) {
  const metrics = buildMetrics(nodes, probeType);

  return GEO.features
    .map((feature) => {
      const province = normalizeProvince(feature.properties.name);
      const metric = metrics.get(province);
      const center = feature.properties.cp;

      if (!center || center.length < 2 || !metric?.timeout) {
        return null;
      }

      return {
        name: feature.properties.name,
        value: [center[0], center[1], metric.timeout],
      };
    })
    .filter((item): item is { name: string; value: [number, number, number] } => Boolean(item));
}

function getFastestNode(nodes: PingNodeResult[]) {
  return nodes
    .filter(isSuccessNode)
    .sort((left, right) => getProbeDurationMs(left) - getProbeDurationMs(right))[0];
}

function getNodeResponseText(node: PingNodeResult) {
  if (isSuccessNode(node)) {
    return `${getProbeDurationMs(node)}ms`;
  }

  if (isDownNode(node)) {
    return node.error || "响应超时";
  }

  return "等待中";
}

function buildTooltip(name: string, nodes: PingNodeResult[]) {
  const province = normalizeProvince(name);
  const provinceNodes = nodes
    .filter((node) => normalizeProvince(node.province) === province)
    .sort((left, right) => operatorWeight(left) - operatorWeight(right));
  const displayName = province || name;
  const hasDown = provinceNodes.some(isDownNode);

  const cardStart = `<div style="width:260px;border-radius:4px;overflow:hidden;box-shadow:0 10px 18px rgba(0,0,0,.32);font-family:Arial,'Microsoft YaHei',sans-serif;"><div style="background:#3b82f6;color:#fff;text-align:center;font-size:17px;font-weight:800;line-height:42px;">${escapeHtml(displayName)}${hasDown ? `<span style="margin-left:8px;color:#ff4d4f;">${MAP_DOWN_SYMBOL}</span>` : ""}</div><div style="background:rgba(31,41,35,.9);padding:14px 18px 16px;color:#f8fafc;font-size:14px;font-weight:700;line-height:1.55;">`;
  const cardEnd = `<div style="margin-top:12px;text-align:center;color:#f59e0b;font-size:13px;font-weight:800;">--- 点击可筛选数据 ---</div></div></div>`;

  if (!provinceNodes.length) {
    return `${cardStart}<div>当前无节点</div>${cardEnd}`;
  }

  const fastest = getFastestNode(provinceNodes);
  const fastestText = fastest ? `${getProbeDurationMs(fastest)}ms` : "暂无成功响应";
  const rows = provinceNodes
    .map((node) => {
      const stateText = getNodeResponseText(node);
      const stateColor = isSuccessNode(node) ? "#f8fafc" : isDownNode(node) ? "#ff5b5b" : "#d1d5db";

      return `<div style="display:flex;align-items:center;gap:4px;margin-top:7px;white-space:nowrap;">${operatorBadgeHtml(node.operators)}<span>${escapeHtml(node.name || "未知节点")}：</span><span style="color:${stateColor};font-weight:800;">${escapeHtml(String(stateText))}</span>${homeBadgeHtml(node.homeState)}</div>`;
    })
    .join("");

  return `${cardStart}<div>最快响应： <span style="font-size:17px;">${escapeHtml(fastestText)}</span></div>${rows}${cardEnd}`;
}

function buildChartOption({
  activeProvince,
  isDark,
  hasSubmitted,
  nodes,
  probeType,
  showDownMarkers,
}: {
  activeProvince?: string;
  isDark: boolean;
  hasSubmitted: boolean;
  nodes: PingNodeResult[];
  probeType: ProbeType;
  showDownMarkers: boolean;
}): echarts.EChartsOption {
  const neutralAreaColor = isDark ? "#374151" : "#d4d4d8";
  const baseAreaColor = hasSubmitted ? neutralAreaColor : MAP_INITIAL_AREA_COLOR;
  const series: echarts.EChartsOption["series"] = [
    {
      data: buildMapData(nodes, neutralAreaColor, probeType, activeProvince, hasSubmitted),
      geoIndex: 0,
      itemStyle: {
        areaColor: baseAreaColor,
      },
      map: CHINA_MAP_NAME,
      name: "响应时间",
      type: "map",
    },
  ];

  if (showDownMarkers) {
    series.push({
      coordinateSystem: "geo",
      data: buildDownMarkers(nodes, probeType),
      label: {
        color: "#ff3b30",
        fontSize: 18,
        fontWeight: 900,
        formatter: MAP_DOWN_SYMBOL,
        show: true,
      },
      name: "异常节点",
      silent: true,
      symbolSize: 1,
      tooltip: {
        show: false,
      },
      type: "scatter",
      z: 8,
    });
  }

  return {
    backgroundColor: "transparent",
    graphic: {
      elements: [
        {
          left: "2%",
          style: {
            image: "/logo_t.png",
            opacity: isDark ? 0.72 : 0.92,
            width: MAP_LOGO_WIDTH,
          },
          top: "1%",
          type: "image",
        },
      ],
    },
    geo: {
      bottom: "7%",
      emphasis: {
        itemStyle: {
          areaColor: isDark ? "#facc15" : "#f8e83b",
        },
        label: {
          show: true,
          color: isDark ? "#f8fafc" : "#111827",
          fontSize: 14,
          fontWeight: 700,
        },
      },
      itemStyle: {
        areaColor: baseAreaColor,
        borderColor: isDark ? "#d1d5db" : "#ffffff",
        borderWidth: 1,
      },
      left: "4%",
      map: CHINA_MAP_NAME,
      right: "4%",
      top: "5%",
    },
    series,
    tooltip: {
      backgroundColor: "transparent",
      borderWidth: 0,
      confine: true,
      formatter: (params) => {
        const item = Array.isArray(params) ? params[0] : (params as TooltipParams);
        if (item?.seriesType !== "map") {
          return "";
        }

        return buildTooltip(String(item?.name ?? ""), nodes);
      },
      padding: 0,
      textStyle: {
        color: "#f8fafc",
        fontSize: 14,
      },
      trigger: "item",
      triggerOn: "mousemove",
    },
    visualMap: {
      show: hasSubmitted,
      bottom: 8,
      itemHeight: 10,
      itemWidth: 14,
      left: 8,
      outOfRange: {
        color: [neutralAreaColor],
      },
      pieces:
        isHttpProbeType(probeType)
          ? [
              { color: "#ef1010", gte: HTTP_TIMEOUT_VALUE, label: "超时" },
              { color: "#fb982f", gt: 10000, label: ">10s", lte: HTTP_TIMEOUT_VALUE - 1 },
              { color: "#f6ed44", gt: 3000, label: "3-10s", lte: 10000 },
              { color: "#b7f35a", gt: 1000, label: "1-3s", lte: 3000 },
              { color: "#3bd83a", gt: 500, label: "0.5-1s", lte: 1000 },
              { color: "#20b31d", gte: 0, label: "<=0.5s", lte: 500 },
            ]
          : [
              { color: "#ef1010", gte: 2000, label: "超时", lte: 500000 },
              { color: "#fb982f", gte: 251, label: ">250ms", lte: 1999 },
              { color: "#f6ed44", gte: 201, label: "201-250ms", lte: 250 },
              { color: "#b7f35a", gte: 101, label: "101-200ms", lte: 200 },
              { color: "#3bd83a", gte: 51, label: "51-100ms", lte: 100 },
              { color: "#20b31d", gte: 0, label: "<=50ms", lte: 50 },
            ],
      textStyle: {
        color: isDark ? "#d1d5db" : "#666666",
      },
      type: "piecewise",
    },
  };
}

export function ChinaProbeMap({
  activeProvince,
  defaultShowDownMarkers = true,
  hasSubmitted,
  nodes,
  onSelectProvince,
  probeType,
}: {
  activeProvince?: string;
  defaultShowDownMarkers?: boolean;
  hasSubmitted: boolean;
  nodes: PingNodeResult[];
  onSelectProvince: (province: string) => void;
  probeType: ProbeType;
}) {
  const chartRef = useRef<echarts.ECharts | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onSelectRef = useRef(onSelectProvince);
  const [isDark, setIsDark] = useState(false);
  const [showDownMarkers, setShowDownMarkers] = useState(defaultShowDownMarkers);
  const option = useMemo(
    () => buildChartOption({ activeProvince, hasSubmitted, isDark, nodes, probeType, showDownMarkers }),
    [activeProvince, hasSubmitted, isDark, nodes, probeType, showDownMarkers],
  );

  useEffect(() => {
    onSelectRef.current = onSelectProvince;
  }, [onSelectProvince]);

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributeFilter: ["class"],
      attributes: true,
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    registerChinaMap();
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const chart = echarts.init(container);
    chartRef.current = chart;
    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(container);
    const handleClick = (params: EchartsClickParams) => {
      if (params.componentType === "series" && typeof params.name === "string") {
        onSelectRef.current(params.name);
      }
    };
    chart.on("click", handleClick);

    return () => {
      resizeObserver.disconnect();
      chart.off("click", handleClick);
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    chartRef.current?.setOption(option, true);
  }, [option]);

  return (
    <div className="relative flex h-[550px] min-w-0 flex-col rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <button
        aria-label={showDownMarkers ? "关闭异常节点标记" : "显示异常节点标记"}
        className={`absolute right-4 top-4 z-10 inline-flex h-8 items-center gap-2 rounded-full border px-3 text-sm font-semibold shadow-sm transition ${
          showDownMarkers
            ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100 dark:border-red-900/70 dark:bg-red-950/50 dark:text-red-300 dark:hover:bg-red-900/60"
            : "border-zinc-200 bg-white text-zinc-400 hover:bg-zinc-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-gray-700"
        }`}
        onClick={() => setShowDownMarkers((current) => !current)}
        title={showDownMarkers ? "关闭异常节点标记" : "显示异常节点标记"}
        type="button"
      >
        <span aria-hidden="true">{MAP_DOWN_SYMBOL}</span>
        <span className="h-3.5 w-3.5 rounded-full bg-current opacity-80" />
      </button>
      <div ref={containerRef} className="min-h-0 w-full flex-1" />
    </div>
  );
}
