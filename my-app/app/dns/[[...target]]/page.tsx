import type { Metadata } from "next";

import PingClient from "@/app/ping/[[...target]]/PingClient";
import { requirePublicPageEnabled } from "@/lib/ping/pageAvailability";
import { fetchPublicLayoutConfig, fetchPublicPageConfig } from "@/lib/ping/server";
import type { PingPublicPageConfig } from "@/lib/ping/types";

type DnsPageProps = {
  params: Promise<{
    target?: string[];
  }>;
  searchParams: Promise<{
    error?: string | string[];
    url?: string | string[];
  }>;
};

function getUrlFromPath(segments?: string[]) {
  if (!segments?.length) {
    return "";
  }

  return segments.map((segment) => decodeURIComponent(segment)).join("/");
}

function getStringParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getCanonicalPath(initialUrl: string) {
  return initialUrl ? `/dns?url=${encodeURIComponent(initialUrl)}` : "/dns";
}

function fallbackPageConfig(initialUrl: string): PingPublicPageConfig {
  const displayTarget = initialUrl || "目标地址";

  return {
    canonicalPath: getCanonicalPath(initialUrl),
    description: `Ping 为 ${displayTarget} 提供未登录用户多地区、多运营商 DNS 查询，支持 A、AAAA、CNAME、MX、NS、TXT、PTR 与 SRV 记录。`,
    h1: `${displayTarget} DNS 记录查询`,
    intro: `当前查询目标：${displayTarget}。页面参数由服务端渲染输出，便于搜索引擎解析当前查询内容。`,
    keywords: `Ping,DNS查询,DNS解析,${initialUrl},A记录,AAAA记录,CNAME查询,MX查询,TXT查询,NS查询,PTR查询,SRV查询`,
    pageKey: "dns",
    pageName: "DNS 查询",
    target: initialUrl,
    title: `${displayTarget} DNS 记录查询 - Ping`,
  };
}

async function getPageConfig(initialUrl: string) {
  let pageConfig: PingPublicPageConfig;
  try {
    pageConfig = await fetchPublicPageConfig("dns", initialUrl, getCanonicalPath(initialUrl));
  } catch {
    return fallbackPageConfig(initialUrl);
  }

  const enabledPageConfig = requirePublicPageEnabled(pageConfig);
  return enabledPageConfig.pageName === "dns" ? fallbackPageConfig(initialUrl) : enabledPageConfig;
}

async function getLayoutConfig() {
  try {
    return await fetchPublicLayoutConfig("default");
  } catch {
    return undefined;
  }
}

export async function generateMetadata({ params, searchParams }: DnsPageProps): Promise<Metadata> {
  const { target } = await params;
  const query = await searchParams;
  const initialUrl = getStringParam(query.url)?.trim() || getUrlFromPath(target);
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

export default async function DnsPage({ params, searchParams }: DnsPageProps) {
  const { target } = await params;
  const query = await searchParams;
  const initialUrl = getStringParam(query.url)?.trim() || getUrlFromPath(target);
  const error = getStringParam(query.error);
  const [, layoutConfig] = await Promise.all([
    getPageConfig(initialUrl),
    getLayoutConfig(),
  ]);

  return (
    <PingClient
      activePath="/dns"
      apiPath="/api/dns"
      clearPath="/dns"
      dnsOptionsEnabled
      initialError={error}
      initialUrl={initialUrl}
      layoutConfig={layoutConfig}
      placeholder="请输入域名或IP，例如：example.com、8.8.8.8"
      probeLabel="DNS 查询"
      probeType="dns"
      screenshotSuffix="dns"
    />
  );
}
