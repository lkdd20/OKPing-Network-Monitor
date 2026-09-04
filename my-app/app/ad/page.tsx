import { CheckCircle2, Megaphone, ShieldAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AdServiceClient } from "@/components/ping/AdServiceClient";
import { PingShell } from "@/components/ping/PingShell";
import { fetchPublicLayoutConfig } from "@/lib/ping/server";

export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/ad" },
  description: "Ping 广告服务与拨测节点赞助说明，查看广告位、规格、价格、素材示例和投放规则。",
  keywords: ["Ping", "广告服务", "广告位投放", "节点赞助", "网络拨测广告"],
  title: "广告服务 - Ping",
};

const RULES = [
  "文字广告限制为 16 个汉字以内，两个半角字符按一个汉字计算。",
  "广告位相关的文字和图片允许修改，每月最多修改 2 次。",
  "广告内容和素材文件必须通过平台审核后才可投放。",
  "续费请提前 3 天完成付款，未及时续费的广告位将重新开放。",
  "平台不接受赌博、色情、政治等违反中华人民共和国法律法规的广告。",
  "广告目标页面不得包含木马、病毒或其他恶意程序，发现后将立即下线且不予退款。",
  "存在虚假宣传、诈骗举报或侵害用户权益且无法作出有效解释的广告，将被下线且不予退款。",
  "广告联盟或类似组织发生大范围封号、拒绝结算等严重诚信事件时，相关广告将立即下线。",
];

export default async function AdPage() {
  const layoutConfig = await fetchPublicLayoutConfig("default").catch(() => undefined);

  return (
    <PingShell activePath="/ad" layoutConfig={layoutConfig}>
      <div className="border-b border-zinc-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex h-28 max-w-7xl items-center justify-between px-6">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500 dark:text-gray-400">
              <Link className="transition hover:text-blue-600 dark:hover:text-blue-400" href="/">
                首页
              </Link>
              <span>/</span>
              <span className="text-zinc-700 dark:text-gray-200">广告服务</span>
            </div>
            <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-100">广告服务</h1>
          </div>
          <p className="max-w-xl text-right text-sm leading-6 text-zinc-500 dark:text-gray-400">
            面向云服务、网络安全和互联网基础设施企业开放广告位与节点赞助合作。
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl space-y-10 px-6 py-10">
        <div className="flex items-start gap-3 border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-200">
          <ShieldAlert aria-hidden="true" className="mt-0.5 shrink-0" size={18} />
          <p className="leading-6">
            本站广告由第三方投放，用户应自行辨别广告内容。如发生纠纷，可联系平台获取广告主联系方式进行沟通。
          </p>
        </div>

        <AdServiceClient />

        <section>
          <div className="mb-5 border-l-4 border-rose-600 pl-4 dark:border-rose-400">
            <p className="text-xs font-semibold uppercase text-rose-600 dark:text-rose-400">Important Rules</p>
            <h2 className="mt-1 text-xl font-semibold text-zinc-950 dark:text-zinc-100">投放规则</h2>
          </div>

          <div className="grid grid-cols-[280px_1fr] border border-zinc-200 bg-white dark:border-gray-700 dark:bg-gray-900">
            <div className="flex flex-col justify-between border-r border-zinc-200 bg-zinc-50 p-6 dark:border-gray-700 dark:bg-gray-800">
              <Megaphone aria-hidden="true" className="text-rose-600 dark:text-rose-400" size={30} />
              <div>
                <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-100">投放前请确认</h3>
                <p className="mt-2 text-xs leading-5 text-zinc-500 dark:text-gray-400">
                  提交素材即表示广告主同意以下审核、续费和下线规则。
                </p>
              </div>
            </div>
            <ol className="grid grid-cols-2">
              {RULES.map((rule, index) => (
                <li
                  className={`flex min-h-24 items-start gap-3 border-zinc-200 px-5 py-4 text-sm leading-6 text-zinc-700 dark:border-gray-700 dark:text-gray-200 ${
                    index < RULES.length - 2 ? "border-b" : ""
                  } ${index % 2 === 0 ? "border-r" : ""}`}
                  key={rule}
                >
                  <CheckCircle2 aria-hidden="true" className="mt-1 shrink-0 text-emerald-600 dark:text-emerald-400" size={16} />
                  <span>
                    <span className="mr-2 font-mono text-xs text-zinc-400 dark:text-gray-500">{String(index + 1).padStart(2, "0")}</span>
                    {rule}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </PingShell>
  );
}
