import type { Metadata } from "next";
import Image from "next/image";

import { PingCompanyPageHeader } from "@/components/ping/PingCompanyPageHeader";
import { PingShell } from "@/components/ping/PingShell";
import { fetchPublicLayoutConfig, fetchPublicMilestones } from "@/lib/ping/server";
import type { PingMilestone } from "@/lib/ping/types";

export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/develop" },
  description: "查看okping.net平台的发展历程、节点扩展、网络工具上线记录和企业资质。",
  keywords: ["发展历程", "版本里程碑", "网络拨测平台", "企业资质"],
  title: "发展历程 - Ping",
};

const FALLBACK_TIMELINE: PingMilestone[] = [
  { content: "优化网站测速高级功能，支持请求头修改、实时 HTTP 请求、测试数据生成以及请求与响应验证。", id: "fallback-1", month: "4月", year: "2025" },
  { content: "新增 IPv6 查询及批量 Ping、批量 TCPing 能力，支持快速检测 IPv6 目标。", id: "fallback-2", month: "3月", year: "2025" },
  { content: "新增批量检测工具，可对多个目标和 IP 段执行批量 Ping、TCPing 与网站测速。", id: "fallback-3", month: "2月", year: "2025" },
  { content: "优化 WebSocket 握手与传输稳定性，降低连接失败率并改善海外网络环境下的检测中断问题。", id: "fallback-4", month: "1月", year: "2025" },
  { content: "支持中文域名提交检测，并针对访客反馈较多的使用体验问题进行优化。", id: "fallback-5", month: "12月", year: "2024" },
  { content: "新增家庭网络节点和运营商 DNS，帮助判断运营商级 DNS 污染并还原终端用户网络环境。", id: "fallback-6", month: "12月", year: "2024" },
  { content: "新增 DNS 查询工具，支持 A、CNAME、AAAA、TXT、MX、NS、SRV 和 PTR 查询。", id: "fallback-7", month: "10月", year: "2024" },
  { content: "新增路由追踪工具，用于查看源主机到目标主机之间的路由节点与各跳耗时。", id: "fallback-8", month: "9月", year: "2024" },
  { content: "新增 Whois 查询工具，用于查询域名所有者、到期时间和所属注册商等信息。", id: "fallback-9", month: "8月", year: "2024" },
  { content: "新增网站测速工具，支持 HTTP 与 HTTPS 检测并分析解析、连接、重定向、状态码和响应头。", id: "fallback-10", month: "8月", year: "2024" },
  { content: "在线 Ping 与 TCPing 新增持续检测模式，并提供地图和区域数据统计。", id: "fallback-11", month: "8月", year: "2024" },
  { content: "网络监测节点达到 115 个，覆盖中国电信、中国联通、中国移动及海外线路。", id: "fallback-12", month: "6月", year: "2024" },
  { content: "Ping 项目成立，首批上线在线 Ping、在线 TCPing 等网络检测工具。", id: "fallback-13", month: "4月", year: "2024" },
];

export default async function DevelopPage() {
  const [layoutConfig, publicTimeline] = await Promise.all([
    fetchPublicLayoutConfig("default").catch(() => undefined),
    fetchPublicMilestones().catch(() => undefined),
  ]);
  const timeline = publicTimeline ?? FALLBACK_TIMELINE;

  return (
    <PingShell activePath="/develop" layoutConfig={layoutConfig}>
      <PingCompanyPageHeader
        activePath="/develop"
        description="从基础网络连通性检测开始，持续扩展分布式节点、IPv6、批量检测和网站质量分析能力。"
        title="发展历程"
      />

      <div className="mx-auto w-full max-w-7xl px-6 py-10">
        <section>
          <div className="mb-6 border-l-4 border-blue-600 pl-4 dark:border-blue-400">
            <p className="text-xs font-semibold uppercase text-blue-600 dark:text-blue-400">Timeline</p>
            <h2 className="mt-1 text-xl font-semibold text-zinc-950 dark:text-zinc-100">项目里程碑</h2>
          </div>

          {timeline.length ? (
            <ol className="border border-zinc-200 bg-white dark:border-gray-700 dark:bg-gray-900">
              {timeline.map((item) => (
                <li
                  className="grid grid-cols-[120px_30px_1fr] border-b border-zinc-200 last:border-b-0 dark:border-gray-700"
                  key={item.id}
                >
                  <time className="flex items-center justify-end gap-2 px-4 py-4 text-sm">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{item.year}</span>
                    <span className="text-zinc-400 dark:text-gray-500">{item.month}</span>
                  </time>
                  <span className="relative flex items-center justify-center" aria-hidden="true">
                    <span className="absolute bottom-0 top-0 w-px bg-zinc-200 dark:bg-gray-700" />
                    <span className="relative h-2.5 w-2.5 border-2 border-blue-600 bg-white dark:border-blue-400 dark:bg-gray-900" />
                  </span>
                  <p className="py-4 pl-4 pr-6 text-sm leading-7 text-zinc-600 dark:text-gray-300">{item.content}</p>
                </li>
              ))}
            </ol>
          ) : (
            <div className="border border-zinc-200 bg-white px-6 py-12 text-center text-sm text-zinc-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
              暂无公开的项目里程碑
            </div>
          )}
        </section>

        <section className="mt-10 border-t border-zinc-200 pt-10 dark:border-gray-800">
          <div className="mb-6 border-l-4 border-emerald-600 pl-4 dark:border-emerald-400">
            <p className="text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-400">Certification</p>
            <h2 className="mt-1 text-xl font-semibold text-zinc-950 dark:text-zinc-100">企业资质</h2>
          </div>

          <figure className="border border-zinc-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <Image
              alt="okping科技有限公司营业执照"
              className="h-auto w-full"
              height={1508}
              sizes="(min-width: 1280px) 1232px, 100vw"
              src=""
              width={2133}
            />
            <figcaption className="border-t border-zinc-200 px-2 pt-4 text-center text-xs text-zinc-500 dark:border-gray-700 dark:text-gray-400">
              okping科技有限公司营业执照
            </figcaption>
          </figure>
        </section>
      </div>
    </PingShell>
  );
}
