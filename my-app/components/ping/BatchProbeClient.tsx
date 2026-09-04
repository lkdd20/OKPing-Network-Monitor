"use client";

import { toPng } from "html-to-image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CopyableIpCell } from "@/components/ping/CopyableIpCell";
import { PingCenterAds } from "@/components/ping/PingAdSlots";
import { PingShell } from "@/components/ping/PingShell";
import { PingToast } from "@/components/ping/PingToast";
import {
  expandBatchTargets,
  MAX_BATCH_NODES,
  type BatchMode,
  type ExpandedBatchTarget,
  type GatewayPosition,
} from "@/lib/ping/batchTarget";
import { DEFAULT_PING_WS_BASE_URL, OPERATOR_OPTIONS } from "@/lib/ping/constants";
import { getProbeAddress, getProbeDurationMs, isProbeSuccess } from "@/lib/ping/result";
import type {
  PingNode,
  PingNodeMessage,
  PingPublicLayoutConfig,
  PingResponse,
} from "@/lib/ping/types";
import type { AccountToolKey } from "@/lib/auth/account";
import { useToolPreference } from "@/lib/auth/preferencesClient";

const WS_BASE_URL = process.env.NEXT_PUBLIC_PING_WS_BASE_URL ?? DEFAULT_PING_WS_BASE_URL;
const TABLE_DIVIDER = "border-r border-zinc-200 last:border-r-0 dark:border-gray-700";
const RESULT_INACTIVITY_TIMEOUT_MS = 20_000;

type BatchProbeClientProps = {
  activePath: string;
  apiPath: string;
  layoutConfig?: PingPublicLayoutConfig;
  mode: BatchMode;
};

type RunStatus = "idle" | "loading" | "submitting" | "running" | "completed" | "error";
type RowFilter = "all" | "full" | "partial" | "some" | "timeout";
type SortDirection = "asc" | "desc" | null;

type SortState = {
  direction: SortDirection;
  nodeId: number | null;
};

type SubmitResponse = PingResponse<{
  accessKey?: string;
  taskId?: string;
}> & {
  task_id?: string;
};

const FILTERS: Array<{ label: string; value: RowFilter }> = [
  { label: "全部", value: "all" },
  { label: "全部响应", value: "full" },
  { label: "部分响应", value: "partial" },
  { label: "有响应", value: "some" },
  { label: "全部超时", value: "timeout" },
];

const OPERATOR_STYLES: Record<string, string> = {
  电信: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  联通: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  移动: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  多线: "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300",
  "港澳台、海外": "bg-zinc-100 text-zinc-700 dark:bg-gray-700 dark:text-gray-200",
};

function getResponseMessage(body: PingResponse<unknown> | null, fallback: string) {
  if (!body) {
    return fallback;
  }
  return body.msg || body.message || fallback;
}

async function readNodeResponse(response: Response) {
  const body = (await response.json().catch(() => null)) as PingResponse<PingNode[]> | null;
  const code = typeof body?.code === "string" ? Number(body.code) : body?.code;
  if (!response.ok || (typeof code === "number" && code !== 200)) {
    throw new Error(getResponseMessage(body, "节点列表加载失败。"));
  }
  return Array.isArray(body?.data) ? body.data : [];
}

function getAccessKey(body: SubmitResponse | null) {
  return body?.data?.accessKey || body?.data?.taskId || body?.task_id || "";
}

function nodeId(node: PingNode) {
  return Number(node.key);
}

function resultKey(batchIndex: number, id: number | string) {
  return `${batchIndex}:${id}`;
}

function createMissingResult(
  mode: BatchMode,
  target: ExpandedBatchTarget,
  id: number,
): PingNodeMessage {
  return {
    batchIndex: target.index,
    batchTarget: target.displayTarget,
    error: "节点未在规定时间内返回结果",
    finalResult: true,
    measuredAt: Date.now(),
    nodeId: id,
    probeResult: null,
    sequence: 1,
    totalRuns: 1,
    type: mode,
  };
}

