"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { LoaderCircle, RotateCcw, Send } from "lucide-react";

import { PingToast } from "./PingToast";

type IpVersion = "ipv4" | "ipv6";

type IpFeedbackFormProps = {
  currentLocation?: string | null;
  initialIp?: string;
  onSubmitted?: () => void;
  version: IpVersion;
};

function formatLocation(value?: string | null) {
  return value?.split("|").filter(Boolean).join(" / ") || "未识别";
}

function getMessage(value: unknown) {
  if (!value || typeof value !== "object") return "提交失败，请稍后重试。";
  const body = value as { message?: unknown; msg?: unknown };
  return typeof body.msg === "string" ? body.msg : typeof body.message === "string" ? body.message : "提交失败，请稍后重试。";
}

export function IpFeedbackForm({ currentLocation, initialIp = "", onSubmitted, version }: IpFeedbackFormProps) {
  const [selectedVersion, setSelectedVersion] = useState<IpVersion>(version);
  const [startIp, setStartIp] = useState(initialIp);
  const [endIp, setEndIp] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function clearForm() {
    setStartIp("");
    setEndIp("");
    setLocation("");
    setError("");
    setSuccess("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const safeStartIp = startIp.trim();
    const safeEndIp = endIp.trim();
    const safeLocation = location.trim();
    if (!safeStartIp || !safeLocation) {
      setError("请填写起始 IP 和地理位置。");
      return;
    }

    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/ping/ip-feedback", {
        body: JSON.stringify({
          endIp: safeEndIp || safeStartIp,
          ipVersion: selectedVersion,
          location: safeLocation,
          startIp: safeStartIp,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const body = (await response.json().catch(() => null)) as { code?: number | string; message?: string; msg?: string } | null;
      const code = typeof body?.code === "string" ? Number(body.code) : body?.code;
      if (!response.ok || (typeof code === "number" && code !== 200)) {
        throw new Error(getMessage(body));
      }
      setSuccess("感谢您的反馈，管理员审核通过后才会应用到前台归属地结果。");
      onSubmitted?.();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "提交失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  }

  const rowClass = "grid grid-cols-[100px_minmax(0,1fr)] items-center gap-3 px-5 py-4";

  return (
    <>
      <PingToast
        message={error || success}
        onClose={() => {
          setError("");
          setSuccess("");
        }}
        variant={error ? "error" : "success"}
      />
      <form className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900" onSubmit={(event) => void submit(event)}>
      <div className="flex items-center border-b border-zinc-200 px-5 py-4 dark:border-gray-700">
        <span className="mr-3 h-5 w-1 rounded-sm bg-blue-600" />
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">反馈填写</h2>
      </div>
      <ul className="divide-y divide-zinc-100 text-sm dark:divide-gray-800">
        <li className={rowClass}>
          <span className="text-zinc-500 dark:text-gray-400">IP 类型</span>
          <div className="flex items-center gap-8">
            <label className="inline-flex cursor-pointer items-center gap-2 text-zinc-700 dark:text-gray-200">
              <input checked={selectedVersion === "ipv4"} className="h-4 w-4 accent-blue-600" name="ipVersion" onChange={() => setSelectedVersion("ipv4")} type="radio" /> IPv4
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 text-zinc-700 dark:text-gray-200">
              <input checked={selectedVersion === "ipv6"} className="h-4 w-4 accent-blue-600" name="ipVersion" onChange={() => setSelectedVersion("ipv6")} type="radio" /> IPv6
            </label>
          </div>
        </li>
        <li className={rowClass}>
          <label className="text-zinc-500 dark:text-gray-400" htmlFor="feedback-start-ip">起始 IP</label>
          <input autoComplete="off" className="h-9 min-w-0 rounded-md border border-zinc-300 bg-white px-3 font-mono text-xs text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-950" id="feedback-start-ip" maxLength={45} onChange={(event) => setStartIp(event.target.value)} placeholder={selectedVersion === "ipv6" ? "例：2001:db8::1" : "例：8.8.8.0"} value={startIp} />
        </li>
        <li className={rowClass}>
          <label className="text-zinc-500 dark:text-gray-400" htmlFor="feedback-end-ip">结束 IP</label>
          <input autoComplete="off" className="h-9 min-w-0 rounded-md border border-zinc-300 bg-white px-3 font-mono text-xs text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-950" id="feedback-end-ip" maxLength={45} onChange={(event) => setEndIp(event.target.value)} placeholder="非必填，可留空" value={endIp} />
        </li>
        <li className={rowClass}>
          <label className="text-zinc-500 dark:text-gray-400" htmlFor="feedback-location">地理位置</label>
          <input autoComplete="off" className="h-9 min-w-0 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-950" id="feedback-location" maxLength={256} onChange={(event) => setLocation(event.target.value)} placeholder="例：中国/四川/成都/电信、美国/加利福尼亚/洛杉矶" value={location} />
        </li>
        {currentLocation ? (
          <li className={`${rowClass} items-start`}>
            <span className="text-zinc-500 dark:text-gray-400">当前归属地</span>
            <span className="break-words text-zinc-700 dark:text-gray-200">{formatLocation(currentLocation)}</span>
          </li>
        ) : null}
        <li className={`${rowClass} items-start`}>
          <span className="text-zinc-500 dark:text-gray-400">说明</span>
          <div className="space-y-1 text-xs leading-5 text-zinc-600 dark:text-gray-300">
            <p>1、IP 所有者信息优先参考 IP WHOIS，其次参考 ASN，请勿恶意提交。</p>
            <p>2、连续的 IP 段只需要提交一个起始范围，不要重复提交。</p>
            <p>3、尽量提交有 ICMP 响应的 IP，有助于管理员核查。</p>
            <p>4、审核通过后，各检测工具的 IP 归属地数据将同步生效。</p>
          </div>
        </li>
        <li className="flex justify-center gap-2 px-5 py-4">
          <button className="inline-flex h-9 items-center gap-2 rounded bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300" disabled={submitting} type="submit">
            {submitting ? <LoaderCircle aria-hidden="true" className="animate-spin" size={15} /> : <Send aria-hidden="true" size={15} />}
            立即提交
          </button>
          <button className="inline-flex h-9 items-center gap-2 rounded bg-zinc-600 px-4 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600" disabled={submitting} onClick={clearForm} type="button">
            <RotateCcw aria-hidden="true" size={15} /> 清空表单
          </button>
        </li>
      </ul>
      </form>
    </>
  );
}
