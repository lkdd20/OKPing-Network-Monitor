"use client";

import { toPng } from "html-to-image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { MtrTraceTable } from "@/components/ping/MtrTraceTable";
import { PingCenterAds } from "@/components/ping/PingAdSlots";
import { TracerouteControls } from "@/components/ping/TracerouteControls";
import { sortTracerouteNodes, tracerouteNodeName } from "@/components/ping/TracerouteNodeSelector";
import { PingShell } from "@/components/ping/PingShell";
import { PingToast } from "@/components/ping/PingToast";
import { DEFAULT_PING_WS_BASE_URL } from "@/lib/ping/constants";
import type {
  PingNode,
  PingNodeMessage,
  PingPublicLayoutConfig,
  PingResponse,
  PingTracerouteResult,
} from "@/lib/ping/types";
import type { AccountToolKey } from "@/lib/auth/account";
import { useToolPreference } from "@/lib/auth/preferencesClient";

const WS_BASE_URL = process.env.NEXT_PUBLIC_PING_WS_BASE_URL ?? DEFAULT_PING_WS_BASE_URL;
const TRACEROUTE_RESULT_TIMEOUT_MS = 100_000;

type RunStatus = "loading" | "idle" | "submitting" | "running" | "completed" | "error";

type SubmitResponse = PingResponse<{
  accessKey?: string;
  target?: string;
  taskId?: string;
}> & {
  task_id?: string;
};

function responseMessage(body: PingResponse<unknown> | null, fallback: string) {
  return body?.msg || body?.message || fallback;
}

function accessKey(body: SubmitResponse | null) {
  return body?.data?.accessKey || body?.data?.taskId || body?.task_id || "";
}

function nodeName(node: PingNode | null) {
  if (!node) return "-";
  return tracerouteNodeName(node);
}

function statusText(status: RunStatus, result: PingTracerouteResult | null) {
  if (status === "loading") return "加载节点";
  if (status === "submitting") return "提交任务";
  if (status === "running") return "追踪中";
  if (status === "error") return "异常";
  if (status === "completed") return result?.reached ? "已到达目标" : "追踪结束";
  return "等待开始";
}

function mergeTracerouteResult(
  current: PingTracerouteResult | null,
  incoming: PingTracerouteResult,
) {
  const hops = new Map((current?.hops ?? []).map((hop) => [hop.hop, hop]));
  incoming.hops.forEach((hop) => hops.set(hop.hop, hop));
  return {
    ...(current ?? incoming),
    ...incoming,
    hops: [...hops.values()].sort((left, right) => left.hop - right.hop),
    reached: Boolean(current?.reached || incoming.reached),
  };
}