function pickDefaultNodes(nodes: PingNode[]) {
  return OPERATOR_OPTIONS.flatMap((operator) => {
    const node = nodes.find((item) => item.operators === operator);
    return node ? [node] : [];
  }).slice(0, MAX_BATCH_NODES);
}

function pickAnotherBatch(nodes: PingNode[]) {
  return OPERATOR_OPTIONS.flatMap((operator) => {
    const choices = nodes.filter((item) => item.operators === operator);
    if (!choices.length) {
      return [];
    }
    const randomValues = new Uint32Array(1);
    window.crypto.getRandomValues(randomValues);
    return [choices[randomValues[0] % choices.length]];
  }).slice(0, MAX_BATCH_NODES);
}

function nodeDisplayName(node: PingNode) {
  return node.name || [node.city, node.operators].filter(Boolean).join(" ") || `节点 ${node.key}`;
}

function responseCount(
  target: ExpandedBatchTarget,
  nodes: PingNode[],
  results: Record<string, PingNodeMessage>,
) {
  return nodes.filter((node) => results[resultKey(target.index, nodeId(node))]).length;
}

function successCount(
  target: ExpandedBatchTarget,
  nodes: PingNode[],
  results: Record<string, PingNodeMessage>,
) {
  return nodes.filter((node) => {
    const result = results[resultKey(target.index, nodeId(node))];
    return result && isProbeSuccess(result);
  }).length;
}

function sortDuration(result?: PingNodeMessage) {
  if (!result || !isProbeSuccess(result)) {
    return Number.POSITIVE_INFINITY;
  }
  return getProbeDurationMs(result);
}

function NodeResultCell({ result }: { result?: PingNodeMessage }) {
  if (!result) {
    return <span className="text-zinc-400 dark:text-gray-500">等待响应</span>;
  }

  if (!isProbeSuccess(result)) {
    return (
      <div className="space-y-1 text-center">
        <div className="font-semibold text-red-600 dark:text-red-400">响应超时</div>
        <div className="truncate text-[11px] text-red-500/80" title={result.error || "检测失败"}>
          {result.error || "检测失败"}
        </div>
      </div>
    );
  }

  const address = getProbeAddress(result);
  return (
    <div className="space-y-1 text-center">
      <div className="font-semibold text-emerald-600 dark:text-emerald-400">
        {getProbeDurationMs(result).toFixed(2)} ms
      </div>
      <CopyableIpCell value={address} />
      <div className="truncate text-[11px] text-zinc-500 dark:text-gray-400" title={result.ipLocation || "未知"}>
        {result.ipLocation || "未知"}
      </div>
    </div>
  );
}

