"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { PingNode } from "@/lib/ping/types";

const OPERATOR_GROUPS = ["移动", "联通", "电信", "其他"] as const;
type OperatorGroup = (typeof OPERATOR_GROUPS)[number];

function operatorGroup(node: PingNode): OperatorGroup {
  const operator = node.operators?.trim();
  if (operator === "移动" || operator === "联通" || operator === "电信") {
    return operator;
  }
  return "其他";
}

export function tracerouteNodeName(node: PingNode) {
  return node.name || [node.city, node.operators].filter(Boolean).join(" ") || `节点 ${node.key}`;
}

export function sortTracerouteNodes(nodes: PingNode[]) {
  const rank = new Map(OPERATOR_GROUPS.map((group, index) => [group, index]));
  return nodes
    .map((node, index) => ({ index, node }))
    .sort((left, right) => {
      const groupDifference = (rank.get(operatorGroup(left.node)) ?? 99) - (rank.get(operatorGroup(right.node)) ?? 99);
      return groupDifference || left.index - right.index;
    })
    .map(({ node }) => node);
}

export function TracerouteNodeSelector({
  disabled,
  nodes,
  onChange,
  selectedNodeId,
}: {
  disabled: boolean;
  nodes: PingNode[];
  onChange: (value: number) => void;
  selectedNodeId: number | null;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const orderedNodes = useMemo(() => sortTracerouteNodes(nodes), [nodes]);
  const selectedNode = orderedNodes.find((node) => Number(node.key) === selectedNodeId) ?? null;

  useEffect(() => {
    function closePicker(event: MouseEvent) {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", closePicker);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closePicker);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  useEffect(() => {
    if (open) {
      searchRef.current?.focus();
    }
  }, [open]);

  const groupedNodes = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const visibleNodes = orderedNodes.filter((node) => {
      if (!keyword) return true;
      return [node.name, node.city, node.province, node.region, node.operators, String(node.key)]
        .some((value) => value?.toLowerCase().includes(keyword));
    });
    return OPERATOR_GROUPS.map((group) => ({
      group,
      nodes: visibleNodes.filter((node) => operatorGroup(node) === group),
    })).filter((item) => item.nodes.length);
  }, [orderedNodes, search]);

  function chooseNode(node: PingNode) {
    onChange(Number(node.key));
    setOpen(false);
    setSearch("");
  }

  return (
    <div className="relative w-64 shrink-0" ref={pickerRef}>
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="路由追踪节点"
        className="flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-zinc-300 bg-zinc-50 px-3 text-left text-sm text-zinc-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:text-zinc-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-950"
        disabled={disabled || !nodes.length}
        onClick={() => {
          if (open) setSearch("");
          setOpen((current) => !current);
        }}
        type="button"
      >
        <span className="min-w-0 flex-1 truncate">
          {selectedNode ? tracerouteNodeName(selectedNode) : nodes.length ? "选择路由追踪节点" : "暂无可用节点"}
        </span>
        {selectedNode?.operators ? <span className="shrink-0 text-xs text-zinc-400 dark:text-gray-500">{selectedNode.operators}</span> : null}
        <span aria-hidden="true" className={`shrink-0 text-xs text-zinc-400 transition ${open ? "rotate-180" : ""}`}>v</span>
      </button>

      {open && !disabled ? (
        <div className="absolute right-0 top-12 z-40 w-80 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
          <div className="border-b border-zinc-100 p-3 dark:border-gray-700">
            <input
              aria-label="搜索路由追踪节点"
              className="h-9 w-full rounded border border-zinc-300 bg-zinc-50 px-3 text-xs text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-950"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="搜索节点名称、省份、城市或运营商"
              ref={searchRef}
              value={search}
            />
          </div>
          <div className="max-h-80 overflow-y-auto p-2" role="listbox">
            {groupedNodes.length ? groupedNodes.map((item) => (
              <div key={item.group}>
                <div className="px-3 py-1.5 text-[11px] font-medium text-zinc-400 dark:text-gray-500">{item.group}</div>
                {item.nodes.map((node) => {
                  const selected = Number(node.key) === selectedNodeId;
                  return (
                    <button
                      aria-selected={selected}
                      className={`flex w-full items-center gap-3 rounded px-3 py-2 text-left text-xs transition ${selected ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" : "text-zinc-700 hover:bg-zinc-50 dark:text-gray-200 dark:hover:bg-gray-800"}`}
                      key={node.key}
                      onClick={() => chooseNode(node)}
                      role="option"
                      type="button"
                    >
                      <span className="min-w-0 flex-1 truncate">{tracerouteNodeName(node)}</span>
                      <span className="shrink-0 text-zinc-400 dark:text-gray-500">{node.operators || "其他"}</span>
                    </button>
                  );
                })}
              </div>
            )) : (
              <div className="px-3 py-8 text-center text-xs text-zinc-400 dark:text-gray-500">没有匹配的节点</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
