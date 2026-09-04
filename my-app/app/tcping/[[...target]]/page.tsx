import type { Metadata } from "next";

import { requirePublicPageEnabled } from "@/lib/ping/pageAvailability";
import { fetchPublicLayoutConfig, fetchPublicPageConfig } from "@/lib/ping/server";
import { buildProbeSharePath, probeTargetFromPathSegments } from "@/lib/ping/target";
import type { PingPublicPageConfig } from "@/lib/ping/types";

import PingClient from "@/app/ping/[[...target]]/PingClient";

type TcpingPageProps = {
  params: Promise<{
    target?: string[];
  }>;
  searchParams: Promise<{
    error?: string | string[];
    url?: string | string[];
  }>;
};

function getStringParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getCanonicalPath(initialUrl: string) {
  return buildProbeSharePath("/tcping", initialUrl);
}

function fallbackPageConfig(initialUrl: string): PingPublicPageConfig {
  const displayTarget = initialUrl || "目标地址";

  return {
    canonicalPath: getCanonicalPath(initialUrl),
    description: `Ping 为 ${displayTarget} 提供未登录用户在线 TCPing 检测，支持多地区、多运营商节点实时返回响应 IP、地区与延迟。`,
    h1: `${displayTarget} 在线 TCPing 检测`,
    intro: `当前检测目标：${displayTarget}。页面参数由服务端渲染输出，便于搜索引擎解析当前检测内容。`,
    keywords: `Ping,在线TCPing,${initialUrl},网络检测,端口检测,延迟检测`,
    pageKey: "tcping",
    pageName: "在线 TCPing",
    target: initialUrl,
    title: `${displayTarget} 在线 TCPing 检测 - Ping`,
  };
}

async function getPageConfig(initialUrl: string) {
  let pageConfig: PingPublicPageConfig;
  try {
    pageConfig = await fetchPublicPageConfig("tcping", initialUrl, getCanonicalPath(initialUrl));
  } catch {
    return fallbackPageConfig(initialUrl);
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

export async function generateMetadata({ params, searchParams }: TcpingPageProps): Promise<Metadata> {
  const { target } = await params;
  const query = await searchParams;
  const initialUrl = getStringParam(query.url)?.trim() || probeTargetFromPathSegments(target);
  const pageConfig = await getPageConfig(initialUrl);
  const keywords = pageConfig.keywords
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    alternates: {
      canonical: pageConfig.canonicalPath || getCanonicalPath(initialUrl),
    },
    description: pageConfig.description || fallbackPageConfig(initialUrl).description,
    keywords,
    title: pageConfig.title || fallbackPageConfig(initialUrl).title,
  };
}

export default async function TcpingPage({ params, searchParams }: TcpingPageProps) {
  const { target } = await params;
  const query = await searchParams;
  const initialUrl = getStringParam(query.url)?.trim() || probeTargetFromPathSegments(target);
  const error = getStringParam(query.error);
  const [, layoutConfig] = await Promise.all([
    getPageConfig(initialUrl),
    getLayoutConfig(),
  ]);

  return (
    <PingClient
      activePath="/tcping"
      apiPath="/api/tcping"
      clearPath="/tcping"
      initialError={error}
      initialUrl={initialUrl}
      layoutConfig={layoutConfig}
      placeholder="请输入域名或IP，例如：example.com:443、8.8.8.8:80（不输入端口默认为80端口）"
      probeLabel="tcping"
      probeType="tcping"
      screenshotSuffix="tcping"
    />
  );
}
