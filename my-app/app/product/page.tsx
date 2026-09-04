import {
  Activity,
  BellRing,
  CheckCircle2,
  Clock3,
  Gauge,
  Globe2,
  History,
  Network,
  Radar,
  Route,
  ShieldCheck,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { MonitoringBetaSignup } from "@/components/ping/MonitoringBetaSignup";
import { PingShell } from "@/components/ping/PingShell";
import { getAuthenticatedAccountProfile } from "@/lib/auth/serverAccount";
import { fetchPublicLayoutConfig } from "@/lib/ping/server";

export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/product" },
  description: "Ping 网站与服务监控，提供多地区持续检测、可用性分析、响应趋势、异常告警和恢复通知。",
  keywords: ["网站监控", "服务监控", "可用性监控", "响应时间监控", "故障告警", "Ping"],
  title: "网站与服务监控 - Ping",
};

const capabilities = [
  {
    description: "持续检查网站、接口、域名和端口是否能够正常访问，及时发现中断、超时和访问异常。",
    icon: Globe2,
    title: "多类型目标监控",
  },
  {
    description: "从不同地区和网络线路发起检测，对比各地访问表现，区分局部网络问题与整体故障。",
    icon: Network,
    title: "多地区节点检测",
  },
  {
    description: "集中查看当前状态、响应时间、成功率、状态码和节点差异，快速掌握服务健康情况。",
    icon: Gauge,
    title: "实时状态总览",
  },
  {
    description: "保留可用率和响应时间变化，支持按时间回看节点结果，为故障复盘和性能优化提供依据。",
    icon: History,
    title: "历史趋势与明细",
  },
  {
    description: "按可用性、响应时间或返回状态设置异常条件，达到条件后生成告警并通知指定联系人。",
    icon: BellRing,
    title: "灵活告警规则",
  },
  {
    description: "异常后继续检测，确认服务恢复时同步记录恢复时间与影响范围，形成完整事件闭环。",
    icon: ShieldCheck,
    title: "异常与恢复跟踪",
  },
];

const workflow = [
  { description: "填写检测目标，选择检测类型、频率、节点和告警条件。", title: "创建监控任务" },
  { description: "各地区节点按照设定频率持续执行检测并记录结果。", title: "节点持续检测" },
  { description: "汇总各节点状态，计算可用性、响应时间和结果差异。", title: "结果汇总分析" },
  { description: "检测结果达到异常条件后，生成事件并通知相关人员。", title: "异常触发通知" },
  { description: "持续确认目标状态，恢复后发送通知并保留完整历史。", title: "恢复确认归档" },
];

