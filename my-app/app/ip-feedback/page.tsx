import type { Metadata } from "next";
import Link from "next/link";

import { IpFeedbackPageClient } from "@/components/ping/IpFeedbackPageClient";
import { PingShell } from "@/components/ping/PingShell";
import { fetchPublicIpFeedback, fetchPublicLayoutConfig } from "@/lib/ping/server";

export const metadata: Metadata = {
  description: "提交 IPv4 或 IPv6 地址归属地纠错反馈，管理员审核通过后更新okping.net前台结果。",
  title: "IP 信息纠错 - Ping",
};

type IpFeedbackPageProps = {
  searchParams: Promise<{
    ip?: string | string[];
    location?: string | string[];
    version?: string | string[];
  }>;
};

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function IpFeedbackPage({ searchParams }: IpFeedbackPageProps) {
  const query = await searchParams;
  const version = firstParam(query.version) === "ipv6" ? "ipv6" : "ipv4";
  const initialIp = firstParam(query.ip)?.trim() || "";
  const currentLocation = firstParam(query.location)?.trim() || "";
  const [layoutConfig, initialData] = await Promise.all([
    fetchPublicLayoutConfig("default").catch(() => undefined),
    fetchPublicIpFeedback({ ip: initialIp, pageNum: 1, pageSize: 6 }).catch(() => undefined),
  ]);

  return (
    <PingShell activePath="" layoutConfig={layoutConfig}>
      <div className="w-full min-w-[1280px]">
        <section className="mx-auto w-full max-w-7xl px-4 py-6">
          <div className="mb-5 flex items-center gap-2 text-xs text-zinc-500 dark:text-gray-400">
            <Link className="transition hover:text-blue-600 dark:hover:text-blue-400" href="/">首页</Link>
            <span>/</span>
            <span className="text-zinc-700 dark:text-gray-200">IP 信息纠错</span>
          </div>
          <div className="mb-5">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">IP 信息纠错</h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-gray-400">纠正检测结果中的 IP 归属地信息，审核通过后同步到前台地址查询。</p>
          </div>
          <IpFeedbackPageClient currentLocation={currentLocation} initialData={initialData} initialIp={initialIp} version={version} />
        </section>
      </div>
    </PingShell>
  );
}
