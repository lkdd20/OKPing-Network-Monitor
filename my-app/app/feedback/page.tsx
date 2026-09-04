import { CheckCircle2, Clock3, Handshake, Lightbulb, MessageSquareText, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { FeedbackPagination } from "@/components/ping/FeedbackPagination";
import { PingShell } from "@/components/ping/PingShell";
import { fetchPublicIssues, fetchPublicLayoutConfig } from "@/lib/ping/server";
import type { PingIssueStatus, PingIssueType, PingPublicIssuePage } from "@/lib/ping/types";

export const metadata: Metadata = {
  alternates: { canonical: "/feedback" },
  description: "搜索okping.net用户已公开的问题反馈、意见建议与管理员解决方案。",
  title: "问题反馈与解决方案 - Ping",
};

type FeedbackPageProps = {
  searchParams: Promise<{ keyword?: string | string[]; page?: string | string[] }>;
};

const EMPTY_PAGE: PingPublicIssuePage = { pageNum: 1, pageSize: 10, rows: [], total: 0 };

const STATUS_META: Record<PingIssueStatus, { label: string; className: string }> = {
  pending: { label: "待处理", className: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" },
  processing: { label: "处理中", className: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" },
  resolved: { label: "已解决", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" },
  closed: { label: "已关闭", className: "bg-zinc-100 text-zinc-600 dark:bg-gray-800 dark:text-gray-300" },
};

const TYPE_META: Record<PingIssueType, { label: string; className: string; icon: typeof MessageSquareText }> = {
  problem: {
    label: "问题反馈",
    className: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
    icon: MessageSquareText,
  },
  suggestion: {
    label: "意见建议",
    className: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
    icon: Lightbulb,
  },
  cooperation: {
    label: "合作",
    className: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300",
    icon: Handshake,
  },
};

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function safePage(value?: string) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium" }).format(date);
}

export default async function FeedbackPage({ searchParams }: FeedbackPageProps) {
  const query = await searchParams;
  const keyword = firstParam(query.keyword)?.trim().slice(0, 80) || "";
  const page = safePage(firstParam(query.page));
  const [layoutConfig, issueData] = await Promise.all([
    fetchPublicLayoutConfig("default").catch(() => undefined),
    fetchPublicIssues({ keyword, pageNum: page, pageSize: 10 }).catch(() => ({ ...EMPTY_PAGE, pageNum: page })),
  ]);

  return (
    <PingShell activePath="/feedback" layoutConfig={layoutConfig}>
      <div className="border-b border-zinc-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex h-28 max-w-7xl items-center justify-between px-6">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-100">问题反馈与解决方案</h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-gray-400">先搜索已有问题，快速找到管理员确认的处理方法</p>
          </div>
          <Link className="inline-flex h-10 items-center gap-2 bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700" href="/account/feedback">
            <MessageSquareText aria-hidden="true" className="h-4 w-4" />提交反馈
          </Link>
        </div>
      </div>

      <main className="mx-auto w-full max-w-6xl px-6 py-7">
        <form action="/feedback" className="flex items-center gap-3" method="get">
          <div className="relative w-[620px] max-w-full">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input className="h-10 w-full border border-zinc-300 bg-white pl-10 pr-4 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:ring-blue-950" defaultValue={keyword} maxLength={80} name="keyword" placeholder="搜索问题标题、描述或管理员回复" type="search" />
          </div>
          <button className="inline-flex h-10 items-center gap-2 bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-700" type="submit"><Search aria-hidden="true" className="h-4 w-4" />搜索</button>
          {keyword ? <Link className="text-sm text-zinc-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400" href="/feedback">清除</Link> : null}
        </form>

        <div className="mt-6 border border-zinc-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3 dark:border-gray-800">
            <span className="text-sm font-medium text-zinc-800 dark:text-gray-200">{keyword ? `“${keyword}” 的搜索结果` : "已公开问题"}</span>
            <span className="text-xs text-zinc-400">{issueData.total} 条</span>
          </div>
          {issueData.rows.length ? (
            <div className="divide-y divide-zinc-200 dark:divide-gray-800">
              {issueData.rows.map((issue) => {
                const status = STATUS_META[issue.status];
                const issueType = TYPE_META[issue.issueType];
                const IssueTypeIcon = issueType.icon;
                const hasAdminReply = issue.messages?.some((message) => message.senderType === "admin");
                return (
                  <article className="px-5 py-5 transition hover:bg-zinc-50 dark:hover:bg-gray-800/60" key={String(issue.id)}>
                    <div className="flex items-start justify-between gap-5">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex px-2 py-1 text-xs ${issueType.className}`}>
                            <IssueTypeIcon aria-hidden="true" className="mr-1 h-3.5 w-3.5" />
                            {issueType.label}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs ${status.className}`}>{status.label}</span>
                          {hasAdminReply ? <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400"><CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />已有管理员回复</span> : null}
                        </div>
                        <Link className="mt-3 block text-base font-semibold text-zinc-900 transition hover:text-blue-600 dark:text-zinc-100 dark:hover:text-blue-400" href={`/feedback/${issue.id}`}>{issue.title}</Link>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500 dark:text-gray-400">{issue.content}</p>
                      </div>
                      <div className="shrink-0 text-right text-xs text-zinc-400">
                        <div className="inline-flex items-center gap-1"><Clock3 aria-hidden="true" className="h-3.5 w-3.5" />{formatDate(issue.createTime)}</div>
                        <p className="mt-2">{issue.authorName}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-64 items-center justify-center text-sm text-zinc-500 dark:text-gray-400">
              {keyword ? "没有找到相关公开问题，可以提交新的反馈" : "暂无公开问题"}
            </div>
          )}
        </div>

        <FeedbackPagination currentPage={issueData.pageNum} keyword={keyword} pageSize={issueData.pageSize} total={issueData.total} />
      </main>
    </PingShell>
  );
}
