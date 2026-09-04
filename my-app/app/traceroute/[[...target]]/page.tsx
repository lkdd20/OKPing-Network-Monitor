import type { Metadata } from "next";

import { TracerouteClient } from "@/components/ping/TracerouteClient";
import { requirePublicPageEnabled } from "@/lib/ping/pageAvailability";
import { fetchPublicLayoutConfig, fetchPublicPageConfig } from "@/lib/ping/server";
import type { PingPublicPageConfig } from "@/lib/ping/types";

type TraceroutePageProps = {
  params: Promise<{ target?: string[] }>;
  searchParams: Promise<{
    error?: string | string[];
    url?: string | string[];
  }>;
};

function stringParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function pathTarget(segments?: string[]) {
  return segments?.length ? segments.map((segment) => decodeURIComponent(segment)).join("/") : "";
}

function canonicalPath(target: string) {
  return target ? `/traceroute?url=${encodeURIComponent(target)}` : "/traceroute";
}

function fallbackPageConfig(target: string): PingPublicPageConfig {
  const displayTarget = target || "目标地址";
  return {
    canonicalPath: canonicalPath(target),
    description: `Ping 为 ${displayTarget} 提供在线路由追踪，使用多跳延迟、丢包率和抖动数据定位网络路径异常。`,
    h1: `${displayTarget} 路由追踪`,
    intro: `当前追踪目标：${displayTarget}。`,
    keywords: `Ping,路由追踪,MTR,Traceroute,${target},网络路径,丢包率`,
    pageKey: "traceroute",
    pageName: "路由追踪",
    target,
    title: `${displayTarget} 路由追踪 - Ping`,
  };
}

async function pageConfig(target: string) {
  let config: PingPublicPageConfig;
  try {
    config = await fetchPublicPageConfig("traceroute", target, canonicalPath(target));
  } catch {
    return fallbackPageConfig(target);
  }

  const enabledConfig = requirePublicPageEnabled(config);
  return enabledConfig.title === "Ping" ? fallbackPageConfig(target) : enabledConfig;
}

async function layoutConfig() {
  try {
    return await fetchPublicLayoutConfig("default");
  } catch {
    return undefined;
  }
}

export async function generateMetadata({ params, searchParams }: TraceroutePageProps): Promise<Metadata> {
  const routeParams = await params;
  const query = await searchParams;
  const target = stringParam(query.url)?.trim() || pathTarget(routeParams.target);
  const config = await pageConfig(target);
  return {
    alternates: { canonical: config.canonicalPath || canonicalPath(target) },
    description: config.description || fallbackPageConfig(target).description,
    keywords: config.keywords?.split(",").map((item) => item.trim()).filter(Boolean),
    title: config.title || fallbackPageConfig(target).title,
  };
}

export default async function TraceroutePage({ params, searchParams }: TraceroutePageProps) {
  const routeParams = await params;
  const query = await searchParams;
  const initialTarget = stringParam(query.url)?.trim() || pathTarget(routeParams.target);
  const [, layout] = await Promise.all([
    pageConfig(initialTarget),
    layoutConfig(),
  ]);

  return (
    <TracerouteClient
      initialError={stringParam(query.error)}
      initialTarget={initialTarget}
      layoutConfig={layout}
    />
  );
}
