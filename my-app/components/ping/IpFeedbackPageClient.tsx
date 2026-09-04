"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsRight, Clock3, LoaderCircle, RotateCcw, Search } from "lucide-react";

import type { PingPublicIpFeedbackItem, PingPublicIpFeedbackPage, PingResponse } from "@/lib/ping/types";

import { IpFeedbackForm } from "./IpFeedbackForm";

type IpFeedbackPageClientProps = {
  currentLocation?: string;
  initialData?: PingPublicIpFeedbackPage;
  initialIp?: string;
  version: "ipv4" | "ipv6";
};

const EMPTY_DATA: PingPublicIpFeedbackPage = {
  pageNum: 1,
  pageSize: 6,
  rows: [],
  submittedIpCount7d: "0",
  total: 0,
  updatedIpCount7d: "0",
};

function formatCount(value: string) {
  return /^\d+$/.test(value) ? value.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0";
}

function formatLocation(value?: string | null) {
  return value?.split("|").filter(Boolean).join("/") || "--";
}

function formatRange(start?: string | null, end?: string | null) {
  if (!start) return "--";
  return `${start} - ${end || start}`;
}

function formatTime(value?: string | null) {
  if (!value) return "--";
  return value.replace("T", " ").replace(/\.\d+(?:Z|[+-]\d\d:\d\d)?$/, "").slice(0, 19);
}

