"use client";

import { ChevronLeft, ChevronRight, Laptop, LoaderCircle, LogOut, MonitorSmartphone, RefreshCw, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import type { AccountLoginLog, AccountSession } from "@/lib/auth/account";
import { resetCachedAccountPreferences } from "@/lib/auth/preferencesClient";

type Envelope<T> = { code?: number | string; data?: T; msg?: string };
type LogPage = { code?: number | string; msg?: string; rows?: AccountLoginLog[]; total?: number };

function formatDate(value?: number | string | null) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("zh-CN", { hour12: false });
}

function deviceName(session: Pick<AccountSession, "browser" | "os" | "deviceType">) {
  return [session.os, session.browser].filter(Boolean).join(" / ") || session.deviceType || "未知设备";
}

export function SecurityClient() {
  const [sessions, setSessions] = useState<AccountSession[]>([]);
  const [logs, setLogs] = useState<AccountLoginLog[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [kicking, setKicking] = useState("");
  const [error, setError] = useState("");
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const loadSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const response = await fetch("/api/account/sessions", { cache: "no-store" });
      const body = (await response.json().catch(() => null)) as Envelope<AccountSession[]> | null;
      if (response.status === 401) {
        window.location.assign("/login?next=/account/security");
        return;
      }
      if (!response.ok || !body?.data || String(body.code) !== "200") throw new Error(body?.msg || "登录设备加载失败");
      setSessions(body.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "登录设备加载失败");
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  const loadLogs = useCallback(async (nextPage: number) => {
    setLoadingLogs(true);
    try {
      const response = await fetch(`/api/account/login-logs?pageNum=${nextPage}&pageSize=${pageSize}`, { cache: "no-store" });
      const body = (await response.json().catch(() => null)) as LogPage | null;
      if (response.status === 401) {
        window.location.assign("/login?next=/account/security");
        return;
      }
      if (!response.ok || !body || String(body.code) !== "200") throw new Error(body?.msg || "登录日志加载失败");
      setLogs(body.rows ?? []);
      setTotal(body.total ?? 0);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "登录日志加载失败");
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadSessions(), 0);
    return () => window.clearTimeout(timer);
  }, [loadSessions]);
  useEffect(() => {
    const timer = window.setTimeout(() => void loadLogs(pageNum), 0);
    return () => window.clearTimeout(timer);
  }, [loadLogs, pageNum]);

  async function kick(session: AccountSession) {
    const prompt = session.current ? "下线当前设备后需要重新登录，确定继续吗？" : `确定让 ${deviceName(session)} 下线吗？`;
    if (!window.confirm(prompt)) return;
    setKicking(session.sessionKey);
    setError("");
    try {
      const response = await fetch(`/api/account/sessions/${encodeURIComponent(session.sessionKey)}`, { method: "DELETE" });
      const body = (await response.json().catch(() => null)) as Envelope<{ currentSession?: boolean }> | null;
      if (!response.ok || !body || String(body.code) !== "200") throw new Error(body?.msg || "设备下线失败");
      if (body.data?.currentSession) {
        resetCachedAccountPreferences();
        window.dispatchEvent(new Event("ping-auth-changed"));
        window.location.assign("/login");
        return;
      }
      await loadSessions();
    } catch (kickError) {
      setError(kickError instanceof Error ? kickError.message : "设备下线失败");
    } finally {
      setKicking("");
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900">
      <section>
        <header className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-gray-700 sm:px-6">
          <div>
            <h1 className="flex items-center gap-2 text-lg font-semibold text-zinc-950 dark:text-zinc-100"><MonitorSmartphone aria-hidden="true" className="h-5 w-5 text-blue-600" />登录设备</h1>
            <p className="mt-1 text-xs text-zinc-500 dark:text-gray-400">管理当前账号仍然有效的登录会话</p>
          </div>
          <button aria-label="刷新登录设备" className="inline-flex h-9 w-9 items-center justify-center border border-zinc-300 text-zinc-500 hover:bg-zinc-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800" onClick={() => void loadSessions()} title="刷新" type="button">
            <RefreshCw aria-hidden="true" className={`h-4 w-4 ${loadingSessions ? "animate-spin" : ""}`} />
          </button>
        </header>
        {error ? <div className="border-b border-red-200 bg-red-50 px-6 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</div> : null}
        <div className="divide-y divide-zinc-200 dark:divide-gray-700">
          {loadingSessions ? <div className="flex h-28 items-center justify-center"><LoaderCircle aria-hidden="true" className="h-6 w-6 animate-spin text-zinc-400" /></div> : null}
          {!loadingSessions && !sessions.length ? <p className="px-6 py-8 text-center text-sm text-zinc-500 dark:text-gray-400">暂无在线设备</p> : null}
          {sessions.map((session) => (
            <div className="grid gap-4 px-5 py-4 sm:grid-cols-[minmax(180px,1.2fr)_minmax(150px,1fr)_170px_auto] sm:items-center sm:px-6" key={session.sessionKey}>
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-zinc-100 text-zinc-600 dark:bg-gray-800 dark:text-gray-300"><Laptop aria-hidden="true" className="h-4 w-4" /></div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{deviceName(session)}</p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-gray-400">{session.deviceType || session.clientKey || "网页登录"}</p>
                </div>
              </div>
              <div className="text-xs leading-5 text-zinc-600 dark:text-gray-300"><p>{session.ipaddr || "未知 IP"}</p><p className="text-zinc-400 dark:text-gray-500">{session.loginLocation || "未知地点"}</p></div>
              <div className="text-xs text-zinc-500 dark:text-gray-400">登录于 {formatDate(session.loginTime)}</div>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                {session.current ? <span className="inline-flex items-center bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">当前设备</span> : <span />}
                <button className="inline-flex h-8 items-center gap-1.5 border border-red-200 px-2.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40" disabled={Boolean(kicking)} onClick={() => void kick(session)} type="button">
                  {kicking === session.sessionKey ? <LoaderCircle aria-hidden="true" className="h-3.5 w-3.5 animate-spin" /> : <LogOut aria-hidden="true" className="h-3.5 w-3.5" />}
                  下线
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t-8 border-zinc-100 dark:border-gray-950">
        <header className="border-b border-zinc-200 px-5 py-4 dark:border-gray-700 sm:px-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-950 dark:text-zinc-100"><ShieldCheck aria-hidden="true" className="h-5 w-5 text-emerald-600" />个人登录日志</h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-gray-400">这里只显示当前账号的个人登录记录</p>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] border-collapse text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-500 dark:bg-gray-800 dark:text-gray-400"><tr><th className="px-4 py-3 font-medium">时间</th><th className="px-4 py-3 font-medium">状态</th><th className="px-4 py-3 font-medium">设备</th><th className="px-4 py-3 font-medium">IP / 地点</th><th className="px-4 py-3 font-medium">说明</th></tr></thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-gray-700">
              {loadingLogs ? <tr><td className="px-4 py-10 text-center text-zinc-400" colSpan={5}><LoaderCircle aria-hidden="true" className="mx-auto h-6 w-6 animate-spin" /></td></tr> : null}
              {!loadingLogs && !logs.length ? <tr><td className="px-4 py-10 text-center text-zinc-500" colSpan={5}>暂无登录日志</td></tr> : null}
              {!loadingLogs && logs.map((log) => (
                <tr className="text-zinc-700 dark:text-gray-200" key={log.id}>
                  <td className="whitespace-nowrap px-4 py-3">{formatDate(log.loginTime)}</td>
                  <td className="px-4 py-3"><span className={`inline-flex px-2 py-1 ${log.status === "0" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" : "bg-zinc-100 text-zinc-600 dark:bg-gray-800 dark:text-gray-300"}`}>{log.status === "0" ? "成功" : "记录"}</span></td>
                  <td className="px-4 py-3">{[log.os, log.browser].filter(Boolean).join(" / ") || log.deviceType || "-"}</td>
                  <td className="px-4 py-3"><p>{log.ipaddr || "-"}</p><p className="mt-1 text-zinc-400">{log.loginLocation || "-"}</p></td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-gray-400">{log.message || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer className="flex items-center justify-between border-t border-zinc-200 px-5 py-3 text-xs text-zinc-500 dark:border-gray-700 dark:text-gray-400 sm:px-6">
          <span>共 {total} 条</span>
          <div className="flex items-center gap-2">
            <button aria-label="上一页" className="inline-flex h-8 w-8 items-center justify-center border border-zinc-300 disabled:opacity-40 dark:border-gray-600" disabled={pageNum <= 1 || loadingLogs} onClick={() => setPageNum((value) => value - 1)} type="button"><ChevronLeft aria-hidden="true" className="h-4 w-4" /></button>
            <span>{pageNum} / {totalPages}</span>
            <button aria-label="下一页" className="inline-flex h-8 w-8 items-center justify-center border border-zinc-300 disabled:opacity-40 dark:border-gray-600" disabled={pageNum >= totalPages || loadingLogs} onClick={() => setPageNum((value) => value + 1)} type="button"><ChevronRight aria-hidden="true" className="h-4 w-4" /></button>
          </div>
        </footer>
      </section>
    </div>
  );
}
