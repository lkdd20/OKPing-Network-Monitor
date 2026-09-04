import type { Metadata } from "next";

import { BatchProbeClient } from "@/components/ping/BatchProbeClient";
import { requirePublicPageEnabled } from "@/lib/ping/pageAvailability";
import { fetchPublicLayoutConfig, fetchPublicPageConfig } from "@/lib/ping/server";
import type { PingPublicPageConfig } from "@/lib/ping/types";

const FALLBACK: PingPublicPageConfig = {
  canonicalPath: "/batch_tcping",
  description: "Ping 批量 TCPing 支持域名、IPv4、IP 范围与 CIDR 多节点端口连通性检测。",
  h1: "批量 TCPing",
  intro: "Ping 批量 TCPing",
  keywords: "Ping,批量TCPing,端口批量检测,CIDR检测",
  pageKey: "batch_tcping",
  pageName: "批量 TCPing",
  title: "批量 TCPing - Ping",
};

async function getPageConfig() {
  let pageConfig: PingPublicPageConfig;
  try {
    pageConfig = await fetchPublicPageConfig("batch_tcping", "", "/batch_tcping");
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

export default async function BatchTcpingPage() {
  const [, layoutConfig] = await Promise.all([
    getPageConfig(),
    getLayoutConfig(),
  ]);
  return (
    <BatchProbeClient
      activePath="/batch_tcping"
      apiPath="/api/batch_tcping"
      layoutConfig={layoutConfig}
      mode="tcping"
    />
  );
}
