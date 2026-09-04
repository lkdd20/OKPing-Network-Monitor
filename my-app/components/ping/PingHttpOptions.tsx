"use client";

import { useRef, useState } from "react";

export type HttpHeaderItem = {
  id: string;
  key: string;
  value: string;
};

export type HttpProbeOptions = {
  body: string;
  headers: HttpHeaderItem[];
  method: string;
};

type PingHttpOptionsProps = {
  disabled?: boolean;
  onChange: (value: HttpProbeOptions) => void;
  value: HttpProbeOptions;
};

const HTTP_METHODS = ["GET", "POST", "HEAD", "PUT", "PATCH", "DELETE"] as const;
const COMMON_HEADERS = [
  "Accept",
  "Accept-Language",
  "Authorization",
  "Cache-Control",
  "Content-Type",
  "Cookie",
  "Origin",
  "Referer",
  "User-Agent",
  "X-Requested-With",
] as const;

function cleanHeaders(headers: HttpHeaderItem[]) {
  return headers.filter((header) => header.key.trim() || header.value.trim());
}

export function createDefaultHttpOptions(): HttpProbeOptions {
  return {
    body: "",
    headers: [{ id: "header-1", key: "", value: "" }],
    method: "GET",
  };
}

export function toHttpOptionsPayload(value: HttpProbeOptions) {
  return {
    body: value.body,
    headers: value.headers
      .filter((header) => header.key.trim() && header.value.trim())
      .reduce<Record<string, string>>((headers, header) => {
        headers[header.key.trim()] = header.value.trim();
        return headers;
      }, {}),
    method: value.method,
  };
}

export function PingHttpOptions({
  disabled = false,
  onChange,
  value,
}: PingHttpOptionsProps) {
  const [expanded, setExpanded] = useState(false);
  const nextHeaderIdRef = useRef(2);

  function update(nextValue: HttpProbeOptions) {
    onChange({
      ...nextValue,
      headers: nextValue.headers.length ? nextValue.headers : createDefaultHttpOptions().headers,
    });
  }

  function updateHeader(id: string, field: "key" | "value", nextFieldValue: string) {
    update({
      ...value,
      headers: value.headers.map((header) =>
        header.id === id ? { ...header, [field]: nextFieldValue } : header,
      ),
    });
  }

  function addHeader() {
    const nextId = nextHeaderIdRef.current;
    nextHeaderIdRef.current += 1;
    update({
      ...value,
      headers: [...value.headers, { id: `header-${nextId}`, key: "", value: "" }],
    });
  }

  function removeHeader(id: string) {
    update({
      ...value,
      headers: value.headers.filter((header) => header.id !== id),
    });
  }

  const activeHeaderCount = cleanHeaders(value.headers).length;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-2">
      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <button
          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed dark:text-gray-200 dark:hover:bg-gray-800"
          disabled={disabled}
          onClick={() => setExpanded((current) => !current)}
          type="button"
        >
          <span>高级功能</span>
          <span className="flex items-center gap-3 text-xs text-zinc-500 dark:text-gray-400">
            {value.method}
            {activeHeaderCount ? `${activeHeaderCount} Headers` : "无 Header"}
            <span className={`transition ${expanded ? "rotate-180" : ""}`}>⌄</span>
          </span>
        </button>

        {expanded ? (
          <div className="border-t border-zinc-100 p-4 dark:border-gray-700">
            <div className="grid grid-cols-[160px_1fr] gap-4">
              <div>
                <label className="mb-2 block text-xs font-medium text-zinc-500 dark:text-gray-400">
                  请求类型
                </label>
                <select
                  className="h-10 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-zinc-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:bg-gray-900 dark:focus:ring-blue-950"
                  disabled={disabled}
                  onChange={(event) => update({ ...value, method: event.target.value })}
                  value={value.method}
                >
                  {HTTP_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-500 dark:text-gray-400">
                    Headers
                  </span>
                  <button
                    className="rounded text-xs font-medium text-blue-600 transition hover:text-blue-700 disabled:cursor-not-allowed disabled:text-zinc-400 dark:text-blue-400 dark:hover:text-blue-300"
                    disabled={disabled}
                    onClick={addHeader}
                    type="button"
                  >
                    + 添加 Header
                  </button>
                </div>
                <div className="space-y-2">
                  {value.headers.map((header) => (
                    <div className="grid grid-cols-[220px_1fr_34px] gap-2" key={header.id}>
                      <input
                        className="h-10 rounded-lg border border-zinc-300 bg-zinc-50 px-3 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-zinc-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:bg-gray-900 dark:focus:ring-blue-950"
                        disabled={disabled}
                        list="ping-http-header-names"
                        onChange={(event) => updateHeader(header.id, "key", event.target.value)}
                        placeholder="Header 名称"
                        value={header.key}
                      />
                      <input
                        className="h-10 rounded-lg border border-zinc-300 bg-zinc-50 px-3 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-zinc-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:bg-gray-900 dark:focus:ring-blue-950"
                        disabled={disabled}
                        onChange={(event) => updateHeader(header.id, "value", event.target.value)}
                        placeholder="Header 值"
                        value={header.value}
                      />
                      <button
                        className="inline-flex h-10 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:cursor-not-allowed disabled:text-zinc-300 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                        disabled={disabled || value.headers.length <= 1}
                        onClick={() => removeHeader(header.id)}
                        type="button"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
                <datalist id="ping-http-header-names">
                  {COMMON_HEADERS.map((header) => (
                    <option key={header} value={header} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-xs font-medium text-zinc-500 dark:text-gray-400">
                请求体
              </label>
              <textarea
                className="min-h-24 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-zinc-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:bg-gray-900 dark:focus:ring-blue-950"
                disabled={disabled}
                onChange={(event) => update({ ...value, body: event.target.value })}
                placeholder="POST/PUT/PATCH 请求体，可留空"
                value={value.body}
              />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