export function TracerouteClient({
  activePath = "/traceroute",
  apiPath = "/api/traceroute",
  clearPath = "/traceroute",
  firstNodesApiPath = "/api/ping/nodes/traceroute/first",
  initialError,
  initialTarget,
  layoutConfig,
  placeholder = "请输入域名或 IPv4，例如：example.com、8.8.8.8",
  screenshotSuffix = "traceroute",
}: {
  activePath?: string;
  apiPath?: string;
  clearPath?: string;
  firstNodesApiPath?: string;
  initialError?: string;
  initialTarget: string;
  layoutConfig?: PingPublicLayoutConfig;
  placeholder?: string;
  screenshotSuffix?: string;
}) {
  const [target, setTarget] = useState(initialTarget);
  const [nodes, setNodes] = useState<PingNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [activeNode, setActiveNode] = useState<PingNode | null>(null);
  const [dns, setDns] = useState("");
  const [useCustomDns, setUseCustomDns] = useState(false);
  const [result, setResult] = useState<PingTracerouteResult | null>(null);
  const [status, setStatus] = useState<RunStatus>("loading");
  const [error, setError] = useState(initialError ?? "");
  const [notice, setNotice] = useState("");
  const [isSnapshotting, setIsSnapshotting] = useState(false);
  const toolPreference = useToolPreference(
    (activePath.includes("_v6") ? "traceroute_v6" : "traceroute") as AccountToolKey,
  );
  const preferenceAppliedRef = useRef(false);
  const socketRef = useRef<WebSocket | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const runIdRef = useRef(0);
  const terminalRunRef = useRef<number | null>(null);
  const captureRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!toolPreference || preferenceAppliedRef.current) return;
    preferenceAppliedRef.current = true;
    setUseCustomDns(toolPreference.dnsMode === "custom");
    setDns(toolPreference.dnsMode === "custom" ? toolPreference.customDns : "");
  }, [toolPreference]);

  const clearResultTimeout = useCallback(() => {
    if (timeoutRef.current != null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
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
        const response = await fetch(firstNodesApiPath, { cache: "no-store" });
        const body = (await response.json().catch(() => null)) as PingResponse<PingNode[]> | null;
        const code = typeof body?.code === "string" ? Number(body.code) : body?.code;
        if (!response.ok || (typeof code === "number" && code !== 200)) {
          throw new Error(responseMessage(body, "路由追踪节点加载失败。"));
        }
        const loadedNodes = sortTracerouteNodes(Array.isArray(body?.data) ? body.data : []);
        if (!cancelled) {
          setNodes(loadedNodes);
          setSelectedNodeId(loadedNodes[0]?.key ?? null);
          if (!loadedNodes.length) setError("暂无支持路由追踪的在线节点。");
          setStatus("idle");
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "路由追踪节点加载失败。");
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
  }, [closeSocket, firstNodesApiPath]);

  const selectedNode = useMemo(
    () => nodes.find((node) => Number(node.key) === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );
  const isBusy = status === "submitting" || status === "running";

  function connect(key: string, runId: number) {
    const socket = new WebSocket(`${WS_BASE_URL.replace(/\/$/, "")}/${encodeURIComponent(key)}`);
    socketRef.current = socket;
    timeoutRef.current = window.setTimeout(() => {
      if (runIdRef.current !== runId || terminalRunRef.current === runId) return;
      terminalRunRef.current = runId;
      setError("路由追踪等待超时，请检查节点网络或稍后重试。");
      setStatus("error");
      socket.close();
    }, TRACEROUTE_RESULT_TIMEOUT_MS);

    socket.addEventListener("open", () => {
      if (runIdRef.current !== runId) return;
      setStatus("running");
      socket.send("start");
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
          terminalRunRef.current = runId;
          clearResultTimeout();
          setError(responseMessage(message, "路由追踪任务执行失败。"));
          setStatus("error");
          socket.close();
        }
        return;
      }

      if (message.traceResult) {
        const traceResult = message.traceResult;
        setResult((current) => message.finalResult
          ? traceResult
          : mergeTracerouteResult(current, traceResult));
        setError(message.error || "");
        if (message.finalResult) {
          terminalRunRef.current = runId;
          clearResultTimeout();
          setStatus("completed");
          socket.close();
        } else {
          setStatus("running");
        }
        return;
      }
      if (message.error) {
        terminalRunRef.current = runId;
        clearResultTimeout();
        setError(message.error);
        setStatus("error");
        socket.close();
      }
    });
    socket.addEventListener("error", () => {
      if (runIdRef.current !== runId || terminalRunRef.current === runId) return;
      terminalRunRef.current = runId;
      clearResultTimeout();
      setError("WebSocket 连接失败，请确认检测服务可用。");
      setStatus("error");
    });
    socket.addEventListener("close", () => {
      if (socketRef.current === socket) socketRef.current = null;
      if (runIdRef.current !== runId || terminalRunRef.current === runId) return;
      terminalRunRef.current = runId;
      clearResultTimeout();
      setError("WebSocket 连接已提前关闭，请稍后重试。");
      setStatus("error");
    });
  }

  async function start() {
    const normalizedTarget = target.trim();
    if (!normalizedTarget) {
      setError("请输入要追踪的域名或 IP。");
      return;
    }
    if (!selectedNodeId || !selectedNode) {
      setError("请选择路由追踪节点。");
      return;
    }
    if (useCustomDns && !dns.trim()) {
      setError("请输入指定 DNS 地址。");
      return;
    }

    runIdRef.current += 1;
    const runId = runIdRef.current;
    terminalRunRef.current = null;
    closeSocket();
    setResult(null);
    setActiveNode(selectedNode);
    setError("");
    setNotice("");
    setStatus("submitting");
    window.history.replaceState(null, "", `${clearPath}?url=${encodeURIComponent(normalizedTarget)}`);

    try {
      const response = await fetch(apiPath, {
        body: JSON.stringify({
          dns: useCustomDns ? dns : null,
          nodeId: selectedNodeId,
          url: normalizedTarget,
        }),
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const body = (await response.json().catch(() => null)) as SubmitResponse | null;
      const code = typeof body?.code === "string" ? Number(body.code) : body?.code;
      if (!response.ok || (typeof code === "number" && code !== 200)) {
        throw new Error(responseMessage(body, "路由追踪任务提交失败。"));
      }
      const key = accessKey(body);
      if (!key) throw new Error("后端响应中没有任务 UUID。");
      connect(key, runId);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "路由追踪任务提交失败。");
      setStatus("error");
    }
  }

  function stop() {
    runIdRef.current += 1;
    closeSocket();
    setStatus("idle");
    setNotice("路由追踪已停止。");
  }

  async function snapshot() {
    if (!captureRef.current) return;
    setIsSnapshotting(true);
    setError("");
    try {
      const dataUrl = await toPng(captureRef.current, { pixelRatio: 1, quality: 1 });
      const link = document.createElement("a");
      link.download = `ping-${screenshotSuffix}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      setNotice("截图已生成。");
    } catch {
      setError("截图生成失败，请稍后重试。");
    } finally {
      setIsSnapshotting(false);
    }
  }

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
      <div className="mx-auto w-full max-w-7xl space-y-5 px-6 py-5" ref={captureRef}>
        <section className="rounded-lg border border-zinc-200 bg-white px-6 py-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <TracerouteControls
            clearPath={clearPath}
            dns={dns}
            initialTarget={initialTarget}
            isBusy={isBusy}
            isSnapshotting={isSnapshotting}
            nodes={nodes}
            onDnsChange={setDns}
            onNodeChange={setSelectedNodeId}
            onSnapshot={() => void snapshot()}
            onStart={() => void start()}
            onStop={stop}
            onTargetChange={setTarget}
            onUseCustomDnsChange={(enabled) => {
              setUseCustomDns(enabled);
              if (!enabled) setDns("");
            }}
            selectedNodeId={selectedNodeId}
            target={target}
            placeholder={placeholder}
            useCustomDns={useCustomDns}
          />
        </section>

        <PingCenterAds ads={layoutConfig?.adLinks} />

        <section className="grid grid-cols-4 border-y border-zinc-200 bg-white py-3 text-xs dark:border-gray-700 dark:bg-gray-900">
          <div className="border-r border-zinc-200 px-4 dark:border-gray-700">
            <div className="text-zinc-400 dark:text-gray-500">状态</div>
            <div className="mt-1 font-medium text-zinc-700 dark:text-gray-100">{statusText(status, result)}</div>
          </div>
          <div className="border-r border-zinc-200 px-4 dark:border-gray-700">
            <div className="text-zinc-400 dark:text-gray-500">检测节点</div>
            <div className="mt-1 truncate font-medium text-zinc-700 dark:text-gray-100">{nodeName(activeNode || selectedNode)}</div>
          </div>
          <div className="border-r border-zinc-200 px-4 dark:border-gray-700">
            <div className="text-zinc-400 dark:text-gray-500">目标地址</div>
            <div className="mt-1 truncate font-mono font-medium text-zinc-700 dark:text-gray-100">{result?.targetIp || target || "-"}</div>
          </div>
          <div className="px-4">
            <div className="text-zinc-400 dark:text-gray-500">路径</div>
            <div className="mt-1 font-medium text-zinc-700 dark:text-gray-100">
              {result ? `${result.hops.length} hops · ${(result.durationMilliseconds / 1000).toFixed(2)} s` : "-"}
            </div>
          </div>
        </section>

        <MtrTraceTable isLoading={isBusy} result={result} />
      </div>
    </PingShell>
  );
}
