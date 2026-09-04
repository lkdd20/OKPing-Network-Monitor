import type { Metadata } from "next";

import PingClient from "@/app/ping/[[...target]]/PingClient";
import {
  loadPublicProbeLayoutConfig,
  loadPublicProbePageConfig,
  publicProbeMetadata,
  publicProbePageTarget,
  stringParam,
  type PublicProbePageProps,
  type PublicProbePageSpec,
} from "@/lib/ping/publicProbePage";

const PAGE: PublicProbePageSpec = {
  description: (target) => `Ping 为 ${target} 提供 IPv6 在线 Ping 检测，使用支持 IPv6 的多地区、多运营商节点返回响应地址、地区与延迟。`,
  h1: (target) => `${target} IPv6 在线 Ping 检测`,
  intro: (target) => `当前 IPv6 检测目标：${target}。`,
  keywords: (target) => `Ping,IPv6,在线Ping,${target},IPv6检测,延迟检测`,
  pageKey: "ping_v6",
  pageName: "IPv6 在线 Ping",
  path: "/ping_v6",
  shareTargetInPath: true,
  title: (target) => `${target} IPv6 在线 Ping 检测 - Ping`,
};

export async function generateMetadata(props: PublicProbePageProps): Promise<Metadata> {
  return publicProbeMetadata(PAGE, await publicProbePageTarget(props));
}

export default async function IPv6PingPage(props: PublicProbePageProps) {
  const target = await publicProbePageTarget(props);
  const query = await props.searchParams;
  const [, layoutConfig] = await Promise.all([
    loadPublicProbePageConfig(PAGE, target),
    loadPublicProbeLayoutConfig(),
  ]);
  return (
    <PingClient
      activePath="/ping_v6"
      apiPath="/api/ping_v6"
      clearPath="/ping_v6"
      firstNodesApiPath="/api/ping/nodes/ipv6/first"
      initialError={stringParam(query.error)}
      initialUrl={target}
      layoutConfig={layoutConfig}
      placeholder="请输入域名或 IPv6 地址，例如：example.com、2001:4860:4860::8888"
      probeLabel="IPv6 Ping"
      probeType="ping_v6"
      screenNodesApiPath="/api/ping/nodes/ipv6/screen"
      screenshotSuffix="ping-v6"
    />
  );
}
