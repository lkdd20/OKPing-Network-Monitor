"use client";

import { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";

const CURL_COMMANDS = [
  { title: "查询本机公网 IPv4 地址", command: "curl v4.okping.net" },
  { title: "查询本机公网 IPv6 地址", command: "curl v6.okping.net" },
  { title: "查询 IPv4 / IPv6 优先网络", command: "curl vv.okping.net" },
] as const;

export function HomeCurlCommands() {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  async function copyCommand(command: string) {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedCommand(command);
      window.setTimeout(() => setCopiedCommand((current) => (current === command ? null : current)), 1500);
    } catch {
      setCopiedCommand(null);
    }
  }

  return (
    <section aria-labelledby="curl-commands-title" className="mx-auto mt-9 w-full max-w-7xl px-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
          <Terminal aria-hidden="true" size={18} />
        </span>
        <div>
          <h2 className="text-xl font-semibold text-zinc-950 dark:text-zinc-100" id="curl-commands-title">公网 IP 命令</h2>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-gray-400">在终端中直接查询当前出口网络</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {CURL_COMMANDS.map(({ command, title }) => {
          const copied = copiedCommand === command;
          return (
            <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900" key={command}>
              <div className="mb-3 flex h-7 items-center justify-between gap-4">
                <span className="truncate text-sm font-medium text-zinc-700 dark:text-gray-200">{title}</span>
                <button
                  aria-label={copied ? "已复制" : `复制 ${command}`}
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                  onClick={() => void copyCommand(command)}
                  title={copied ? "已复制" : "复制命令"}
                  type="button"
                >
                  {copied ? <Check aria-hidden="true" className="text-emerald-500" size={16} /> : <Copy aria-hidden="true" size={16} />}
                </button>
              </div>
              <pre className="overflow-hidden rounded-md bg-zinc-950 px-4 py-3 text-xs leading-5 text-emerald-400 dark:bg-black">
                <code>{command}</code>
              </pre>
            </div>
          );
        })}
      </div>
    </section>
  );
}
