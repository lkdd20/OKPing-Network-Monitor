"use client";

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileImage,
  Handshake,
  Lightbulb,
  LoaderCircle,
  MessageSquareText,
  RefreshCw,
  Send,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

import type { PingIssue, PingIssueStatus, PingIssueType } from "@/lib/ping/types";

type Envelope<T> = { code?: number | string; data?: T; msg?: string };
type IssuePage = { code?: number | string; msg?: string; rows?: PingIssue[]; total?: number };
type FeedbackClientMode = "feedback" | "cooperation";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 3;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

const STATUS_META: Record<PingIssueStatus, { label: string; className: string }> = {
  pending: { label: "待处理", className: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" },
  processing: { label: "处理中", className: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" },
  resolved: { label: "已解决", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" },
  closed: { label: "已关闭", className: "bg-zinc-100 text-zinc-600 dark:bg-gray-800 dark:text-gray-300" },
};

const TYPE_META: Record<PingIssueType, { label: string; className: string }> = {
  problem: { label: "问题反馈", className: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300" },
  suggestion: { label: "意见建议", className: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300" },
  cooperation: { label: "合作", className: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300" },
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("zh-CN", { hour12: false });
}

function fileSize(size: number) {
  return size >= 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(size / 1024)} KB`;
}

export function FeedbackClient({ mode = "feedback" }: { mode?: FeedbackClientMode }) {
  const isCooperation = mode === "cooperation";
  const accountPath = isCooperation ? "/account/cooperation" : "/account/feedback";
  const HeaderIcon = isCooperation ? Handshake : MessageSquareText;
  const [issueType, setIssueType] = useState<PingIssueType>(isCooperation ? "cooperation" : "problem");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [issues, setIssues] = useState<PingIssue[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyingIssue, setReplyingIssue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const previews = useMemo(() => files.map((file) => ({ file, url: URL.createObjectURL(file) })), [files]);
  useEffect(() => () => previews.forEach((preview) => URL.revokeObjectURL(preview.url)), [previews]);

  const loadIssues = useCallback(async (nextPage: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/account/issues?pageNum=${nextPage}&pageSize=${pageSize}&category=${mode}`, { cache: "no-store" });
      const body = (await response.json().catch(() => null)) as IssuePage | null;
      if (response.status === 401) {
        window.location.assign(`/login?next=${encodeURIComponent(accountPath)}`);
        return;
      }
      if (!response.ok || !body || String(body.code) !== "200") throw new Error(body?.msg || "反馈记录加载失败");
      setIssues(body.rows ?? []);
      setTotal(body.total ?? 0);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "反馈记录加载失败");
    } finally {
      setLoading(false);
    }
  }, [accountPath, mode]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadIssues(pageNum), 0);
    return () => window.clearTimeout(timer);
  }, [loadIssues, pageNum]);

  function selectFiles(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!selected.length) return;
    const nextFiles = [...files, ...selected];
    if (nextFiles.length > MAX_FILES) {
      toast.error("最多只能上传3张截图");
      return;
    }
    const invalid = selected.find((file) => !ACCEPTED_TYPES.has(file.type) || file.size > MAX_FILE_SIZE);
    if (invalid) {
      toast.error(invalid.size > MAX_FILE_SIZE ? `${invalid.name} 超过5MB` : `${invalid.name} 不是支持的图片格式`);
      return;
    }
    setFiles(nextFiles);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      toast.error("请填写反馈标题");
      return;
    }
    if (!content.trim()) {
      toast.error(isCooperation ? "请填写合作说明" : "请填写问题描述或意见内容");
      return;
    }

    const formData = new FormData();
    formData.set("issueType", issueType);
    formData.set("title", title.trim());
    formData.set("content", content.trim());
    files.forEach((file) => formData.append("files", file));
    setSubmitting(true);
    try {
      const response = await fetch("/api/account/issues", { body: formData, method: "POST" });
      const body = (await response.json().catch(() => null)) as Envelope<number | string> | null;
      if (response.status === 401) {
        window.location.assign(`/login?next=${encodeURIComponent(accountPath)}`);
        return;
      }
      if (!response.ok || !body || String(body.code) !== "200") throw new Error(body?.msg || "反馈提交失败");
      toast.success(isCooperation ? "合作需求已提交，后续可以在这里继续沟通" : "反馈已提交，管理员处理后会在这里回复");
      setTitle("");
      setContent("");
      setFiles([]);
      if (pageNum === 1) await loadIssues(1);
      else setPageNum(1);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "反馈提交失败");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitReply(issueId: number | string) {
    const key = String(issueId);
    const reply = replyDrafts[key]?.trim() || "";
    if (!reply) {
      toast.error("请填写回复内容");
      return;
    }
    setReplyingIssue(key);
    try {
      const response = await fetch(`/api/account/issues/${encodeURIComponent(key)}/messages`, {
        body: JSON.stringify({ content: reply }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const body = (await response.json().catch(() => null)) as Envelope<number | string> | null;
      if (response.status === 401) {
        window.location.assign(`/login?next=${encodeURIComponent(accountPath)}`);
        return;
      }
      if (!response.ok || !body || String(body.code) !== "200") throw new Error(body?.msg || "回复失败");
      setReplyDrafts((current) => ({ ...current, [key]: "" }));
      toast.success(isCooperation ? "回复已提交，合作沟通记录已更新" : "回复已提交，管理员可以在原问题中继续处理");
      await loadIssues(pageNum);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "回复失败");
    } finally {
      setReplyingIssue("");
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900">
      <section>
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-5 py-4 dark:border-gray-700 sm:px-6">
          <div>
            <h1 className="flex items-center gap-2 text-lg font-semibold text-zinc-950 dark:text-zinc-100">
              <HeaderIcon aria-hidden="true" className="h-5 w-5 text-blue-600" />
              {isCooperation ? "合作沟通" : "问题反馈与意见建议"}
            </h1>
            <p className="mt-1 text-xs text-zinc-500 dark:text-gray-400">
              {isCooperation
                ? "提交商务、节点或产品合作需求，并在当前页面与管理员持续沟通"
                : "提交使用问题或产品建议，截图最多3张且单张不超过5MB"}
            </p>
          </div>
          {!isCooperation ? (
            <Link className="inline-flex h-9 items-center gap-2 border border-zinc-300 px-3 text-xs text-zinc-600 transition hover:border-blue-400 hover:text-blue-600 dark:border-gray-600 dark:text-gray-300" href="/feedback">
              查看公开问题库
              <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
            </Link>
          ) : null}
        </header>

        <form className="space-y-5 px-5 py-5 sm:px-6" onSubmit={submit}>
          {!isCooperation ? (
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-zinc-800 dark:text-gray-200">反馈类型</legend>
              <div className="inline-flex border border-zinc-300 p-1 dark:border-gray-600">
                {([
                  { value: "problem" as const, label: "问题反馈", icon: MessageSquareText },
                  { value: "suggestion" as const, label: "意见建议", icon: Lightbulb },
                ]).map(({ value, label, icon: Icon }) => (
                  <button
                    className={`inline-flex h-9 items-center gap-2 px-4 text-sm transition ${issueType === value ? "bg-blue-600 text-white" : "text-zinc-600 hover:bg-zinc-50 dark:text-gray-300 dark:hover:bg-gray-800"}`}
                    key={value}
                    onClick={() => setIssueType(value)}
                    type="button"
                  >
                    <Icon aria-hidden="true" className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-zinc-800 dark:text-gray-200">标题</span>
            <input className="h-10 w-full border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:ring-blue-950" maxLength={120} onChange={(event) => setTitle(event.target.value)} placeholder={isCooperation ? "用一句话概括合作需求" : "用一句话概括问题或建议"} required value={title} />
            <span className="mt-1 block text-right text-xs text-zinc-400">{title.length}/120</span>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-zinc-800 dark:text-gray-200">详细说明</span>
            <textarea className="min-h-40 w-full resize-y border border-zinc-300 bg-white px-3 py-3 text-sm leading-6 text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:ring-blue-950" maxLength={5000} onChange={(event) => setContent(event.target.value)} placeholder={isCooperation ? "请说明合作类型、资源、预期方式及便于沟通的补充信息" : "请描述操作步骤、实际结果、预期结果及发生时间，便于快速定位"} required value={content} />
            <span className="mt-1 block text-right text-xs text-zinc-400">{content.length}/5000</span>
          </label>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-800 dark:text-gray-200">{isCooperation ? "相关图片" : "问题截图"}</span>
              <span className="text-xs text-zinc-400">JPG / PNG / GIF / WEBP，单张最大5MB</span>
            </div>
            <input accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" multiple onChange={selectFiles} ref={fileInputRef} type="file" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {previews.map(({ file, url }, index) => (
                <div className="group relative aspect-[4/3] overflow-hidden border border-zinc-200 bg-zinc-50 dark:border-gray-700 dark:bg-gray-800" key={`${file.name}-${file.lastModified}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- Local object URLs are only used for pre-upload previews. */}
                  <img alt={file.name} className="h-full w-full object-cover" src={url} />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/65 px-2 py-1.5 text-[11px] text-white">
                    <span className="min-w-0 truncate">{file.name} · {fileSize(file.size)}</span>
                    <button aria-label={`删除 ${file.name}`} className="ml-2 shrink-0 text-white hover:text-red-300" onClick={() => setFiles((items) => items.filter((_, itemIndex) => itemIndex !== index))} title="删除截图" type="button">
                      <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {files.length < MAX_FILES ? (
                <button className="flex aspect-[4/3] flex-col items-center justify-center gap-2 border border-dashed border-zinc-300 text-xs text-zinc-500 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-blue-950/30" onClick={() => fileInputRef.current?.click()} type="button">
                  <FileImage aria-hidden="true" className="h-6 w-6" />
                  添加截图
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex justify-end border-t border-zinc-200 pt-5 dark:border-gray-700">
            <button className="inline-flex h-10 items-center gap-2 bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300" disabled={submitting} type="submit">
              {submitting ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Send aria-hidden="true" className="h-4 w-4" />}
              {submitting ? "提交中" : isCooperation ? "提交合作需求" : "提交反馈"}
            </button>
          </div>
        </form>
      </section>

      <section className="border-t-8 border-zinc-100 dark:border-gray-950">
        <header className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-gray-700 sm:px-6">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100">{isCooperation ? "我的合作沟通" : "我的反馈"}</h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-gray-400">{isCooperation ? "合作内容只有您和管理员可以查看并继续回复" : "私有问题只有您和管理员可以查看"}</p>
          </div>
          <button aria-label="刷新反馈记录" className="inline-flex h-9 w-9 items-center justify-center border border-zinc-300 text-zinc-500 hover:bg-zinc-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800" onClick={() => void loadIssues(pageNum)} title="刷新" type="button">
            <RefreshCw aria-hidden="true" className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </header>
        {loading ? <div className="flex h-32 items-center justify-center"><LoaderCircle aria-hidden="true" className="h-6 w-6 animate-spin text-zinc-400" /></div> : null}
        {!loading && !issues.length ? <div className="px-6 py-12 text-center text-sm text-zinc-500 dark:text-gray-400">{isCooperation ? "暂无合作沟通记录" : "暂无反馈记录"}</div> : null}
        {!loading ? (
          <div className="divide-y divide-zinc-200 dark:divide-gray-700">
            {issues.map((issue) => {
              const status = STATUS_META[issue.status];
              const issueTypeMeta = TYPE_META[issue.issueType];
              return (
                <article className="px-5 py-5 sm:px-6" key={String(issue.id)}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex px-2 py-1 text-xs ${issueTypeMeta.className}`}>{issueTypeMeta.label}</span>
                        <span className={`inline-flex px-2 py-1 text-xs ${status.className}`}>{status.label}</span>
                        {issue.publicVisible ? <span className="inline-flex bg-emerald-50 px-2 py-1 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">已公开</span> : null}
                      </div>
                      <h3 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{issue.title}</h3>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-600 dark:text-gray-300">{issue.content}</p>
                    </div>
                    <span className="shrink-0 text-xs text-zinc-400">{formatDate(issue.createTime)}</span>
                  </div>

                  {issue.attachments?.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {issue.attachments.map((attachment) => (
                        <a className="block h-20 w-28 overflow-hidden border border-zinc-200 bg-zinc-50 dark:border-gray-700 dark:bg-gray-800" href={attachment.url} key={String(attachment.ossId)} rel="noreferrer" target="_blank" title="打开原图">
                          {/* eslint-disable-next-line @next/next/no-img-element -- Issue images are served by the configured OSS provider. */}
                          <img alt={attachment.originalName} className="h-full w-full object-cover" src={attachment.url} />
                        </a>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-5 border-t border-zinc-200 pt-4 dark:border-gray-700">
                    <h4 className="text-xs font-medium text-zinc-500 dark:text-gray-400">沟通记录</h4>
                    {issue.messages?.length ? (
                      <div className="mt-3 space-y-3">
                        {issue.messages.map((message) => (
                          <div className={`border-l-4 px-4 py-3 ${message.senderType === "admin" ? "border-blue-500 bg-blue-50/70 dark:bg-blue-950/25" : "border-zinc-300 bg-zinc-50 dark:border-gray-600 dark:bg-gray-800/70"}`} key={String(message.id)}>
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                              <div className={`flex items-center gap-2 font-medium ${message.senderType === "admin" ? "text-blue-700 dark:text-blue-300" : "text-zinc-700 dark:text-gray-200"}`}>
                                {message.senderType === "admin" ? <CheckCircle2 aria-hidden="true" className="h-4 w-4" /> : <MessageSquareText aria-hidden="true" className="h-4 w-4" />}
                                {message.senderType === "admin" ? "管理员回复" : "我的补充"}
                                <span className="font-normal text-zinc-400">{formatDate(message.createTime)}</span>
                              </div>
                              <span className={message.publicVisible ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}>
                                {message.publicVisible ? "已允许公开" : "仅自己与管理员可见"}
                              </span>
                            </div>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-700 dark:text-gray-200">{message.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : <p className="mt-3 text-xs text-zinc-400">管理员尚未回复，您也可以继续补充信息</p>}

                    <div className="mt-4 flex items-end gap-3">
                      <label className="min-w-0 flex-1">
                        <span className="sr-only">继续回复 {issue.title}</span>
                        <textarea
                          className="min-h-20 w-full resize-y border border-zinc-300 bg-white px-3 py-2 text-sm leading-6 text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:ring-blue-950"
                          maxLength={5000}
                          onChange={(event) => setReplyDrafts((current) => ({ ...current, [String(issue.id)]: event.target.value }))}
                          placeholder="继续补充信息或回复管理员"
                          value={replyDrafts[String(issue.id)] || ""}
                        />
                      </label>
                      <button
                        className="inline-flex h-10 shrink-0 items-center gap-2 bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                        disabled={Boolean(replyingIssue)}
                        onClick={() => void submitReply(issue.id)}
                        type="button"
                      >
                        {replyingIssue === String(issue.id) ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Send aria-hidden="true" className="h-4 w-4" />}
                        回复
                      </button>
                    </div>
                  </div>

                  {!isCooperation && issue.publicVisible ? (
                    <Link className="mt-4 inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400" href={`/feedback/${issue.id}`}>
                      查看公开页面 <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                    </Link>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : null}
        <footer className="flex items-center justify-between border-t border-zinc-200 px-5 py-3 text-xs text-zinc-500 dark:border-gray-700 dark:text-gray-400 sm:px-6">
          <span>共 {total} 条</span>
          <div className="flex items-center gap-2">
            <button aria-label="上一页" className="inline-flex h-8 w-8 items-center justify-center border border-zinc-300 disabled:opacity-40 dark:border-gray-600" disabled={pageNum <= 1 || loading} onClick={() => setPageNum((value) => value - 1)} type="button"><ChevronLeft aria-hidden="true" className="h-4 w-4" /></button>
            <span>{pageNum} / {totalPages}</span>
            <button aria-label="下一页" className="inline-flex h-8 w-8 items-center justify-center border border-zinc-300 disabled:opacity-40 dark:border-gray-600" disabled={pageNum >= totalPages || loading} onClick={() => setPageNum((value) => value + 1)} type="button"><ChevronRight aria-hidden="true" className="h-4 w-4" /></button>
          </div>
        </footer>
      </section>
    </div>
  );
}
