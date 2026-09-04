import { Activity, CloudCog, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

import { PingCompanyPageHeader } from "@/components/ping/PingCompanyPageHeader";
import { PingShell } from "@/components/ping/PingShell";
import { fetchPublicLayoutConfig } from "@/lib/ping/server";

export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/about" },
  description: "了解 okping 的平台介绍、全球网络拨测节点、网站监控能力和okping科技有限公司。",
  keywords: ["Ping", "公司介绍", "网络拨测", "网站监控", "Ping监控", "DNS监控"],
  title: "公司介绍 - Ping",
};

const services = [
  {
    description:
      "集成主流安全厂商能力，面向政企和监管场景提供网络空间资产测绘、网站安全监测、等保合规、信息安全和 IPv6 检测改造等服务。",
    icon: ShieldCheck,
    title: "数字资产安全服务",
  },
  {
    description:
      "okping.net 网站应用安全监测平台拥有覆盖国内主要运营商及海外地区的网络节点，提供网站质量拨测、业务监测、API 接口和自动化运维能力。",
    icon: Activity,
    title: "应用安全监测服务",
  },
  {
    description:
      "边缘安全加速平台基于全球边缘节点，提供域名解析、动静态加速、四层加速、DDoS、CC、Web、Bot 防护和边缘函数计算服务。",
    icon: CloudCog,
    title: "边缘安全加速服务",
  },
];

export default async function AboutPage() {
  const layoutConfig = await fetchPublicLayoutConfig("default").catch(() => undefined);

  return (
    <PingShell activePath="/about" layoutConfig={layoutConfig}>
      <PingCompanyPageHeader
        activePath="/about"
        description=""
        title="公司介绍"
      />

      <div className="mx-auto w-full max-w-7xl px-6 py-10">
        <section className="grid grid-cols-[1fr_360px] gap-16 border-b border-zinc-200 pb-10 dark:border-gray-800">
          <div>
            <div className="mb-6 border-l-4 border-blue-600 pl-4 dark:border-blue-400">
              <p className="text-xs font-semibold uppercase text-blue-600 dark:text-blue-400">About Us</p>
              <h2 className="mt-1 text-xl font-semibold text-zinc-950 dark:text-zinc-100">公司简介</h2>
            </div>
            <div className="space-y-5 text-[15px] leading-8 text-zinc-600 dark:text-gray-300">
              <p>
                okping科技有限公司（简称“okping”）长期专注于公共云、混合云以及多云场景的一体化资源监控。平台提供全球
                200+ 网络拨测节点，覆盖中国电信、中国联通、中国移动、港澳台及海外网络，模拟用户访问域名或 IP，帮助发现网络和站点可用性问题。
              </p>
              <p>
                okping.net 由okping自主研发。okping.net 从分布在不同地区和运营商的拨测节点发出探测请求，记录终端用户访问网站或服务器的情况，使用户能够查看目标可用率、响应时间和故障明细，并快速定位网络问题。
              </p>
            </div>
          </div>

          <dl className="grid grid-rows-3 border border-zinc-200 bg-white dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 dark:border-gray-700">
              <dt className="text-sm text-zinc-500 dark:text-gray-400">全球拨测节点</dt>
              <dd className="text-2xl font-semibold text-blue-600 dark:text-blue-400">200+</dd>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 dark:border-gray-700">
              <dt className="text-sm text-zinc-500 dark:text-gray-400">持续检测能力</dt>
              <dd className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">7x24</dd>
            </div>
            <div className="flex items-center justify-between px-6">
              <dt className="text-sm text-zinc-500 dark:text-gray-400">网络协议</dt>
              <dd className="text-lg font-semibold text-fuchsia-600 dark:text-fuchsia-400">IPv4 + IPv6</dd>
            </div>
          </dl>
        </section>

        <section className="py-10">
          <div className="mb-6 border-l-4 border-emerald-600 pl-4 dark:border-emerald-400">
            <p className="text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-400">Technology</p>
            <h2 className="mt-1 text-xl font-semibold text-zinc-950 dark:text-zinc-100">技术服务</h2>
          </div>

          <div className="grid grid-cols-3 border border-zinc-200 bg-white dark:border-gray-700 dark:bg-gray-900">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <article
                  className={`px-7 py-7 ${index < services.length - 1 ? "border-r border-zinc-200 dark:border-gray-700" : ""}`}
                  key={service.title}
                >
                  <Icon aria-hidden="true" className="text-blue-600 dark:text-blue-400" size={24} />
                  <h3 className="mt-5 text-base font-semibold text-zinc-950 dark:text-zinc-100">{service.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-gray-300">{service.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="border-l-4 border-blue-600 bg-zinc-900 px-8 py-7 text-sm leading-7 text-zinc-300 dark:border-blue-400 dark:bg-gray-900">
          依托okping在安全行业积累的系统建设、运维、等保和安全运营经验，公司已面向政府部门、企业、电信运营商、域名注册商、CDN、游戏及金融客户提供数字安全解决方案。
        </section>
      </div>
    </PingShell>
  );
}