function ProductDashboardScene() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-y-0 right-0 w-[72%] border-l border-white/10 bg-[#151b1d]">
        <div className="flex h-12 items-center justify-between border-b border-white/10 px-6 text-[11px] text-zinc-400">
          <span>监控状态总览</span>
          <span>最近更新 10:26:18</span>
        </div>
        <div className="grid grid-cols-4 border-b border-white/10">
          {[
            ["监控任务", "36", "text-white"],
            ["运行正常", "34", "text-emerald-400"],
            ["异常任务", "2", "text-red-400"],
            ["在线节点", "12/13", "text-amber-300"],
          ].map(([label, value, tone], index) => (
            <div className={`px-5 py-4 ${index ? "border-l border-white/10" : ""}`} key={label}>
              <div className="text-[10px] text-zinc-500">{label}</div>
              <div className={`mt-1 text-xl font-semibold ${tone}`}>{value}</div>
            </div>
          ))}
        </div>
        <div className="grid h-[270px] grid-cols-[1.45fr_1fr]">
          <div className="border-r border-white/10 p-5">
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span>响应时间趋势</span>
              <span>过去 6 小时</span>
            </div>
            <div className="relative mt-4 h-[165px] border-l border-b border-white/10">
              {[25, 50, 75].map((top) => (
                <span className="absolute left-0 right-0 border-t border-white/5" key={top} style={{ top: `${top}%` }} />
              ))}
              <div className="absolute inset-x-2 bottom-0 top-3 flex items-end gap-2">
                {[28, 34, 31, 43, 39, 52, 47, 64, 56, 72, 66, 81, 76, 88].map((height, index) => (
                  <span className="relative flex h-full flex-1 items-end" key={`${height}-${index}`}>
                    <i className="w-full bg-emerald-400/80" style={{ height: `${height}%` }} />
                    <i className="absolute bottom-0 left-[30%] w-[40%] bg-blue-400" style={{ height: `${Math.max(14, height - 22)}%` }} />
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-3 flex gap-5 text-[10px] text-zinc-500">
              <span className="flex items-center gap-2"><i className="h-1.5 w-1.5 bg-emerald-400" />平均响应 186 ms</span>
              <span className="flex items-center gap-2"><i className="h-1.5 w-1.5 bg-blue-400" />最快响应 72 ms</span>
            </div>
          </div>
          <div className="p-5">
            <div className="text-[11px] text-zinc-400">最近事件</div>
            <div className="mt-3 space-y-2">
              {[
                ["网站主页", "运行正常", "bg-emerald-400"],
                ["订单接口", "响应超时", "bg-red-400"],
                ["DNS 解析", "运行正常", "bg-emerald-400"],
                ["支付端口", "已恢复", "bg-blue-400"],
              ].map(([name, state, tone]) => (
                <div className="flex items-center justify-between border-b border-white/5 py-2.5 text-[11px]" key={name}>
                  <span className="text-zinc-300">{name}</span>
                  <span className="flex items-center gap-2 text-zinc-400"><i className={`h-1.5 w-1.5 ${tone}`} />{state}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-y-0 left-0 w-[62%] bg-black/70" />
    </div>
  );
}

export default async function ProductPage() {
  const [layoutConfig, profile] = await Promise.all([
    fetchPublicLayoutConfig("default").catch(() => undefined),
    getAuthenticatedAccountProfile(),
  ]);

  return (
    <PingShell activePath="/product" layoutConfig={layoutConfig}>
      <section className="relative h-[430px] overflow-hidden border-b border-zinc-800 bg-[#101416] text-white">
        <ProductDashboardScene />
        <div className="relative mx-auto flex h-full max-w-7xl items-center px-6">
          <div className="max-w-[610px]">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Radar aria-hidden="true" className="h-4 w-4" />
             okping.netMONITORING
            </div>
            <h1 className="text-4xl font-semibold text-white">网站与服务监控</h1>
            <p className="mt-5 max-w-[570px] text-[15px] leading-8 text-zinc-300">
              从不同地区持续检查网站、接口、域名和端口的可用性，集中呈现当前状态与历史趋势，在异常发生和服务恢复时及时通知相关人员。
            </p>
            <div className="mt-7 flex items-center gap-5">
              <MonitoringBetaSignup authenticated={Boolean(profile)} />
              <Link className="text-sm font-medium text-white underline decoration-zinc-500 underline-offset-4 hover:decoration-white" href="#workflow">
                查看运行流程
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">核心能力</p>
              <h2 className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-zinc-100">持续掌握每个目标的真实状态</h2>
            </div>
            <p className="max-w-xl text-right text-sm leading-7 text-zinc-500 dark:text-gray-400">
              从任务配置、节点检测到告警与恢复，所有结果围绕目标、地区和时间统一组织，便于快速判断影响范围。
            </p>
          </div>
          <div className="grid grid-cols-3 border-y border-zinc-200 dark:border-gray-700">
            {capabilities.map((item, index) => {
              const Icon = item.icon;
              return (
                <article
                  className={`min-h-48 px-7 py-7 ${index % 3 ? "border-l border-zinc-200 dark:border-gray-700" : ""} ${index >= 3 ? "border-t border-zinc-200 dark:border-gray-700" : ""}`}
                  key={item.title}
                >
                  <Icon aria-hidden="true" className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <h3 className="mt-5 text-base font-semibold text-zinc-950 dark:text-zinc-100">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-gray-300">{item.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-200 bg-zinc-50 dark:border-gray-800 dark:bg-gray-950" id="workflow">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">运行流程</p>
              <h2 className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-zinc-100">从任务创建到恢复确认</h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-gray-400">
              <Clock3 aria-hidden="true" className="h-4 w-4" />
              全流程持续运行
            </div>
          </div>
          <ol className="mt-9 grid grid-cols-5 border border-zinc-200 bg-white dark:border-gray-700 dark:bg-gray-900">
            {workflow.map((item, index) => (
              <li className={`min-h-52 p-6 ${index ? "border-l border-zinc-200 dark:border-gray-700" : ""}`} key={item.title}>
                <div className="flex h-8 w-8 items-center justify-center bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-950">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-5 text-sm font-semibold text-zinc-950 dark:text-zinc-100">{item.title}</h3>
                <p className="mt-3 text-xs leading-6 text-zinc-500 dark:text-gray-400">{item.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-zinc-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto grid max-w-7xl grid-cols-[0.9fr_1.1fr] gap-16 px-6 py-12">
          <div>
            <p className="text-xs font-semibold text-red-600 dark:text-red-400">异常闭环</p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-zinc-100">不只提醒故障，也确认恢复</h2>
            <p className="mt-5 text-sm leading-8 text-zinc-600 dark:text-gray-300">
              单次失败不一定代表真实故障。系统会结合连续检测结果、多个节点表现和设定条件判断异常，并在目标恢复后继续确认，减少重复通知和误判。
            </p>
          </div>
          <div className="grid grid-cols-4 border-y border-zinc-200 dark:border-gray-700">
            {[
              { icon: Activity, label: "持续检测", tone: "text-blue-600 dark:text-blue-400" },
              { icon: Route, label: "判断影响", tone: "text-amber-600 dark:text-amber-400" },
              { icon: BellRing, label: "异常通知", tone: "text-red-600 dark:text-red-400" },
              { icon: CheckCircle2, label: "恢复确认", tone: "text-emerald-600 dark:text-emerald-400" },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div className={`flex min-h-44 flex-col items-center justify-center gap-4 ${index ? "border-l border-zinc-200 dark:border-gray-700" : ""}`} key={item.label}>
                  <Icon aria-hidden="true" className={`h-7 w-7 ${item.tone}`} />
                  <span className="text-sm font-medium text-zinc-800 dark:text-gray-200">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#151a1c] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-10">
          <div>
            <h2 className="text-xl font-semibold">加入首批监控内测</h2>
            <p className="mt-2 text-sm text-zinc-400">登录okping.net账号完成报名，产品上线后会向报名用户发送通知。</p>
          </div>
          <MonitoringBetaSignup authenticated={Boolean(profile)} />
        </div>
      </section>
    </PingShell>
  );
}