function NodePicker({
  disabled,
  nodes,
  onChange,
  selected,
}: {
  disabled: boolean;
  nodes: PingNode[];
  onChange: (nodes: PingNode[]) => void;
  selected: PingNode[];
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closePicker(event: MouseEvent) {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", closePicker);
    return () => document.removeEventListener("mousedown", closePicker);
  }, []);

  const visibleNodes = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return nodes.filter((node) => {
      if (!keyword) {
        return true;
      }
      return [node.name, node.city, node.province, node.operators]
        .some((value) => value?.toLowerCase().includes(keyword));
    });
  }, [nodes, search]);

  function toggleNode(node: PingNode) {
    const exists = selected.some((item) => nodeId(item) === nodeId(node));
    if (exists) {
      onChange(selected.filter((item) => nodeId(item) !== nodeId(node)));
      return;
    }
    if (selected.length < MAX_BATCH_NODES) {
      onChange([...selected, node]);
    }
  }

  return (
    <div className="relative" ref={pickerRef}>
      <div className="flex h-12 w-[720px] items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 dark:border-gray-600 dark:bg-gray-900">
        <button
          className="min-w-0 flex-1 text-left text-xs text-zinc-600 disabled:cursor-not-allowed dark:text-gray-300"
          disabled={disabled}
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          <span className="flex items-center gap-2 overflow-hidden">
            {selected.length ? selected.map((node) => (
              <span
                className={`shrink-0 rounded px-2 py-1 ${OPERATOR_STYLES[node.operators || ""] || OPERATOR_STYLES["港澳台、海外"]}`}
                key={node.key}
              >
                {nodeDisplayName(node)}
              </span>
            )) : <span className="text-zinc-400">选择检测节点</span>}
          </span>
        </button>
        <span className="shrink-0 text-xs text-zinc-400">{selected.length}/{MAX_BATCH_NODES}</span>
        <button
          aria-label="换一批节点"
          className="h-8 shrink-0 rounded px-2 text-xs text-zinc-500 transition hover:bg-zinc-100 disabled:cursor-not-allowed dark:text-gray-300 dark:hover:bg-gray-700"
          disabled={disabled || !nodes.length}
          onClick={() => onChange(pickAnotherBatch(nodes))}
          title="换一批节点"
          type="button"
        >
          换一批
        </button>
      </div>

      {open && !disabled ? (
        <div className="absolute right-0 top-14 z-30 w-[720px] overflow-hidden rounded-md border border-zinc-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
          <div className="border-b border-zinc-100 p-3 dark:border-gray-700">
            <input
              className="h-9 w-full rounded border border-zinc-300 bg-zinc-50 px-3 text-xs outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="搜索节点名称、城市或运营商"
              value={search}
            />
          </div>
          <div className="grid max-h-72 grid-cols-2 overflow-y-auto p-2">
            {visibleNodes.map((node) => {
              const checked = selected.some((item) => nodeId(item) === nodeId(node));
              return (
                <label
                  className="flex cursor-pointer items-center gap-3 rounded px-3 py-2 text-xs hover:bg-zinc-50 dark:hover:bg-gray-800"
                  key={node.key}
                >
                  <input
                    checked={checked}
                    disabled={!checked && selected.length >= MAX_BATCH_NODES}
                    onChange={() => toggleNode(node)}
                    type="checkbox"
                  />
                  <span className="min-w-0 flex-1 truncate text-zinc-700 dark:text-gray-200">
                    {nodeDisplayName(node)}
                  </span>
                  <span className="shrink-0 text-zinc-400">{node.operators}</span>
                </label>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function BatchProbeClient({ activePath, apiPath, layoutConfig, mode }: BatchProbeClientProps) {
  const toolPreference = useToolPreference((mode === "tcping" ? "batch_tcping" : "batch_ping") as AccountToolKey);
  const [input, setInput] = useState("");
  const [nodes, setNodes] = useState<PingNode[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<PingNode[]>([]);
  const [activeNodes, setActiveNodes] = useState<PingNode[]>([]);
  const [targets, setTargets] = useState<ExpandedBatchTarget[]>([]);
  const [results, setResults] = useState<Record<string, PingNodeMessage>>({});
  const [filterNetwork, setFilterNetwork] = useState(true);
  const [gatewayPosition, setGatewayPosition] = useState<GatewayPosition>("first");
  const [defaultPort, setDefaultPort] = useState(80);
  const [filter, setFilter] = useState<RowFilter>("all");
  const [sort, setSort] = useState<SortState>({ direction: null, nodeId: null });
  const [status, setStatus] = useState<RunStatus>("loading");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const socketRef = useRef<WebSocket | null>(null);
  const resultTimeoutRef = useRef<number | null>(null);
  const runIdRef = useRef(0);
  const resultKeysRef = useRef(new Set<string>());
  const terminalRunsRef = useRef(new Set<number>());
  const preferenceAppliedRef = useRef(false);

  useEffect(() => {
    if (!toolPreference || !nodes.length || preferenceAppliedRef.current) return;
    preferenceAppliedRef.current = true;
    const preferredOperators = new Set(toolPreference.operators);
    setSelectedNodes(pickDefaultNodes(nodes.filter((node) => preferredOperators.has(node.operators || ""))));
  }, [nodes, toolPreference]);

  const clearResultTimeout = useCallback(() => {
    if (resultTimeoutRef.current != null) {
      window.clearTimeout(resultTimeoutRef.current);
      resultTimeoutRef.current = null;
    }
  }, []);

  const closeSocket = useCallback(() => {
    clearResultTimeout();
    socketRef.current?.close();
    socketRef.current = null;
  }, [clearResultTimeout]);

  useEffect(() => {
    let cancelled = false;
    async function loadNodes() {
      try {
        const response = await fetch("/api/ping/nodes/first", { cache: "no-store" });
        const loaded = await readNodeResponse(response);
        if (!cancelled) {
          setNodes(loaded);
          setSelectedNodes(pickDefaultNodes(loaded));
          setStatus("idle");
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "节点列表加载失败。");
          setStatus("error");
        }
      }
    }
    void loadNodes();
    return () => {
      cancelled = true;
      runIdRef.current += 1;
      closeSocket();
    };
  }, [closeSocket]);

  const completedRows = useMemo(() => targets.filter((target) => (
    responseCount(target, activeNodes, results) === activeNodes.length
  )).length, [activeNodes, results, targets]);
  const receivedCells = Object.keys(results).length;
  const totalCells = targets.length * activeNodes.length;

  const visibleTargets = useMemo(() => {
    const filtered = targets.filter((target) => {
      const received = responseCount(target, activeNodes, results);
      const success = successCount(target, activeNodes, results);
      if (filter === "full") return success === activeNodes.length;
      if (filter === "partial") return success > 0 && success < activeNodes.length;
      if (filter === "some") return success > 0;
      if (filter === "timeout") return received === activeNodes.length && success === 0;
      return true;
    });
    if (sort.nodeId == null || sort.direction == null) {
      return filtered;
    }
    return [...filtered].sort((left, right) => {
      const leftValue = sortDuration(results[resultKey(left.index, sort.nodeId as number)]);
      const rightValue = sortDuration(results[resultKey(right.index, sort.nodeId as number)]);
      if (leftValue === rightValue) return left.index - right.index;
      return sort.direction === "asc" ? leftValue - rightValue : rightValue - leftValue;
    });
  }, [activeNodes, filter, results, sort, targets]);

  function connect(
    accessKey: string,
    runId: number,
    runTargets: ExpandedBatchTarget[],
    runNodes: PingNode[],
  ) {
    const expectedCells = runTargets.length * runNodes.length;
    const socket = new WebSocket(`${WS_BASE_URL.replace(/\/$/, "")}/${encodeURIComponent(accessKey)}`);
    socketRef.current = socket;

    const completeMissingResults = () => {
      if (runIdRef.current !== runId || terminalRunsRef.current.has(runId)) return;
      const missingCount = expectedCells - resultKeysRef.current.size;
      if (missingCount <= 0) return;

      terminalRunsRef.current.add(runId);
      clearResultTimeout();
      setResults((current) => {
        const next = { ...current };
        runTargets.forEach((target) => {
          runNodes.forEach((node) => {
            const id = nodeId(node);
            const key = resultKey(target.index, id);
            if (!next[key]) {
              next[key] = createMissingResult(mode, target, id);
              resultKeysRef.current.add(key);
            }
          });
        });
        return next;
      });
      setNotice(`${missingCount} 个节点结果未返回，已按响应超时处理。`);
      setStatus("completed");
      socket.close();
    };

    const armResultTimeout = () => {
      clearResultTimeout();
      resultTimeoutRef.current = window.setTimeout(completeMissingResults, RESULT_INACTIVITY_TIMEOUT_MS);
    };

    socket.addEventListener("open", () => {
      if (runIdRef.current === runId) {
        setStatus("running");
        socket.send("start");
        armResultTimeout();
      }
    });
    socket.addEventListener("message", (event) => {
      if (runIdRef.current !== runId || typeof event.data !== "string") return;
      let message: PingNodeMessage | PingResponse<unknown>;
      try {
        message = JSON.parse(event.data) as PingNodeMessage | PingResponse<unknown>;
      } catch {
        return;
      }
      if (!("nodeId" in message)) {
        const code = typeof message.code === "string" ? Number(message.code) : message.code;
        if (typeof code === "number" && code !== 200) {
          terminalRunsRef.current.add(runId);
          clearResultTimeout();
          setError(getResponseMessage(message, "检测任务执行失败。"));
          setStatus("error");
          socket.close();
        }
        return;
      }
      if (typeof message.batchIndex !== "number") return;
      const key = resultKey(message.batchIndex as number, message.nodeId);
      resultKeysRef.current.add(key);
      setResults((current) => ({
        ...current,
        [key]: message as PingNodeMessage,
      }));
      if (expectedCells > 0 && resultKeysRef.current.size >= expectedCells) {
        terminalRunsRef.current.add(runId);
        clearResultTimeout();
        setStatus("completed");
        socket.close();
      } else {
        armResultTimeout();
      }
    });
    socket.addEventListener("error", () => {
      if (runIdRef.current === runId) {
        terminalRunsRef.current.add(runId);
        clearResultTimeout();
        setError("WebSocket 连接失败，请确认检测服务可用。");
        setStatus("error");
      }
    });
    socket.addEventListener("close", () => {
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
      if (
        runIdRef.current === runId
        && !terminalRunsRef.current.has(runId)
        && resultKeysRef.current.size < expectedCells
      ) {
        terminalRunsRef.current.add(runId);
        clearResultTimeout();
        setError("WebSocket 连接已提前关闭，请稍后重试。");
        setStatus("error");
      }
    });
  }

  async function submit() {
    if (!selectedNodes.length) {
      setError("请至少选择一个检测节点。");
      return;
    }
    let expanded: ExpandedBatchTarget[];
    try {
      expanded = expandBatchTargets(input, mode, {
        defaultPort,
        filterNetwork,
        gatewayPosition,
      });
    } catch (parseError) {
      setError(parseError instanceof Error ? parseError.message : "检测目标格式错误。");
      return;
    }

    runIdRef.current += 1;
    const runId = runIdRef.current;
    terminalRunsRef.current.delete(runId);
    closeSocket();
    setStatus("submitting");
    setError("");
    setNotice("");
    setFilter("all");
    setSort({ direction: null, nodeId: null });
    setTargets(expanded);
    setResults({});
    resultKeysRef.current = new Set<string>();
    setActiveNodes(selectedNodes);

    try {
      const response = await fetch(apiPath, {
        body: JSON.stringify({
          defaultPort,
          filterNetwork,
          firstGateway: gatewayPosition,
          nodeIds: selectedNodes.map(nodeId),
          targets: input,
        }),
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const body = (await response.json().catch(() => null)) as SubmitResponse | null;
      const code = typeof body?.code === "string" ? Number(body.code) : body?.code;
      if (!response.ok || (typeof code === "number" && code !== 200)) {
        throw new Error(getResponseMessage(body, "批量检测任务提交失败。"));
      }
      const accessKey = getAccessKey(body);
      if (!accessKey) {
        throw new Error("后端响应中没有任务 UUID。");
      }
      connect(accessKey, runId, expanded, selectedNodes);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "批量检测任务提交失败。");
      setStatus("error");
    }
  }

  function changeSort(id: number) {
    setSort((current) => {
      if (current.nodeId !== id) return { direction: "asc", nodeId: id };
      if (current.direction === "asc") return { direction: "desc", nodeId: id };
      return { direction: null, nodeId: null };
    });
  }

  async function snapshot() {
    setNotice("正在生成完整截图...");
    try {
      const dataUrl = await toPng(document.body, { pixelRatio: 1, quality: 1 });
      const link = document.createElement("a");
      link.download = `ping-${mode}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      setNotice("截图已生成。");
    } catch {
      setError("截图生成失败，请稍后重试。");
      setNotice("");
    }
  }

  const busy = status === "submitting" || status === "running";
  const placeholder = mode === "tcping"
    ? "example.com:443\n1.1.1.1\n[192.168.1.0/28]:80\n[192.168.2.1-192.168.2.10]:8080"
    : "example.com\n1.1.1.1\n192.168.1.0/28\n192.168.2.1-192.168.2.10";

  return (
    <PingShell activePath={activePath} layoutConfig={layoutConfig}>
      <PingToast
        message={error || notice}
        onClose={() => {
          setError("");
          setNotice("");
        }}
        variant={error ? "error" : "success"}
      />
      <div className="mx-auto w-[1280px] px-5 py-6 text-xs">
        <section className="overflow-visible rounded-md border border-zinc-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <textarea
            className="h-44 w-full resize-none rounded-md border border-zinc-300 bg-zinc-50 p-4 font-mono text-xs leading-6 text-zinc-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100 dark:focus:bg-gray-900 dark:focus:ring-blue-950"
            disabled={busy}
            onChange={(event) => setInput(event.target.value)}
            placeholder={placeholder}
            value={input}
          />

          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                className="h-10 rounded-md bg-blue-600 px-6 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                disabled={busy || status === "loading"}
                onClick={() => void submit()}
                type="button"
              >
                {busy ? "检测中" : "开始测试"}
              </button>
              <button
                className="h-10 rounded-md bg-zinc-700 px-5 font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                disabled={busy}
                onClick={() => void snapshot()}
                type="button"
              >
                完整截图
              </button>
            </div>
            <NodePicker
              disabled={busy}
              nodes={nodes}
              onChange={setSelectedNodes}
              selected={selectedNodes}
            />
          </div>

          <div className="mt-4 flex h-10 items-center gap-6 border-t border-zinc-100 pt-4 text-zinc-600 dark:border-gray-700 dark:text-gray-300">
            {mode === "tcping" ? (
              <label className="flex items-center gap-2">
                <span>默认端口</span>
                <input
                  className="h-8 w-24 rounded border border-zinc-300 bg-white px-2 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800"
                  disabled={busy}
                  max={65535}
                  min={1}
                  onChange={(event) => setDefaultPort(Number(event.target.value))}
                  type="number"
                  value={defaultPort}
                />
              </label>
            ) : null}
            <label className="flex items-center gap-2">
              <input
                checked={filterNetwork}
                disabled={busy}
                onChange={(event) => setFilterNetwork(event.target.checked)}
                type="checkbox"
              />
              过滤网络地址、广播地址和网关
            </label>
            <label className="flex items-center gap-2">
              <input
                checked={gatewayPosition === "first"}
                disabled={busy || !filterNetwork}
                name="gateway-position"
                onChange={() => setGatewayPosition("first")}
                type="radio"
              />
              网关为首个可用地址
            </label>
            <label className="flex items-center gap-2">
              <input
                checked={gatewayPosition === "last"}
                disabled={busy || !filterNetwork}
                name="gateway-position"
                onChange={() => setGatewayPosition("last")}
                type="radio"
              />
              网关为末个可用地址
            </label>
          </div>
        </section>

        <PingCenterAds ads={layoutConfig?.adLinks} />

        <section className="mt-5 overflow-visible rounded-md border border-zinc-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex h-14 items-center justify-between border-b border-zinc-200 px-4 dark:border-gray-700">
            <div className="flex items-center gap-4 text-zinc-600 dark:text-gray-300">
              <span className="font-medium text-zinc-800 dark:text-gray-100">检测结果</span>
              <span>目标进度 {completedRows}/{targets.length}</span>
              <span>节点响应 {receivedCells}/{totalCells}</span>
              {targets.length ? (
                <div className="h-1.5 w-44 overflow-hidden rounded-full bg-zinc-100 dark:bg-gray-700">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${totalCells ? Math.min(100, (receivedCells / totalCells) * 100) : 0}%` }}
                  />
                </div>
              ) : null}
            </div>
            <div className="flex items-center rounded-md border border-zinc-200 p-0.5 dark:border-gray-700">
              {FILTERS.map((item) => (
                <button
                  className={`h-7 px-3 transition ${filter === item.value ? "bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900" : "text-zinc-500 hover:bg-zinc-100 dark:text-gray-400 dark:hover:bg-gray-800"}`}
                  key={item.value}
                  onClick={() => setFilter(item.value)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-visible">
            <table className="w-full min-w-[1238px] table-fixed text-xs">
              <colgroup>
                <col className="w-12" />
                <col className="w-[210px]" />
                {activeNodes.map((node) => <col className="w-[195px]" key={node.key} />)}
              </colgroup>
              <thead className="sticky top-14 z-40 bg-zinc-50 text-zinc-500 shadow-sm dark:bg-gray-800 dark:text-gray-300">
                <tr>
                  <th className={`px-2 py-3 text-center ${TABLE_DIVIDER}`}>序号</th>
                  <th className={`px-3 py-3 text-left ${TABLE_DIVIDER}`}>检测目标</th>
                  {activeNodes.map((node) => {
                    const id = nodeId(node);
                    const direction = sort.nodeId === id ? sort.direction : null;
                    return (
                      <th className={`px-3 py-3 text-center ${TABLE_DIVIDER}`} key={node.key}>
                        <button
                          className="w-full rounded px-2 py-1 transition hover:bg-zinc-100 dark:hover:bg-gray-700"
                          onClick={() => changeSort(id)}
                          title="按响应时间排序"
                          type="button"
                        >
                          <span className="block truncate font-medium text-zinc-700 dark:text-gray-100">
                            {nodeDisplayName(node)} {direction === "asc" ? "↑" : direction === "desc" ? "↓" : ""}
                          </span>
                          <span className="mt-1 block text-[11px] font-normal text-zinc-400">{node.operators}</span>
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="text-xs">
                {visibleTargets.map((target) => {
                  const allTimedOut = activeNodes.length > 0
                    && responseCount(target, activeNodes, results) === activeNodes.length
                    && successCount(target, activeNodes, results) === 0;
                  return (
                    <tr
                      className={`border-t border-zinc-100 align-middle dark:border-gray-700 ${allTimedOut ? "bg-red-50/70 dark:bg-red-950/30" : "hover:bg-zinc-50 dark:hover:bg-gray-800/60"}`}
                      key={target.index}
                    >
                      <td className={`px-2 py-3 text-center text-zinc-400 ${TABLE_DIVIDER}`}>{target.index + 1}</td>
                      <td className={`break-all px-3 py-3 font-mono text-zinc-700 dark:text-gray-200 ${TABLE_DIVIDER}`}>
                        {target.displayTarget}
                      </td>
                      {activeNodes.map((node) => (
                        <td className={`h-[86px] px-3 py-2 ${TABLE_DIVIDER}`} key={node.key}>
                          <NodeResultCell result={results[resultKey(target.index, nodeId(node))]} />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!targets.length ? (
            <div className="flex h-48 items-center justify-center text-zinc-400 dark:text-gray-500">
              {status === "loading" ? "正在加载节点..." : "暂无检测结果"}
            </div>
          ) : visibleTargets.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-zinc-400 dark:text-gray-500">当前筛选条件下没有结果</div>
          ) : null}
        </section>
      </div>
    </PingShell>
  );
}
