"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Activity, Camera, LoaderCircle, RefreshCw, X } from "lucide-react";

import { PingDnsSelector } from "@/components/ping/PingDnsSelector";
import { OPERATOR_OPTIONS } from "@/lib/ping/constants";
import { normalizeProbeTarget } from "@/lib/ping/target";
import type { EnterAction, HistoryMode } from "@/lib/auth/account";

export { normalizeProbeTarget } from "@/lib/ping/target";

const HISTORY_KEY = "selectedValues";

export function getStoredProbeHistory() {
  if (typeof window === "undefined") {
    return [];
  }

  const storedHistory = localStorage.getItem(HISTORY_KEY);
  if (!storedHistory) {
    return [];
  }

  try {
    const parsed = JSON.parse(storedHistory) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string").slice(0, 5)
      : [];
  } catch {
    localStorage.removeItem(HISTORY_KEY);
    return [];
  }
}

function saveProbeHistory(history: string[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function OperatorSelector({
  onChange,
  value,
}: {
  onChange: (value: string[]) => void;
  value: string[];
}) {
  const checkAllRef = useRef<HTMLInputElement | null>(null);
  const checkedAll = value.length === OPERATOR_OPTIONS.length;
  const indeterminate = value.length > 0 && !checkedAll;

  useEffect(() => {
    if (checkAllRef.current) {
      checkAllRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  function toggleAll(checked: boolean) {
    onChange(checked ? [...OPERATOR_OPTIONS] : []);
  }

  function toggleOperator(operator: string, checked: boolean) {
    if (checked) {
      onChange([...value, operator]);
      return;
    }

    onChange(value.filter((item) => item !== operator));
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
      <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-zinc-600 dark:text-gray-300">
        <input
          checked={checkedAll}
          className="h-4 w-4 accent-blue-600"
          onChange={(event) => toggleAll(event.target.checked)}
          ref={checkAllRef}
          type="checkbox"
        />
        全选
      </label>
      {OPERATOR_OPTIONS.map((operator) => (
        <label
          className="inline-flex cursor-pointer items-center gap-2 text-sm text-zinc-600 dark:text-gray-300"
          key={operator}
        >
          <input
            checked={value.includes(operator)}
            className="h-4 w-4 accent-blue-600"
            onChange={(event) => toggleOperator(operator, event.target.checked)}
            type="checkbox"
            value={operator}
          />
          {operator}
        </label>
      ))}
    </div>
  );
}

export function PingProbeControls({
  dns,
  history,
  historyMode = "enabled",
  enterAction = "single",
  isBusy,
  isSnapshotting,
  clearPath,
  onDnsChange,
  onHistoryChange,
  onOperatorsChange,
  onPersistent,
  onSnapshot,
  onStart,
  onUrlChange,
  onUseCustomDnsChange,
  placeholder,
  secondaryActionLabel = "持续测试",
  showSecondaryAction = true,
  selectedOperators,
  trailingControl,
  url,
  useCustomDns,
}: {
  dns: string;
  enterAction?: EnterAction;
  clearPath: string;
  history: string[];
  historyMode?: HistoryMode;
  isBusy: boolean;
  isSnapshotting: boolean;
  onDnsChange: (value: string) => void;
  onHistoryChange: (value: string[]) => void;
  onOperatorsChange: (value: string[]) => void;
  onPersistent: () => void;
  onSnapshot: () => void;
  onStart: () => void;
  onUrlChange: (value: string) => void;
  onUseCustomDnsChange: (value: boolean) => void;
  placeholder: string;
  secondaryActionLabel?: string;
  showSecondaryAction?: boolean;
  selectedOperators: string[];
  trailingControl?: ReactNode;
  url: string;
  useCustomDns: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const [initialUrl] = useState(url);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const disabled = isBusy || isSnapshotting;
  const recordsHistory = historyMode === "enabled" || historyMode === "record-only";
  const displaysHistory = historyMode === "enabled" || historyMode === "display-only";

  function rememberTarget() {
    if (!recordsHistory) {
      return;
    }
    const target = normalizeProbeTarget(url);
    if (!target) {
      return;
    }

    const nextHistory = [target, ...history.filter((item) => item !== target)].slice(0, 5);
    onHistoryChange(nextHistory);
    saveProbeHistory(nextHistory);
  }

  function handleStart() {
    rememberTarget();
    onStart();
  }

  function handlePersistent() {
    rememberTarget();
    onPersistent();
  }

  function removeHistoryItem(value: string) {
    const nextHistory = history.filter((item) => item !== value);
    onHistoryChange(nextHistory);
    saveProbeHistory(nextHistory);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (enterAction === "continuous" && showSecondaryAction) {
      handlePersistent();
      return;
    }
    handleStart();
  }

  function handleUrlBlur() {
    window.setTimeout(() => setFocused(false), 180);
    const currentUrl = inputRef.current?.value ?? url;
    const normalizedUrl = normalizeProbeTarget(currentUrl);
    if (inputRef.current && normalizedUrl !== currentUrl) {
      inputRef.current.value = normalizedUrl;
    }
    if (normalizedUrl !== url) {
      onUrlChange(normalizedUrl);
    }
  }

  return (
    <form className="flex w-full flex-col gap-5" onSubmit={handleSubmit}>
      <div className="flex w-full justify-center gap-3">
        <div className="relative w-[60%] max-w-[720px] shrink-0">
          <input
            autoCapitalize="none"
            autoCorrect="off"
            className="h-11 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 pr-10 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:bg-gray-900 dark:focus:ring-blue-950"
            defaultValue={initialUrl}
            onBlur={handleUrlBlur}
            onChange={(event) => onUrlChange(event.target.value)}
            onFocus={() => setFocused(true)}
            placeholder={placeholder}
            ref={inputRef}
            spellCheck={false}
            type="text"
          />
          {url ? (
            <button
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
              onClick={() => {
                if (inputRef.current) {
                  inputRef.current.value = "";
                }
                onUrlChange("");
                window.history.replaceState(null, "", clearPath);
                inputRef.current?.focus();
              }}
              type="button"
              aria-label="清空目标地址"
              title="清空目标地址"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          ) : null}
          {focused && displaysHistory && history.length ? (
            <ul className="absolute left-0 top-12 z-20 w-full overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
              {history.map((item) => (
                <li className="group flex items-center justify-between" key={item}>
                  <button
                    className="min-w-0 flex-1 truncate px-3 py-2 text-left text-sm text-zinc-700 transition hover:bg-zinc-100 dark:text-gray-200 dark:hover:bg-gray-800"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      if (inputRef.current) {
                        inputRef.current.value = item;
                      }
                      onUrlChange(item);
                      setFocused(false);
                    }}
                    type="button"
                  >
                    {item}
                  </button>
                  <button
                    className="mr-2 hidden h-7 w-7 items-center justify-center rounded text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 group-hover:flex dark:hover:bg-gray-700 dark:hover:text-gray-200"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => removeHistoryItem(item)}
                    type="button"
                    aria-label={`删除历史记录 ${item}`}
                    title="删除历史记录"
                  >
                    <X aria-hidden="true" className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {trailingControl}
          <button
            className="inline-flex h-11 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            disabled={disabled}
            type="submit"
          >
            {disabled ? (
              <LoaderCircle aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Activity aria-hidden="true" className="mr-2 h-4 w-4" />
            )}
            {disabled ? "处理中" : "开始测试"}
          </button>
          {showSecondaryAction ? (
            <button
              className="inline-flex h-11 items-center justify-center rounded-lg bg-fuchsia-500 px-5 text-sm font-medium text-white transition hover:bg-fuchsia-600 disabled:cursor-not-allowed disabled:bg-fuchsia-300"
              disabled={disabled}
              onClick={handlePersistent}
              type="button"
            >
              <RefreshCw aria-hidden="true" className="mr-2 h-4 w-4" />
              {secondaryActionLabel}
            </button>
          ) : null}
          <button
            className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-700 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
            disabled={disabled}
            onClick={onSnapshot}
            type="button"
          >
            {isSnapshotting ? (
              <LoaderCircle aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Camera aria-hidden="true" className="mr-2 h-4 w-4" />
            )}
            {isSnapshotting ? "生成中" : "完整截图"}
          </button>
        </div>
      </div>
      <div className="flex w-full items-center justify-center gap-4">
        <OperatorSelector onChange={onOperatorsChange} value={selectedOperators} />
        <PingDnsSelector
          dns={dns}
          onDnsChange={onDnsChange}
          onUseCustomDnsChange={onUseCustomDnsChange}
          useCustomDns={useCustomDns}
        />
      </div>
    </form>
  );
}
