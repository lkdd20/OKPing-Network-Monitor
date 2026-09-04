import type { Metadata } from "next";

import { PingShell } from "@/components/ping/PingShell";
import { WhoisQueryClient } from "@/components/ping/WhoisQueryClient";
import {
  loadPublicProbeLayoutConfig,
  loadPublicProbePageConfig,
  publicProbeMetadata,
  publicProbePageTarget,
  type PublicProbePageProps,
  type PublicProbePageSpec,
} from "@/lib/ping/publicProbePage";
import { fetchWhois } from "@/lib/ping/server";

const WHOIS_PAGE_SPEC: PublicProbePageSpec = {
  description: (target) => `查询 ${target} 的域名注册商、注册时间、到期时间、域名状态与DNS服务器。`,
  h1: (target) => `${target} WHOIS 查询`,
  intro: (target) => `当前查询域名：${target}。`,
  keywords: (target) => `Ping,WHOIS查询,域名查询,${target},域名注册信息,域名到期时间`,
  pageKey: "whois",
  pageName: "WHOIS 查询",
  path: "/whois",
  shareTargetInPath: true,
  title: (target) => `${target} WHOIS 查询结果 - Ping`,
};

export async function generateMetadata(props: PublicProbePageProps): Promise<Metadata> {
  return publicProbeMetadata(WHOIS_PAGE_SPEC, await publicProbePageTarget(props));
}

export default async function WhoisPage(props: PublicProbePageProps) {
  const initialDomain = await publicProbePageTarget(props);
  const [pageConfig, layoutConfig, initialResult] = await Promise.all([
    loadPublicProbePageConfig(WHOIS_PAGE_SPEC, initialDomain),
    loadPublicProbeLayoutConfig(),
    initialDomain ? fetchWhois(initialDomain).catch(() => undefined) : Promise.resolve(undefined),
  ]);

  return (
    <PingShell activePath="/whois" layoutConfig={layoutConfig}>
      <div className="w-full min-w-[1280px]">
        <h1 className="sr-only">{pageConfig.h1 || WHOIS_PAGE_SPEC.h1(initialDomain || "域名")}</h1>
        <section className="mx-auto w-full max-w-7xl px-4 py-6">
          <WhoisQueryClient
            adLinks={layoutConfig?.adLinks}
            initialDomain={initialDomain}
            initialResult={initialResult}
          />
        </section>
      </div>
    </PingShell>
  );
}
