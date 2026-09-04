"use client";

import { Check, LoaderCircle, RotateCcw, Save, Settings2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  ACCOUNT_TOOL_DEFINITIONS,
  createDefaultAccountPreferences,
  createDefaultToolPreference,
  type AccountPreferences,
  type AccountToolKey,
  type ToolPreference,
} from "@/lib/auth/account";
import { setCachedAccountPreferences } from "@/lib/auth/preferencesClient";
import { OPERATOR_OPTIONS } from "@/lib/ping/constants";

type Envelope<T> = { code?: number | string; data?: T; msg?: string };

const CONTINUOUS_TOOLS = new Set<AccountToolKey>(["ping", "ping_v6", "tcping", "tcping_v6", "http", "http_v6"]);
const OPERATOR_TOOLS = new Set<AccountToolKey>(["ping", "ping_v6", "tcping", "tcping_v6", "http", "http_v6", "dns", "batch_ping", "batch_tcping"]);
const DNS_TOOLS = new Set<AccountToolKey>(["ping", "ping_v6", "tcping", "tcping_v6", "http", "http_v6", "traceroute", "traceroute_v6"]);
const MAP_TOOLS = new Set<AccountToolKey>(["ping", "ping_v6", "tcping", "tcping_v6", "http", "http_v6"]);
const QUICK_ACTION_TOOLS = new Set<AccountToolKey>(["ping", "ping_v6", "tcping", "tcping_v6", "http", "http_v6"]);
const SLOW_TEST_TOOLS = new Set<AccountToolKey>(["http", "http_v6"]);

function Choice({
  checked,
  children,
  name,
  onChange,
}: {
  checked: boolean;
  children: React.ReactNode;
  name: string;
  onChange: () => void;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-gray-200">
      <input checked={checked} className="h-4 w-4 accent-blue-600" name={name} onChange={onChange} type="radio" />
      {children}
    </label>
  );
}

function SettingRow({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="grid border-b border-zinc-200 last:border-b-0 dark:border-gray-700 sm:grid-cols-[170px_1fr]">
      <div className="flex items-center bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-600 dark:bg-gray-800/60 dark:text-gray-300 sm:justify-end sm:border-r sm:border-zinc-200 sm:text-right sm:dark:border-gray-700">
        {label}
      </div>
      <div className="flex min-h-14 flex-wrap items-center gap-x-7 gap-y-3 px-4 py-3 sm:px-6">{children}</div>
    </div>
  );
}

