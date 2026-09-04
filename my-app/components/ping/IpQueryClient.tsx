"use client";

import type { FormEvent, KeyboardEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, LoaderCircle, Search, X } from "lucide-react";
import { toPng } from "html-to-image";

import { buildProbeSharePath } from "@/lib/ping/target";
import type { PingAdLinks, PingIpInfo, PingResponse } from "@/lib/ping/types";

import { IpInfoResult } from "./IpInfoResult";
import { PingCenterAds } from "./PingAdSlots";
import { PingToast } from "./PingToast";

function isIPv4(value: string) {
  const parts = value.split(".");
  return parts.length === 4 && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}

function isLikelyIp(value: string) {
  return isIPv4(value) || (value.includes(":") && /^[\da-f:]+$/i.test(value));
}

async function queryIp(ip: string) {
  const response = await fetch("/api/ping/ip-info", {
    body: JSON.stringify({ ip }),
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const body = (await response.json().catch(() => null)) as PingResponse<PingIpInfo> | null;
  const code = typeof body?.code === "string" ? Number(body.code) : body?.code;
  if (!response.ok || code !== 200 || !body?.data) {
    throw new Error(body?.msg || body?.message || "IP信息查询失败");
  }
  return body.data;
}

export function IpQueryClient({
  adLinks,
  initialIp = "",
  initialResult,
}: {
  adLinks?: PingAdLinks;
  initialIp?: string;
  initialResult?: PingIpInfo;
}) {
  const [ip, setIp] = useState(initialIp);
  const [result, setResult] = useState(initialResult);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [snapshotting, setSnapshotting] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const runQuery = useCallback(async (target: string, updateUrl: boolean) => {
    const normalized = target.trim().replace(/^\[|\]$/g, "");
    if (!normalized) {
      setError("请输入IP地址");
      inputRef.current?.focus();
      return;
    }
    if (!isLikelyIp(normalized)) {
      setError("IP地址格式不正确，请输入IPv4或IPv6地址");
      inputRef.current?.focus();
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await queryIp(normalized);
      setIp(data.ip);
      setResult(data);
      if (updateUrl) {
        window.history.pushState(null, "", buildProbeSharePath("/ip", data.ip));
      }
    } catch (queryError) {
      setResult(undefined);
      setError(queryError instanceof Error ? queryError.message : "IP信息查询失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialIp || initialResult) return;
    let cancelled = false;
    fetch("/api/ping/ip-info/client", { cache: "no-store" })
      .then(async (response) => {
        const body = (await response.json().catch(() => null)) as PingResponse<string> | null;
        if (!response.ok || !body?.data) return;
        if (!cancelled) {
          setIp(body.data);
          await runQuery(body.data, false);
        }
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [initialIp, initialResult, runQuery]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runQuery(ip, true);
  }

  function inputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && event.nativeEvent.isComposing) {
      event.preventDefault();
    }
  }

  function clear() {
    setIp("");
    setResult(undefined);
    setError("");
    window.history.replaceState(null, "", "/ip");
    inputRef.current?.focus();
  }

  async function screenshot() {
    if (!captureRef.current || snapshotting) return;
    setSnapshotting(true);
    setError("");
    try {
      const dataUrl = await toPng(captureRef.current, {
        backgroundColor: document.documentElement.classList.contains("dark") ? "#030712" : "#f6f7f9",
        cacheBust: true,
        pixelRatio: 1,
        quality: 1,
      });
      const link = document.createElement("a");
      link.download = `${result?.ip || "ip"}_ping_ip查询.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      setError("截图生成失败，请稍后重试");
    } finally {
      setSnapshotting(false);
    }
  }

  return (
    <div ref={captureRef} className="space-y-5">
      <PingToast message={error} onClose={() => setError("")} />
      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="border-b border-zinc-200 px-5 py-4 dark:border-gray-700">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">IP 查询</h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-gray-400">查询 IPv4 / IPv6 地理位置、ASN、网络属性与风险信息</p>
        </div>
        <form className="flex items-center gap-3 px-5 py-5" onSubmit={submit}>
          <div className="relative min-w-0 flex-1">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={17} />
            <input
              autoComplete="off"
              className="h-11 w-full rounded-lg border border-zinc-300 bg-zinc-50 pl-10 pr-10 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100 dark:focus:border-blue-500 dark:focus:bg-gray-900 dark:focus:ring-blue-950"
              maxLength={64}
              onChange={(event) => setIp(event.target.value)}
              onKeyDown={inputKeyDown}
              placeholder="请输入IP地址，例如：8.8.8.8 或 2001:4860:4860::8888"
              ref={inputRef}
              spellCheck={false}
              value={ip}
            />
            {ip ? <button aria-label="清空IP地址" className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-gray-800 dark:hover:text-gray-200" onClick={clear} title="清空" type="button"><X aria-hidden="true" size={15} /></button> : null}
          </div>
          <button className="inline-flex h-11 min-w-28 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 dark:disabled:bg-blue-900" disabled={loading} type="submit">
            {loading ? <LoaderCircle aria-hidden="true" className="animate-spin" size={16} /> : <Search aria-hidden="true" size={16} />}
            {loading ? "查询中" : "立即查询"}
          </button>
          <button className="inline-flex h-11 min-w-28 items-center justify-center gap-2 rounded-lg bg-zinc-700 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400 dark:bg-gray-600 dark:hover:bg-gray-500" disabled={snapshotting || !result} onClick={() => void screenshot()} title="生成当前查询结果截图" type="button">
            {snapshotting ? <LoaderCircle aria-hidden="true" className="animate-spin" size={16} /> : <Camera aria-hidden="true" size={16} />}
            {snapshotting ? "生成中" : "完整截图"}
          </button>
        </form>
      </section>

      <PingCenterAds ads={adLinks} />

      {loading ? <div className="flex min-h-[280px] items-center justify-center rounded-lg border border-zinc-200 bg-white dark:border-gray-700 dark:bg-gray-900"><div className="text-center"><LoaderCircle aria-hidden="true" className="mx-auto animate-spin text-blue-600 dark:text-blue-400" size={30} /><p className="mt-3 text-xs text-zinc-500 dark:text-gray-400">正在获取IP信息</p></div></div> : null}
      {!loading && result ? <IpInfoResult result={result} /> : null}
      {!loading && !result && !error ? <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white text-sm text-zinc-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500">输入IP地址后开始查询</div> : null}
    </div>
  );
}
