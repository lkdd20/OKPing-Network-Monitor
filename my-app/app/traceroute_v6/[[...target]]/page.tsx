import type { Metadata } from "next";

import { TracerouteClient } from "@/components/ping/TracerouteClient";
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
  description: (target) => `Ping 为 ${target} 提供 IPv6 在线路由追踪，使用多跳延迟、丢包率和抖动数据定位 IPv6 网络路径异常。`,
  h1: (target) => `${target} IPv6 路由追踪`,
  intro: (target) => `当前 IPv6 路由追踪目标：${target}。`,
  keywords: (target) => `Ping,IPv6,路由追踪,MTR,Traceroute,${target},网络路径`,
  pageKey: "traceroute_v6",
  pageName: "IPv6 路由追踪",
  path: "/traceroute_v6",
  title: (target) => `${target} IPv6 路由追踪 - Ping`,
};

export async function generateMetadata(props: PublicProbePageProps): Promise<Metadata> {
  return publicProbeMetadata(PAGE, await publicProbePageTarget(props));
}

export default async function IPv6TraceroutePage(props: PublicProbePageProps) {
  const target = await publicProbePageTarget(props);
  const query = await props.searchParams;
  const [, layoutConfig] = await Promise.all([
    loadPublicProbePageConfig(PAGE, target),
    loadPublicProbeLayoutConfig(),
  ]);
  return (
    <TracerouteClient
      activePath="/traceroute_v6"
      apiPath="/api/traceroute_v6"
      clearPath="/traceroute_v6"
      firstNodesApiPath="/api/ping/nodes/ipv6/traceroute/first"
      initialError={stringParam(query.error)}
      initialTarget={target}
      layoutConfig={layoutConfig}
      placeholder="请输入域名或 IPv6 地址，例如：example.com、2001:4860:4860::8888"
      screenshotSuffix="traceroute-v6"
    />
  );
}