export function PreferencesClient() {
  const [preferences, setPreferences] = useState<AccountPreferences>(createDefaultAccountPreferences);
  const [selectedTool, setSelectedTool] = useState<AccountToolKey>("ping");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch("/api/account/preferences", { cache: "no-store" });
        const body = (await response.json().catch(() => null)) as Envelope<AccountPreferences> | null;
        if (response.status === 401) {
          window.location.assign("/login?next=/account/preferences");
          return;
        }
        if (!response.ok || !body?.data || String(body.code) !== "200") {
          throw new Error(body?.msg || "习惯设置加载失败");
        }
        if (!cancelled) {
          setPreferences(body.data);
          setCachedAccountPreferences(body.data);
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "习惯设置加载失败");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const current = preferences.tools[selectedTool] ?? createDefaultToolPreference();
  const selectedDefinition = useMemo(
    () => ACCOUNT_TOOL_DEFINITIONS.find((item) => item.key === selectedTool)!,
    [selectedTool],
  );

  function updateCurrent(patch: Partial<ToolPreference>) {
    setPreferences((value) => ({
      ...value,
      tools: {
        ...value.tools,
        [selectedTool]: { ...value.tools[selectedTool], ...patch },
      },
    }));
    setDirty(true);
    setMessage("");
    setError("");
  }

  function toggleOperator(operator: string) {
    const operators = current.operators.includes(operator)
      ? current.operators.filter((item) => item !== operator)
      : [...current.operators, operator];
    updateCurrent({ operators });
  }

  async function save() {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/account/preferences", {
        body: JSON.stringify(preferences),
        headers: { "Content-Type": "application/json" },
        method: "PUT",
      });
      const body = (await response.json().catch(() => null)) as Envelope<AccountPreferences> | null;
      if (response.status === 401) {
        window.location.assign("/login?next=/account/preferences");
        return;
      }
      if (!response.ok || !body?.data || String(body.code) !== "200") {
        throw new Error(body?.msg || "习惯设置保存失败");
      }
      setPreferences(body.data);
      setCachedAccountPreferences(body.data);
      setDirty(false);
      setMessage("已保存，其他设备重新打开检测页面后会自动同步。");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "习惯设置保存失败");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center text-zinc-500 dark:text-gray-400">
        <LoaderCircle aria-hidden="true" className="h-7 w-7 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid min-h-[680px] lg:grid-cols-[245px_1fr]">
      <div className="border-b border-zinc-200 bg-zinc-50/60 p-3 dark:border-gray-700 dark:bg-gray-950/30 lg:border-r lg:border-b-0">
        <label className="mb-2 block text-xs font-medium text-zinc-500 dark:text-gray-400 lg:hidden" htmlFor="preference-tool">
          检测工具
        </label>
        <select
          className="h-10 w-full border border-zinc-300 bg-white px-3 text-sm text-zinc-800 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 lg:hidden"
          id="preference-tool"
          onChange={(event) => setSelectedTool(event.target.value as AccountToolKey)}
          value={selectedTool}
        >
          {ACCOUNT_TOOL_DEFINITIONS.map((tool) => <option key={tool.key} value={tool.key}>{tool.label}</option>)}
        </select>
        <div className="hidden space-y-1 lg:block">
          {ACCOUNT_TOOL_DEFINITIONS.map((tool) => (
            <button
              className={`w-full border-l-2 px-4 py-2.5 text-left text-sm transition ${
                selectedTool === tool.key
                  ? "border-blue-600 bg-blue-600 font-medium text-white"
                  : "border-transparent text-zinc-700 hover:bg-white dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
              key={tool.key}
              onClick={() => setSelectedTool(tool.key)}
              type="button"
            >
              {tool.label}
            </button>
          ))}
        </div>
      </div>

      <section className="min-w-0 bg-white dark:bg-gray-900">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-4 dark:border-gray-700 sm:px-6">
          <div>
            <div className="flex items-center gap-2 text-lg font-semibold text-blue-600 dark:text-blue-400">
              <Settings2 aria-hidden="true" className="h-5 w-5" />
              {selectedDefinition.label}
            </div>
            <p className="mt-1 text-xs text-zinc-500 dark:text-gray-400">{selectedDefinition.group} 工具偏好</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex h-9 items-center gap-2 border border-zinc-300 px-3 text-sm text-zinc-600 transition hover:bg-zinc-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              onClick={() => updateCurrent(createDefaultToolPreference())}
              type="button"
            >
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
              恢复本项默认
            </button>
            <button
              className="inline-flex h-9 items-center gap-2 bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              disabled={saving || !dirty}
              onClick={() => void save()}
              type="button"
            >
              {saving ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Save aria-hidden="true" className="h-4 w-4" />}
              保存设置
            </button>
          </div>
        </header>

        {error ? <div className="border-b border-red-200 bg-red-50 px-6 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</div> : null}
        {message ? <div className="flex items-center gap-2 border-b border-emerald-200 bg-emerald-50 px-6 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"><Check aria-hidden="true" className="h-4 w-4" />{message}</div> : null}

        <div className="border-b border-zinc-200 dark:border-gray-700">
          <SettingRow label="回车键执行">
            <Choice checked={current.enterAction === "single"} name={`${selectedTool}-enter`} onChange={() => updateCurrent({ enterAction: "single" })}>单次测试</Choice>
            {CONTINUOUS_TOOLS.has(selectedTool) ? (
              <Choice checked={current.enterAction === "continuous"} name={`${selectedTool}-enter`} onChange={() => updateCurrent({ enterAction: "continuous" })}>
                {SLOW_TEST_TOOLS.has(selectedTool) ? "缓慢测试" : "持续测试"}
              </Choice>
            ) : <span className="text-xs text-zinc-400 dark:text-gray-500">当前工具仅支持单次执行</span>}
          </SettingRow>

          <SettingRow label="输入历史">
            {(["enabled", "record-only", "display-only", "disabled"] as const).map((mode, index) => (
              <Choice checked={current.historyMode === mode} key={mode} name={`${selectedTool}-history`} onChange={() => updateCurrent({ historyMode: mode })}>
                {["启用", "仅记录", "仅显示", "禁用"][index]}
              </Choice>
            ))}
          </SettingRow>

          {OPERATOR_TOOLS.has(selectedTool) ? (
            <SettingRow label="默认线路">
              {OPERATOR_OPTIONS.map((operator) => (
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-gray-200" key={operator}>
                  <input checked={current.operators.includes(operator)} className="h-4 w-4 accent-blue-600" onChange={() => toggleOperator(operator)} type="checkbox" />
                  {operator}
                </label>
              ))}
            </SettingRow>
          ) : null}

          {DNS_TOOLS.has(selectedTool) ? (
            <SettingRow label="DNS 解析">
              <Choice checked={current.dnsMode === "operator"} name={`${selectedTool}-dns`} onChange={() => updateCurrent({ dnsMode: "operator" })}>运营商 DNS</Choice>
              <Choice checked={current.dnsMode === "custom"} name={`${selectedTool}-dns`} onChange={() => updateCurrent({ dnsMode: "custom" })}>指定 DNS</Choice>
              <input
                className="h-9 w-full max-w-[260px] border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-blue-500 disabled:bg-zinc-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:disabled:bg-gray-800"
                disabled={current.dnsMode !== "custom"}
                onChange={(event) => updateCurrent({ customDns: event.target.value })}
                placeholder="例如：223.5.5.5"
                value={current.customDns}
              />
            </SettingRow>
          ) : null}

          {MAP_TOOLS.has(selectedTool) ? (
            <>
              <SettingRow label="地图超时标记">
                <Choice checked={current.mapTimeoutMarker} name={`${selectedTool}-map`} onChange={() => updateCurrent({ mapTimeoutMarker: true })}>开启</Choice>
                <Choice checked={!current.mapTimeoutMarker} name={`${selectedTool}-map`} onChange={() => updateCurrent({ mapTimeoutMarker: false })}>关闭</Choice>
              </SettingRow>
              <SettingRow label="区域线路统计">
                <Choice checked={current.regionSummary === "china"} name={`${selectedTool}-region`} onChange={() => updateCurrent({ regionSummary: "china" })}>显示中国地区</Choice>
                <Choice checked={current.regionSummary === "overseas"} name={`${selectedTool}-region`} onChange={() => updateCurrent({ regionSummary: "overseas" })}>显示海外地区</Choice>
              </SettingRow>
            </>
          ) : null}

          {selectedTool === "dns" ? (
            <SettingRow label="域名解析统计">
              <Choice checked={current.dnsStatsExpanded} name={`${selectedTool}-dns-stats`} onChange={() => updateCurrent({ dnsStatsExpanded: true })}>展开</Choice>
              <Choice checked={!current.dnsStatsExpanded} name={`${selectedTool}-dns-stats`} onChange={() => updateCurrent({ dnsStatsExpanded: false })}>收起</Choice>
            </SettingRow>
          ) : null}

          {QUICK_ACTION_TOOLS.has(selectedTool) ? (
            <SettingRow label="快捷操作菜单">
              <Choice checked={current.quickActions} name={`${selectedTool}-quick`} onChange={() => updateCurrent({ quickActions: true })}>开启</Choice>
              <Choice checked={!current.quickActions} name={`${selectedTool}-quick`} onChange={() => updateCurrent({ quickActions: false })}>关闭</Choice>
            </SettingRow>
          ) : null}
        </div>
        <p className="px-6 py-4 text-xs leading-6 text-zinc-500 dark:text-gray-400">
          设置保存在当前okping.net账号中。未登录访问仍使用系统默认值，登录设备会读取同一份配置。
        </p>
      </section>
    </div>
  );
}
