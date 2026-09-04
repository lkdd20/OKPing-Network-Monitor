import type { Metadata } from "next";
import { headers } from "next/headers";

import { IpQueryClient } from "@/components/ping/IpQueryClient";
import { PingShell } from "@/components/ping/PingShell";
import {
  loadPublicProbeLayoutConfig,
  loadPublicProbePageConfig,
  publicProbeMetadata,
  publicProbePageTarget,
  type PublicProbePageProps,
  type PublicProbePageSpec,
} from "@/lib/ping/publicProbePage";
import { fetchCurrentClientIp, fetchIpInfo } from "@/lib/ping/server";

const IP_PAGE_SPEC: PublicProbePageSpec = {
  description: (target) => `Ping 为 ${target} 提供 IPv4 / IPv6 地理位置、ASN、网络类型和风险信息查询。`,
  h1: (target) => `${target} IP 信息查询`,
  intro: (target) => `当前查询地址：${target}`,
  keywords: (target) => `Ping,IP查询,IP归属地,ASN查询,IP风险,原生IP,${target}`,
  pageKey: "ip",
  pageName: "IP 查询",
  path: "/ip",
  shareTargetInPath: true,
  title: (target) => `${target} IP 信息查询 - Ping`,
};

export async function generateMetadata(props: PublicProbePageProps): Promise<Metadata> {
  return publicProbeMetadata(IP_PAGE_SPEC, await publicProbePageTarget(props));
}

export default async function IpPage(props: PublicProbePageProps) {
  const requestedIp = await publicProbePageTarget(props);
  const requestHeaders = await headers();
  const initialIp = requestedIp || await fetchCurrentClientIp(
    requestHeaders.get("x-forwarded-for"),
    requestHeaders.get("x-real-ip"),
  ).catch(() => "");
  const [, layoutConfig, initialResult] = await Promise.all([
    loadPublicProbePageConfig(IP_PAGE_SPEC, requestedIp),
    loadPublicProbeLayoutConfig(),
    initialIp ? fetchIpInfo(initialIp).catch(() => undefined) : Promise.resolve(undefined),
  ]);

  return (
    <PingShell activePath="/ip" layoutConfig={layoutConfig}>
      <div className="w-full min-w-[1280px]">
        <section className="mx-auto w-full max-w-7xl px-4 py-6">
          <IpQueryClient
            adLinks={layoutConfig?.adLinks}
            initialIp={initialIp}
            initialResult={initialResult}
          />
        </section>
      </div>
    </PingShell>
  );
}
