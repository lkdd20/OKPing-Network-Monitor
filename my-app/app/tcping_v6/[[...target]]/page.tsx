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
  description: (target) => `Ping 为 ${target} 提供 IPv6 在线 TCPing 检测，使用支持 IPv6 的节点检测端口连通性与响应耗时。`,
  h1: (target) => `${target} IPv6 在线 TCPing 检测`,
  intro: (target) => `当前 IPv6 端口检测目标：${target}。`,
  keywords: (target) => `Ping,IPv6,在线TCPing,${target},端口检测,连通性检测`,
  pageKey: "tcping_v6",
  pageName: "IPv6 在线 TCPing",
  path: "/tcping_v6",
  shareTargetInPath: true,
  title: (target) => `${target} IPv6 在线 TCPing 检测 - Ping`,
};

export async function generateMetadata(props: PublicProbePageProps): Promise<Metadata> {
  return publicProbeMetadata(PAGE, await publicProbePageTarget(props));
}

export default async function IPv6TcpingPage(props: PublicProbePageProps) {
  const target = await publicProbePageTarget(props);
  const query = await props.searchParams;
  const [, layoutConfig] = await Promise.all([
    loadPublicProbePageConfig(PAGE, target),
    loadPublicProbeLayoutConfig(),
  ]);
  return (
    <PingClient
      activePath="/tcping_v6"
      apiPath="/api/tcping_v6"
      clearPath="/tcping_v6"
      firstNodesApiPath="/api/ping/nodes/ipv6/first"
      initialError={stringParam(query.error)}
      initialUrl={target}
      layoutConfig={layoutConfig}
      placeholder="请输入域名或 IPv6:端口，例如：example.com:443、[2001:db8::1]:443"
      probeLabel="IPv6 TCPing"
      probeType="tcping_v6"
      screenNodesApiPath="/api/ping/nodes/ipv6/screen"
      screenshotSuffix="tcping-v6"
    />
  );
}
