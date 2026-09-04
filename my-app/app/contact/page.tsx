import {
  Building2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { PingCompanyPageHeader } from "@/components/ping/PingCompanyPageHeader";
import { PingShell } from "@/components/ping/PingShell";
import { fetchPublicLayoutConfig } from "@/lib/ping/server";

export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/contact" },
  description: "联系 Ping，查看客服电话、客服 QQ、商务合作邮箱和公司通讯地址。",
  keywords: ["Ping", "联系我们", "okping", "商务合作", "客服热线"],
  title: "联系我们 - Ping",
};

const contactRows = [



  {
    href: "mailto:okpingnet@outlook.com",
    icon: Mail,
    label: "商务合作",
    value: "okpingnet@outlook.com",
  },
  {
    icon: Building2,
    label: "邮政编码",
    value: "610000",
  },
  {
    icon: MapPin,
    label: "通讯地址",
    value: "",
  },
];

async function loadLayoutConfig() {
  return fetchPublicLayoutConfig("default").catch(() => undefined);
}

export default async function ContactPage() {
  const layoutConfig = await loadLayoutConfig();

  return (
    <PingShell activePath="/contact" layoutConfig={layoutConfig}>
      <PingCompanyPageHeader
        activePath="/contact"
        description="如有产品咨询、节点合作、广告投放或其他建议，欢迎联系okping科技有限公司。"
        title="联系我们"
      />

      <section className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-12 px-6 py-10">
        <div>
          <div className="mb-6 border-l-4 border-blue-600 pl-4 dark:border-blue-400">
            <p className="text-xs font-semibold uppercase text-blue-600 dark:text-blue-400">Contact</p>
            <h2 className="mt-1 text-xl font-semibold text-zinc-950 dark:text-zinc-100">联系方式</h2>
          </div>

          <dl className="overflow-hidden border border-zinc-200 bg-white dark:border-gray-700 dark:bg-gray-900">
            {contactRows.map((item) => {
              const Icon = item.icon;
              const value = item.href ? (
                <Link
                  className="font-medium text-zinc-900 transition hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
                  href={item.href}
                >
                  {item.value}
                </Link>
              ) : (
                <span className="font-medium text-zinc-900 dark:text-gray-100">{item.value}</span>
              );

              return (
                <div
                  className="grid min-h-14 grid-cols-[150px_1fr] border-b border-zinc-200 last:border-b-0 dark:border-gray-700"
                  key={item.label}
                >
                  <dt className="flex items-center gap-2 bg-zinc-50 px-4 text-sm font-medium text-zinc-600 dark:bg-gray-800 dark:text-gray-300">
                    <Icon aria-hidden="true" className="text-zinc-400 dark:text-gray-500" size={16} />
                    {item.label}
                  </dt>
                  <dd className="flex min-w-0 items-center break-words px-5 py-3 text-sm">{value}</dd>
                </div>
              );
            })}
          </dl>
        </div>


      </section>
    </PingShell>
  );
}
