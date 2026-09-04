"use client";

import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  LoaderCircle,
  Search,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import { buildProbeSharePath } from "@/lib/ping/target";
import type { PingAdLinks, PingResponse, PingWhois } from "@/lib/ping/types";

import { PingCenterAds } from "./PingAdSlots";
import { PingToast } from "./PingToast";

type WhoisQueryClientProps = {
  adLinks?: PingAdLinks;
  initialDomain?: string;
  initialResult?: PingWhois;
};

const WHOIS_DATE_FORMATTER = new Intl.DateTimeFormat("zh-CN", {
  day: "2-digit",
  hour: "2-digit",
  hourCycle: "h23",
  minute: "2-digit",
  month: "2-digit",
  second: "2-digit",
  timeZone: "Asia/Shanghai",
  year: "numeric",
});

function formatWhoisDate(value?: string | null) {
  if (!value) return "-";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : WHOIS_DATE_FORMATTER.format(parsed);
}

function safeExternalUrl(value?: string | null) {
  if (!value) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function StatusBadge({ status }: { status: string }) {
  const code = status.split(/\s+/, 1)[0];
  const positive = /(?:^|_)(?:ok|active)(?:$|_)/i.test(code);

  return (
    <span
      className={`inline-flex max-w-full items-center rounded border px-2 py-1 text-xs font-medium ${
        positive
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
          : "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
      }`}
      title={status}
    >
      <span className="break-all">{code}</span>
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <tr className="border-b border-zinc-200 last:border-b-0 dark:border-gray-700">
      <th className="w-40 border-r border-zinc-200 bg-zinc-50 px-5 py-3 text-right text-xs font-medium text-zinc-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
        {label}
      </th>
      <td className="break-words px-6 py-3 text-xs leading-6 text-zinc-800 dark:text-gray-200">
        {value || "-"}
      </td>
    </tr>
  );
}

export function WhoisQueryClient({ adLinks, initialDomain = "", initialResult }: WhoisQueryClientProps) {
  const [domain, setDomain] = useState(initialResult?.domain || initialDomain);
  const [result, setResult] = useState<PingWhois | null>(initialResult ?? null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rawExpanded, setRawExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const host = domain.trim();
    if (!host || loading) {
      if (!host) setError("请输入要查询的域名");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setRawExpanded(false);

    try {
      const response = await fetch("/api/ping/whois", {
        body: JSON.stringify({ host }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const body = (await response.json().catch(() => null)) as PingResponse<PingWhois> | null;
      if (!response.ok || !body?.data) {
        throw new Error(body?.msg || body?.message || "WHOIS查询失败");
      }

      setDomain(body.data.domain);
      setResult(body.data);
      window.history.replaceState(null, "", buildProbeSharePath("/whois", body.data.domain));
    } catch (queryError) {
      setError(queryError instanceof Error ? queryError.message : "WHOIS查询失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!result?.rawWhois) return;
    try {
      await copyText(result.rawWhois);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2_000);
    } catch {
      setError("复制失败，请手动选择完整WHOIS信息");
    }
  }

  const registrarUrl = safeExternalUrl(result?.registrarUrl);

  return (
    <div className="space-y-5">
      <PingToast message={error} onClose={() => setError("")} />
      <section className="rounded-lg border border-zinc-200 bg-white px-6 py-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <form className="mx-auto flex w-[60%] min-w-[720px] items-center gap-3" onSubmit={handleSubmit}>
          <div className="relative min-w-0 flex-1">
            <input
              aria-label="WHOIS查询域名"
              className="h-11 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 pr-10 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-500 dark:focus:bg-gray-800 dark:focus:ring-blue-950"
              onChange={(event) => setDomain(event.target.value)}
              placeholder="请输入域名，例如：example.com"
              value={domain}
            />
            {domain ? (
              <button
                aria-label="清空域名"
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                onClick={() => {
                  setDomain("");
                  setResult(null);
                  setError("");
                  window.history.replaceState(null, "", "/whois");
                }}
                title="清空"
                type="button"
              >
                <X aria-hidden="true" size={16} />
              </button>
            ) : null}
          </div>
          <button
            className="inline-flex h-11 min-w-28 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 dark:disabled:bg-blue-900"
            disabled={loading}
            type="submit"
          >
            {loading ? <LoaderCircle aria-hidden="true" className="animate-spin" size={17} /> : <Search aria-hidden="true" size={17} />}
            {loading ? "查询中" : "开始查询"}
          </button>
        </form>
      </section>

      <PingCenterAds ads={adLinks} />

      {result ? (
        <>
          <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <header className="border-b border-zinc-200 bg-zinc-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-gray-100">{result.domain} 的 WHOIS 信息</h2>
            </header>
            <table className="w-full table-fixed border-collapse">
              <tbody>
                <InfoRow label="域名" value={result.domain} />
                <InfoRow label="注册商" value={result.registrar} />
                <InfoRow
                  label="注册商网址"
                  value={registrarUrl ? (
                    <a
                      className="inline-flex max-w-full items-center gap-1 break-all text-blue-600 hover:underline dark:text-blue-400"
                      href={registrarUrl}
                      rel="noreferrer noopener"
                      target="_blank"
                    >
                      {result.registrarUrl}
                      <ExternalLink aria-hidden="true" className="shrink-0" size={13} />
                    </a>
                  ) : result.registrarUrl}
                />
                <InfoRow label="注册机构" value={result.registrantOrg} />
                <InfoRow label="注册邮箱" value={result.registrantEmail} />
                <InfoRow label="域名服务器" value={result.whoisServer} />
                <InfoRow label="注册时间" value={formatWhoisDate(result.creationDate)} />
                <InfoRow label="到期时间" value={formatWhoisDate(result.expirationDate)} />
                <InfoRow label="更新时间" value={formatWhoisDate(result.updatedDate)} />
                <InfoRow
                  label="DNS服务器"
                  value={result.nameServers.length ? (
                    <div className="space-y-1">
                      {result.nameServers.map((server) => <div className="break-all" key={server}>{server}</div>)}
                    </div>
                  ) : undefined}
                />
                <InfoRow
                  label="域名状态"
                  value={result.statuses.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {result.statuses.map((status) => <StatusBadge key={status} status={status} />)}
                    </div>
                  ) : undefined}
                />
                <InfoRow label="DNSSEC" value={result.dnssec} />
              </tbody>
            </table>
          </section>

          <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-zinc-50 px-6 dark:border-gray-700 dark:bg-gray-800">
              <button
                aria-expanded={rawExpanded}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-900 transition hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
                onClick={() => setRawExpanded((expanded) => !expanded)}
                type="button"
              >
                完整WHOIS信息
                {rawExpanded ? <ChevronUp aria-hidden="true" size={16} /> : <ChevronDown aria-hidden="true" size={16} />}
              </button>
              <button
                className="inline-flex h-8 items-center gap-1.5 rounded border border-zinc-200 bg-white px-3 text-xs text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:text-white"
                onClick={handleCopy}
                type="button"
              >
                {copied ? <Check aria-hidden="true" size={14} /> : <Copy aria-hidden="true" size={14} />}
                {copied ? "已复制" : "复制"}
              </button>
            </header>
            {rawExpanded ? (
              <pre className="max-h-[600px] overflow-auto whitespace-pre-wrap break-words bg-zinc-50 px-6 py-5 font-mono text-xs leading-6 text-zinc-700 dark:bg-gray-950 dark:text-gray-300">
                {result.rawWhois}
              </pre>
            ) : null}
          </section>
        </>
      ) : null}
    </div>
  );
}
