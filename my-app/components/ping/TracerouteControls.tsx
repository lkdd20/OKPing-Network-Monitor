"use client";

import { useRef, type FormEvent } from "react";

import { PingDnsSelector } from "@/components/ping/PingDnsSelector";
import { TracerouteNodeSelector } from "@/components/ping/TracerouteNodeSelector";
import { normalizeProbeTarget } from "@/lib/ping/target";
import type { PingNode } from "@/lib/ping/types";

export function TracerouteControls({
  clearPath,
  dns,
  initialTarget,
  isBusy,
  isSnapshotting,
  nodes,
  onDnsChange,
  onNodeChange,
  onSnapshot,
  onStart,
  onStop,
  onTargetChange,
  selectedNodeId,
  target,
  placeholder,
  useCustomDns,
  onUseCustomDnsChange,
}: {
  clearPath: string;
  dns: string;
  initialTarget: string;
  isBusy: boolean;
  isSnapshotting: boolean;
  nodes: PingNode[];
  onDnsChange: (value: string) => void;
  onNodeChange: (value: number) => void;
  onSnapshot: () => void;
  onStart: () => void;
  onStop: () => void;
  onTargetChange: (value: string) => void;
  onUseCustomDnsChange: (value: boolean) => void;
  selectedNodeId: number | null;
  target: string;
  placeholder: string;
  useCustomDns: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onStart();
  }

  function normalizeInput() {
    const current = inputRef.current?.value ?? target;
    const normalized = normalizeProbeTarget(current);
    if (inputRef.current && normalized !== current) inputRef.current.value = normalized;
    if (normalized !== target) onTargetChange(normalized);
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div className="flex items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <input
            autoCapitalize="none"
            autoCorrect="off"
            className="h-11 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 pr-10 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:bg-gray-900 dark:focus:ring-blue-950"
            defaultValue={initialTarget}
            onBlur={normalizeInput}
            onChange={(event) => onTargetChange(event.target.value)}
            placeholder={placeholder}
            ref={inputRef}
            spellCheck={false}
            type="text"
          />
          {target ? (
            <button
              aria-label="清空目标"
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
              onClick={() => {
                if (inputRef.current) inputRef.current.value = "";
                onTargetChange("");
                window.history.replaceState(null, "", clearPath);
                inputRef.current?.focus();
              }}
              type="button"
            >
              x
            </button>
          ) : null}
        </div>
        <TracerouteNodeSelector
          disabled={isBusy}
          nodes={nodes}
          onChange={onNodeChange}
          selectedNodeId={selectedNodeId}
        />
        <button
          className="inline-flex h-11 w-24 items-center justify-center rounded-lg bg-blue-600 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          disabled={isBusy || isSnapshotting || !nodes.length}
          type="submit"
        >
          开始追踪
        </button>
        {isBusy ? (
          <button
            className="inline-flex h-11 w-20 items-center justify-center rounded-lg bg-red-600 text-sm font-medium text-white transition hover:bg-red-700"
            onClick={onStop}
            type="button"
          >
            停止
          </button>
        ) : null}
        <button
          className="inline-flex h-11 w-24 items-center justify-center rounded-lg bg-zinc-700 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:bg-zinc-400 dark:bg-gray-600 dark:hover:bg-gray-500"
          disabled={isSnapshotting}
          onClick={onSnapshot}
          type="button"
        >
          {isSnapshotting ? "生成中" : "完整截图"}
        </button>
      </div>
      <div className="flex min-h-9 items-center justify-center text-xs text-zinc-600 dark:text-gray-300">
        <PingDnsSelector
          disabled={isBusy}
          dns={dns}
          onDnsChange={onDnsChange}
          onUseCustomDnsChange={onUseCustomDnsChange}
          useCustomDns={useCustomDns}
        />
      </div>
    </form>
  );
}
