"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Cable,
  ChevronRight,
  Globe2,
  ListTree,
  Network,
  Radar,
  Route,
  Search,
  Server,
  ShieldCheck,
  Wifi,
  type LucideIcon,
} from "lucide-react";

import type { PingHomeToolItem } from "@/lib/ping/types";

type ToolCategory = "all" | "ipv4" | "ipv6" | "batch";

const TOOL_FILTERS: Array<{ label: string; value: ToolCategory }> = [
  { label: "全部", value: "all" },
  { label: "IPv4工具", value: "ipv4" },
  { label: "IPv6工具", value: "ipv6" },
  { label: "批量检测工具", value: "batch" },
];

const TOOL_ICONS: Record<string, LucideIcon> = {
  activity: Activity,
  cable: Cable,
  globe: Globe2,
  network: Network,
  radar: Radar,
  route: Route,
  rows: ListTree,
  search: Search,
  server: Server,
  shield: ShieldCheck,
  wifi: Wifi,
};

function normalizeTool(item: PingHomeToolItem) {
  const title = item.title?.trim() ?? "";
  const description = item.description?.trim() ?? "";
  const url = item.url?.trim() ?? "";
  const color = /^#[0-9a-fA-F]{6}$/.test(item.color ?? "") ? item.color! : "#2563EB";

  if (!title || !description || !/^(https?:\/\/|\/)/i.test(url)) {
    return null;
  }

  const configuredCategory = item.category?.trim().toLowerCase();
  const category: Exclude<ToolCategory, "all"> = ["ipv4", "ipv6", "batch"].includes(configuredCategory ?? "")
    ? configuredCategory as Exclude<ToolCategory, "all">
    : /(^|\/)batch[_/-]/i.test(url)
      ? "batch"
      : /_v6(?:\/|$|\?)/i.test(url)
        ? "ipv6"
        : "ipv4";

  return {
    category,
    color,
    description,
    external: /^https?:\/\//i.test(url),
    Icon: TOOL_ICONS[item.icon ?? ""] ?? Activity,
    title,
    url,
  };
}

export function HomeToolGrid({ tools }: { tools?: PingHomeToolItem[] }) {
  const [activeCategory, setActiveCategory] = useState<ToolCategory>("all");
  const visibleTools = (tools ?? [])
    .filter((item) => item.enabled !== false)
    .map(normalizeTool)
    .filter((item): item is NonNullable<typeof item> => item !== null);
  const filteredTools = activeCategory === "all"
    ? visibleTools
    : visibleTools.filter((item) => item.category === activeCategory);

  if (!visibleTools.length) {
    return null;
  }

  return (
    <section aria-labelledby="home-tools-title" className="mx-auto mt-7 w-full max-w-7xl px-6">
      <div className="mb-4 flex items-end justify-between gap-6">
        <div>
          <h2 className="text-xl font-semibold text-zinc-950 dark:text-zinc-100" id="home-tools-title">
            检测工具
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-gray-400">选择检测类型开始任务</p>
        </div>
        <div className="flex items-center gap-3">
          <div aria-label="检测工具分类" className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-1 dark:border-gray-700 dark:bg-gray-800" role="group">
            {TOOL_FILTERS.map((filter) => {
              const active = activeCategory === filter.value;
              return (
                <button
                  aria-pressed={active}
                  className={`h-8 px-3 text-xs font-medium transition ${active ? "rounded-md bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400" : "text-zinc-500 hover:text-zinc-900 dark:text-gray-400 dark:hover:text-gray-100"}`}
                  key={filter.value}
                  onClick={() => setActiveCategory(filter.value)}
                  type="button"
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
          <span className="min-w-10 text-right text-xs text-zinc-400 dark:text-gray-500">{filteredTools.length} 项</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {filteredTools.map(({ color, description, external, Icon, title, url }, index) => {
          const content = (
            <>
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${color}14`, color }}
              >
                <Icon aria-hidden="true" size={23} strokeWidth={1.9} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</span>
                <span className="mt-1 block min-h-9 text-xs leading-[18px] text-zinc-500 dark:text-gray-400">{description}</span>
              </span>
              {external ? (
                <ArrowUpRight aria-hidden="true" className="mt-1 shrink-0 text-zinc-300 transition group-hover:text-zinc-600 dark:text-gray-600 dark:group-hover:text-gray-300" size={17} />
              ) : (
                <ChevronRight aria-hidden="true" className="mt-1 shrink-0 text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-zinc-600 dark:text-gray-600 dark:group-hover:text-gray-300" size={17} />
              )}
            </>
          );
          const className =
            "group flex h-[112px] items-start gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600";
          const key = `${url}-${title}-${index}`;

          return external ? (
            <a className={className} href={url} key={key} rel="noreferrer" target="_blank">
              {content}
            </a>
          ) : (
            <Link className={className} href={url} key={key}>
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
