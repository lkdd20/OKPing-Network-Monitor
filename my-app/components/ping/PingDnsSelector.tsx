"use client";

import { useEffect, useId, useRef, useState } from "react";

import { normalizeProbeTarget } from "@/lib/ping/target";

const DNS_OPTIONS = [
  { name: "阿里云", value: "223.5.5.5" },
  { name: "腾讯云", value: "119.29.29.29" },
  { name: "114DNS", value: "114.114.114.114" },
  { name: "360DNS", value: "101.198.198.198" },
  { name: "谷歌DNS", value: "8.8.8.8" },
  { name: "CloudFlare", value: "1.1.1.1" },
] as const;

export function PingDnsSelector({
  disabled = false,
  dns,
  onDnsChange,
  onUseCustomDnsChange,
  useCustomDns,
}: {
  disabled?: boolean;
  dns: string;
  onDnsChange: (value: string) => void;
  onUseCustomDnsChange: (value: boolean) => void;
  useCustomDns: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const radioName = useId();

  useEffect(() => {
    if (useCustomDns && !disabled) {
      inputRef.current?.focus();
    }
  }, [disabled, useCustomDns]);

  function setMode(value: string) {
    const nextUseCustomDns = value === "true";
    onUseCustomDnsChange(nextUseCustomDns);
    if (!nextUseCustomDns) {
      onDnsChange("");
      setFocused(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <div className="flex items-center gap-4">
        <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-zinc-600 dark:text-gray-300">
          <input
            checked={!useCustomDns}
            className="h-4 w-4 accent-blue-600"
            disabled={disabled}
            name={radioName}
            onChange={(event) => setMode(event.target.value)}
            type="radio"
            value="false"
          />
          运营商DNS
        </label>
        <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-zinc-600 dark:text-gray-300">
          <input
            checked={useCustomDns}
            className="h-4 w-4 accent-blue-600"
            disabled={disabled}
            name={radioName}
            onChange={(event) => setMode(event.target.value)}
            type="radio"
            value="true"
          />
          指定DNS
        </label>
      </div>
      <div className="relative">
        <input
          aria-label="指定 DNS"
          className="h-9 w-52 rounded-lg border border-zinc-300 bg-zinc-50 px-3 pr-9 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:bg-gray-900 dark:focus:ring-blue-950 dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
          disabled={disabled || !useCustomDns}
          onBlur={() => window.setTimeout(() => setFocused(false), 180)}
          onChange={(event) => onDnsChange(normalizeProbeTarget(event.target.value))}
          onFocus={() => setFocused(true)}
          placeholder="例如：8.8.8.8"
          ref={inputRef}
          type="text"
          value={dns}
        />
        {dns && useCustomDns && !disabled ? (
          <button
            aria-label="清空指定 DNS"
            className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            onClick={() => {
              onDnsChange("");
              inputRef.current?.focus();
            }}
            type="button"
          >
            x
          </button>
        ) : null}
        {focused && useCustomDns && !disabled ? (
          <ul className="absolute left-0 top-10 z-30 w-52 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
            {DNS_OPTIONS.map((item) => (
              <li key={item.value}>
                <button
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-xs text-zinc-700 transition hover:bg-zinc-100 dark:text-gray-200 dark:hover:bg-gray-800"
                  onClick={() => {
                    onDnsChange(item.value);
                    setFocused(false);
                  }}
                  onMouseDown={(event) => event.preventDefault()}
                  type="button"
                >
                  <span>{item.value}</span>
                  <span className="text-zinc-400 dark:text-gray-500">{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
