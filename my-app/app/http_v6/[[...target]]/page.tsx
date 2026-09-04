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
  description: (target) => `Ping 为 ${target} 提供 IPv6 网站测速，使用支持 IPv6 的节点分析 HTTP 响应、DNS、连接与加载耗时。`,
  h1: (target) => `${target} IPv6 网站测速`,
  intro: (target) => `当前 IPv6 网站检测目标：${target}。`,
  keywords: (target) => `Ping,IPv6,网站测速,${target},HTTP测速,网站速度检测`,
  pageKey: "http_v6",
  pageName: "IPv6 网站测速",
  path: "/http_v6",
  shareTargetInPath: true,
  title: (target) => `${target} IPv6 网站测速 - Ping`,
};

export async function generateMetadata(props: PublicProbePageProps): Promise<Metadata> {
  return publicProbeMetadata(PAGE, await publicProbePageTarget(props));
}

export default async function IPv6HTTPPage(props: PublicProbePageProps) {
  const target = await publicProbePageTarget(props);
  const query = await props.searchParams;
  const [, layoutConfig] = await Promise.all([
    loadPublicProbePageConfig(PAGE, target),
    loadPublicProbeLayoutConfig(),
  ]);
  return (
    <PingClient
      activePath="/http_v6"
      apiPath="/api/http_v6"
      clearPath="/http_v6"
      firstNodesApiPath="/api/ping/nodes/ipv6/first"
      httpOptionsEnabled
      initialError={stringParam(query.error)}
      initialUrl={target}
      layoutConfig={layoutConfig}
      placeholder="请输入 IPv6 网站地址，例如：https://[2001:db8::1]/、https://example.com/"
      probeLabel="IPv6 网站测速"
      probeType="http_v6"
      screenNodesApiPath="/api/ping/nodes/ipv6/screen"
      secondaryActionLabel="缓慢测试"
      secondaryActionModel="slow"
      screenshotSuffix="http-v6"
    />
  );
}
