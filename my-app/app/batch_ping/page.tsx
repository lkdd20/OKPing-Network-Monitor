import type { Metadata } from "next";

import { BatchProbeClient } from "@/components/ping/BatchProbeClient";
import { requirePublicPageEnabled } from "@/lib/ping/pageAvailability";
import { fetchPublicLayoutConfig, fetchPublicPageConfig } from "@/lib/ping/server";
import type { PingPublicPageConfig } from "@/lib/ping/types";

const FALLBACK: PingPublicPageConfig = {
  canonicalPath: "/batch_ping",
  description: "Ping 批量 Ping 支持域名、IPv4、IP 范围与 CIDR 多节点并行检测。",
  h1: "批量 Ping",
  intro: "Ping 批量 Ping",
  keywords: "Ping,批量Ping,IP批量检测,CIDR检测",
  pageKey: "batch_ping",
  pageName: "批量 Ping",
  title: "批量 Ping - Ping",
};

async function getPageConfig() {
  let pageConfig: PingPublicPageConfig;
  try {
    pageConfig = await fetchPublicPageConfig("batch_ping", "", "/batch_ping");
  } catch {
    return FALLBACK;
  }

  return requirePublicPageEnabled(pageConfig);
}

async function getLayoutConfig() {
  try {
    return await fetchPublicLayoutConfig("default");
  } catch {
    return undefined;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const config = await getPageConfig();
  return {
    alternates: { canonical: config.canonicalPath || FALLBACK.canonicalPath },
    description: config.description || FALLBACK.description,
    keywords: (config.keywords || FALLBACK.keywords)?.split(",").map((item) => item.trim()).filter(Boolean),
    title: config.title || FALLBACK.title,
  };
}

export default async function BatchPingPage() {
  const [, layoutConfig] = await Promise.all([
    getPageConfig(),
    getLayoutConfig(),
  ]);
  return (
    <BatchProbeClient
      activePath="/batch_ping"
      apiPath="/api/batch_ping"
      layoutConfig={layoutConfig}
      mode="ping"
    />
  );
}