function statusMeta(status: PingPublicIpFeedbackItem["status"]) {
  if (status === "approved") return { label: "已审核", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" };
  if (status === "rejected") return { label: "已驳回", className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" };
  return { label: "待审核", className: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" };
}

function pageNumbers(current: number, total: number) {
  const start = Math.max(1, Math.min(current - 2, total - 4));
  const end = Math.min(total, start + 4);
  return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index);
}

async function requestFeedbackData(pageNum: number, ip: string) {
  const params = new URLSearchParams({ pageNum: String(pageNum), pageSize: "6" });
  if (ip.trim()) params.set("ip", ip.trim());

  const response = await fetch(`/api/ping/ip-feedback?${params}`, { cache: "no-store" });
  const body = (await response.json().catch(() => null)) as PingResponse<PingPublicIpFeedbackPage> | null;
  const code = typeof body?.code === "string" ? Number(body.code) : body?.code;
  if (!response.ok || code !== 200 || !body?.data) {
    throw new Error(body?.msg || body?.message || "反馈记录加载失败");
  }
  return body.data;
}

export function IpFeedbackPageClient({ currentLocation, initialData, initialIp = "", version }: IpFeedbackPageClientProps) {
  const [data, setData] = useState(initialData ?? EMPTY_DATA);
  const [searchInput, setSearchInput] = useState(initialIp);
  const [activeSearch, setActiveSearch] = useState(initialIp);
  const [loading, setLoading] = useState(!initialData);
  const [loadError, setLoadError] = useState("");

  const loadData = useCallback(async (pageNum: number, ip: string) => {
    setLoading(true);
    setLoadError("");
    try {
      setData(await requestFeedbackData(pageNum, ip));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "反馈记录加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialData) return;
    let cancelled = false;

    async function loadInitialData() {
      try {
        const result = await requestFeedbackData(1, initialIp);
        if (!cancelled) setData(result);
      } catch (error) {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : "反馈记录加载失败");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadInitialData();
    return () => {
      cancelled = true;
    };
  }, [initialData, initialIp]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const search = searchInput.trim();
    setActiveSearch(search);
    void loadData(1, search);
  }

  function clearSearch() {
    setSearchInput("");
    setActiveSearch("");
    void loadData(1, "");
  }

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start gap-5">
      <section className="min-w-0 space-y-3" aria-label="反馈进度列表">
        <div className="flex h-12 items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">反馈进度</h2>
          <span className="text-xs text-zinc-500 dark:text-gray-400">共 {data.total} 条</span>
        </div>
        {loadError ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-300">{loadError}</div> : null}
        {loading ? (
          <div className="flex min-h-[260px] items-center justify-center rounded-lg border border-zinc-200 bg-white dark:border-gray-700 dark:bg-gray-900">
            <LoaderCircle aria-hidden="true" className="animate-spin text-blue-600" size={24} />
          </div>
        ) : data.rows.length ? (
          <div className="space-y-3">
            {data.rows.map((item) => {
              const status = statusMeta(item.status);
              const approved = item.status === "approved";
              return (
                <article className="rounded-lg border border-zinc-200 border-l-[3px] border-l-blue-500 bg-white px-4 py-4 shadow-sm dark:border-gray-700 dark:border-l-blue-500 dark:bg-gray-900" key={item.id}>
                  <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-3 text-xs leading-6 text-zinc-600 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300">
                    <p className="break-all">
                      <span className="mr-2 text-zinc-500 dark:text-gray-400">用户提交：</span>
                      {formatRange(item.startIp, item.endIp)}
                      <ChevronsRight aria-hidden="true" className="mx-2 inline text-blue-500" size={14} />
                      {approved ? formatLocation(item.submittedLocation) : "审核前不展示位置信息，防止违规内容"}
                    </p>
                    <p className="break-all">
                      <span className="mr-2 text-zinc-500 dark:text-gray-400">实际更新：</span>
                      {approved ? (
                        <>{formatRange(item.actualStartIp, item.actualEndIp)}<ChevronsRight aria-hidden="true" className="mx-2 inline text-blue-500" size={14} />{formatLocation(item.actualLocation)}</>
                      ) : "--"}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1 text-xs text-zinc-400 dark:text-gray-500"><Clock3 aria-hidden="true" size={13} />{formatTime(item.createTime)}</span>
                    <span className={`rounded px-2 py-1 text-[11px] font-medium ${status.className}`}>{status.label}</span>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-zinc-200 bg-white text-sm text-zinc-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500">暂无匹配的反馈记录</div>
        )}
        <div className="flex h-11 items-center justify-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <button aria-label="上一页" className="inline-flex h-7 w-7 items-center justify-center rounded text-zinc-500 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-gray-300 dark:hover:bg-gray-800" disabled={loading || data.pageNum <= 1} onClick={() => void loadData(data.pageNum - 1, activeSearch)} type="button"><ChevronLeft aria-hidden="true" size={15} /></button>
          {pageNumbers(data.pageNum, totalPages).map((page) => (
            <button className={`h-7 min-w-7 rounded px-2 text-xs ${page === data.pageNum ? "bg-blue-600 text-white" : "text-zinc-600 hover:bg-zinc-100 dark:text-gray-300 dark:hover:bg-gray-800"}`} disabled={loading} key={page} onClick={() => void loadData(page, activeSearch)} type="button">{page}</button>
          ))}
          <button aria-label="下一页" className="inline-flex h-7 w-7 items-center justify-center rounded text-zinc-500 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-gray-300 dark:hover:bg-gray-800" disabled={loading || data.pageNum >= totalPages} onClick={() => void loadData(data.pageNum + 1, activeSearch)} type="button"><ChevronRight aria-hidden="true" size={15} /></button>
        </div>
      </section>

      <div className="min-w-0 space-y-4">
        <section className="grid grid-cols-2 gap-4" aria-label="近7日反馈统计">
          <div className="rounded-lg border border-blue-200 bg-white px-5 py-4 shadow-sm dark:border-blue-900/70 dark:bg-gray-900">
            <p className="text-xs text-zinc-500 dark:text-gray-400">近7日反馈的IP数量</p>
            <p className="mt-2 text-2xl font-semibold text-blue-600 dark:text-blue-400">{formatCount(data.submittedIpCount7d)}</p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-white px-5 py-4 shadow-sm dark:border-emerald-900/70 dark:bg-gray-900">
            <p className="text-xs text-zinc-500 dark:text-gray-400">近7日更新的IP数量</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{formatCount(data.updatedIpCount7d)}</p>
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-3 border-b border-zinc-200 px-5 py-4 dark:border-gray-700">
            <span className="h-5 w-1 rounded-sm bg-blue-600" />
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">反馈搜索</h2>
            <span className="text-xs text-zinc-500 dark:text-gray-400">帮助用户了解反馈的进度和结果</span>
          </div>
          <form className="flex gap-2 px-5 py-4" onSubmit={submitSearch}>
            <input className="h-10 min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-3 font-mono text-xs text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-950" onChange={(event) => setSearchInput(event.target.value)} placeholder="请输入 IPv4 或 IPv6 地址" value={searchInput} />
            <button className="inline-flex h-10 items-center gap-2 rounded bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700" type="submit"><Search aria-hidden="true" size={15} />搜索</button>
            <button aria-label="清空搜索" className="inline-flex h-10 w-10 items-center justify-center rounded bg-zinc-100 text-zinc-600 transition hover:bg-zinc-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700" onClick={clearSearch} title="清空搜索" type="button"><RotateCcw aria-hidden="true" size={15} /></button>
          </form>
        </section>

        <IpFeedbackForm currentLocation={currentLocation} initialIp={initialIp} onSubmitted={() => void loadData(1, activeSearch)} version={version} />
      </div>
    </div>
  );
}
