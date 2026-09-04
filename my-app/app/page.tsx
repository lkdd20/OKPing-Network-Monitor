import type { Metadata } from "next";

import { HomeCurlCommands } from "@/components/ping/HomeCurlCommands";
import { HomeNetworkOverview } from "@/components/ping/HomeNetworkOverview";
import { HomeSponsors } from "@/components/ping/HomeSponsors";
import { HomeToolGrid } from "@/components/ping/HomeToolGrid";
import { mergeLayoutConfig } from "@/components/ping/layoutDefaults";
import { PingCenterAds } from "@/components/ping/PingAdSlots";
import { PingShell } from "@/components/ping/PingShell";
import { fetchPublicLayoutConfig, fetchSponsors } from "@/lib/ping/server";

export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  description: "Ping 提供在线 Ping、TCPing、HTTP 测速、DNS 查询、路由追踪及 IPv6 网络检测工具。",
  keywords: ["Ping", "在线Ping", "TCPing", "网站测速", "DNS查询", "路由追踪", "IPv6检测"],
  title: "Ping - 在线网络检测工具",
};

async function getHomeData() {
  const [layoutConfig, sponsors] = await Promise.all([
    fetchPublicLayoutConfig("default").then(mergeLayoutConfig).catch(() => mergeLayoutConfig()),
    fetchSponsors().catch(() => []),
  ]);
  return { layoutConfig, sponsors };
}

export default async function Home() {
  const { layoutConfig, sponsors } = await getHomeData();

  return (
    <PingShell activePath="/" layoutConfig={layoutConfig}>
      {/*<div className="border-b border-zinc-200 bg-white dark:border-gray-800 dark:bg-gray-900">*/}
      {/*  <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6">*/}
      {/*    <div>*/}
      {/*      <h1 className="text-3xl font-semibold text-zinc-950 dark:text-zinc-100">Ping</h1>*/}
      {/*      <p className="mt-1 text-sm text-zinc-500 dark:text-gray-400">网络检测工具</p>*/}
      {/*    </div>*/}
      {/*    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-gray-400">*/}
      {/*      <span className="h-2 w-2 rounded-full bg-emerald-500" />*/}
      {/*      实时网络检测*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</div>*/}
      <HomeNetworkOverview />
      <PingCenterAds ads={layoutConfig.adLinks} />
      <HomeToolGrid tools={layoutConfig.homeTools} />
        <HomeCurlCommands />
      <HomeSponsors sponsors={sponsors} />
    </PingShell>
  );
}
