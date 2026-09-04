import { CalendarDays, CheckCircle2, ChevronLeft, Clock3, Handshake, Lightbulb, MessageSquareText, UserRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

import { PingShell } from "@/components/ping/PingShell";
import { fetchPublicIssue, fetchPublicLayoutConfig } from "@/lib/ping/server";
import type { PingIssueStatus, PingIssueType } from "@/lib/ping/types";

type FeedbackDetailPageProps = {
  params: Promise<{ id: string }>;
};

const getIssue = cache((id: string) => fetchPublicIssue(id));

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

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("zh-CN", { hour12: false });
}

export async function generateMetadata({ params }: FeedbackDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return { robots: { index: false, follow: false }, title: "问题不存在 - Ping" };
  try {
    const issue = await getIssue(id);
    return {
      alternates: { canonical: `/feedback/${issue.id}` },
      description: issue.content.slice(0, 150),
      title: `${issue.title} - Ping问题反馈`,
    };
  } catch {
    return { robots: { index: false, follow: false }, title: "问题不存在 - Ping" };
  }
}

export default async function FeedbackDetailPage({ params }: FeedbackDetailPageProps) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const [issue, layoutConfig] = await Promise.all([
    getIssue(id).catch(() => null),
    fetchPublicLayoutConfig("default").catch(() => undefined),
  ]);
  if (!issue) notFound();
  const status = STATUS_META[issue.status];
  const issueType = TYPE_META[issue.issueType];
  const IssueTypeIcon = issueType.icon;

  return (
    <PingShell activePath="/feedback" layoutConfig={layoutConfig}>
      <main className="mx-auto w-full max-w-5xl px-6 py-8">
        <nav aria-label="面包屑" className="flex items-center gap-2 text-xs text-zinc-500 dark:text-gray-400">
          <Link className="hover:text-blue-600 dark:hover:text-blue-400" href="/">首页</Link><span>/</span>
          <Link className="hover:text-blue-600 dark:hover:text-blue-400" href="/feedback">问题反馈</Link><span>/</span>
          <span className="max-w-xl truncate text-zinc-700 dark:text-gray-200">{issue.title}</span>
        </nav>

        <article className="mt-6 border border-zinc-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <header className="border-b border-zinc-200 px-6 py-6 dark:border-gray-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center px-2 py-1 text-xs ${issueType.className}`}>
                <IssueTypeIcon aria-hidden="true" className="mr-1 h-3.5 w-3.5" />
                {issueType.label}
              </span>
              <span className={`inline-flex px-2 py-1 text-xs ${status.className}`}>{status.label}</span>
              <span className="text-xs text-zinc-400">#{issue.id}</span>
            </div>
            <h1 className="mt-4 text-2xl font-semibold leading-9 text-zinc-950 dark:text-zinc-100">{issue.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-5 text-xs text-zinc-500 dark:text-gray-400">
              <span className="inline-flex items-center gap-1.5"><UserRound aria-hidden="true" className="h-3.5 w-3.5" />{issue.authorName}</span>
              <span className="inline-flex items-center gap-1.5"><CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />{formatDate(issue.createTime)}</span>
            </div>
          </header>

          <div className="px-6 py-6">
            <div className="whitespace-pre-wrap text-sm leading-7 text-zinc-700 dark:text-gray-200">{issue.content}</div>
            {issue.attachments?.length ? (
              <div className="mt-6 grid grid-cols-3 gap-3">
                {issue.attachments.map((attachment) => (
                  <a className="block aspect-[4/3] overflow-hidden border border-zinc-200 bg-zinc-50 dark:border-gray-700 dark:bg-gray-800" href={attachment.url} key={String(attachment.ossId)} rel="noreferrer" target="_blank" title="打开原图">
                    {/* eslint-disable-next-line @next/next/no-img-element -- Public issue screenshots are served by the configured OSS provider. */}
                    <img alt={attachment.originalName} className="h-full w-full object-cover" src={attachment.url} />
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <section className="border-t-8 border-zinc-100 dark:border-gray-950">
            <div className="border-b border-zinc-200 px-6 py-4 dark:border-gray-800">
              <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100"><MessageSquareText aria-hidden="true" className="h-5 w-5 text-blue-600" />公开沟通记录</h2>
            </div>
            {issue.messages?.length ? (
              <div className="space-y-4 px-6 py-6">
                {issue.messages.map((message) => {
                  const isAdmin = message.senderType === "admin";
                  return (
                    <div
                      className={`border-l-4 px-5 py-4 ${isAdmin ? "border-blue-500 bg-blue-50/70 dark:bg-blue-950/25" : "border-zinc-300 bg-zinc-50 dark:border-gray-600 dark:bg-gray-800/70"}`}
                      key={String(message.id)}
                    >
                      <div className={`flex flex-wrap items-center gap-2 text-xs font-medium ${isAdmin ? "text-blue-700 dark:text-blue-300" : "text-zinc-700 dark:text-gray-200"}`}>
                        {isAdmin ? <CheckCircle2 aria-hidden="true" className="h-4 w-4" /> : <UserRound aria-hidden="true" className="h-4 w-4" />}
                        <span>{isAdmin ? "管理员回复" : "用户补充"}</span>
                        <span className="font-normal text-zinc-400">{message.senderName}</span>
                        <span className="inline-flex items-center gap-1 font-normal text-zinc-400"><Clock3 aria-hidden="true" className="h-3.5 w-3.5" />{formatDate(message.createTime)}</span>
                      </div>
                      <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-700 dark:text-gray-200">{message.content}</div>
                    </div>
                  );
                })}
              </div>
            ) : <div className="px-6 py-10 text-center text-sm text-zinc-500 dark:text-gray-400">暂无公开的后续沟通记录</div>}
          </section>
        </article>

        <div className="mt-6 flex items-center justify-between">
          <Link className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400" href="/feedback"><ChevronLeft aria-hidden="true" className="h-4 w-4" />返回问题列表</Link>
          <Link className="inline-flex h-9 items-center gap-2 bg-blue-600 px-4 text-sm text-white hover:bg-blue-700" href="/account/feedback"><MessageSquareText aria-hidden="true" className="h-4 w-4" />提交新反馈</Link>
        </div>
      </main>
    </PingShell>
  );
}
