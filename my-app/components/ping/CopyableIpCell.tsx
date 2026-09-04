"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Activity, Copy, EllipsisVertical, Globe2, Route, ScanSearch } from "lucide-react";

import { buildProbeSharePath } from "@/lib/ping/target";

type CopyableIpCellProps = {
  ip?: string | null;
  ipLocation?: string | null;
  value?: string | null;
  version?: "ipv4" | "ipv6";
  showActions?: boolean;
};

const COPY_HINT = "点击复制响应地址";
const COPY_SUCCESS_HINT = "已复制到剪贴板";
const COPY_RESET_DELAY_MS = 1200;

async function copyToClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
}

function extractIp(value?: string | null) {
  const source = value?.trim() ?? "";
  if (!source) return "";
  const bracketed = source.match(/^\[([^\]]+)\](?::\d+)?$/);
  if (bracketed) return bracketed[1];
  const ipv4WithPort = source.match(/^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/);
  if (ipv4WithPort) return ipv4WithPort[1];
  return source;
}

function isIpAddress(value: string) {
  return /^(?:\d{1,3}\.){3}\d{1,3}$/.test(value) || /^[\da-f:]+$/i.test(value) && value.includes(":");
}

function actionPaths(ip: string, version: "ipv4" | "ipv6") {
  const suffix = version === "ipv6" ? "_v6" : "";
  return {
    http: buildProbeSharePath(`/http${suffix}`, ip),
    ping: buildProbeSharePath(`/ping${suffix}`, ip),
    tcping: buildProbeSharePath(`/tcping${suffix}`, ip),
    traceroute: buildProbeSharePath(`/traceroute${suffix}`, ip),
  };
}

function feedbackPath(ip: string, version: "ipv4" | "ipv6", location?: string | null) {
  const params = new URLSearchParams({
    ip,
    version,
  });
  if (location?.trim()) {
    params.set("location", location.trim());
  }
  return `/ip-feedback?${params.toString()}`;
}

export function CopyableIpCell({ ip, ipLocation, showActions = true, value, version }: CopyableIpCellProps) {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0 });
  const timerRef = useRef<number | null>(null);
  const menuCloseTimerRef = useRef<number | null>(null);
  const actionButtonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const pureIp = extractIp(ip) || extractIp(value);
  const resolvedVersion = version ?? (pureIp.includes(":") ? "ipv6" : "ipv4");
  const paths = actionPaths(pureIp, resolvedVersion);
  const canUseIpActions = isIpAddress(pureIp);

  function clearMenuCloseTimer() {
    if (menuCloseTimerRef.current !== null) {
      window.clearTimeout(menuCloseTimerRef.current);
      menuCloseTimerRef.current = null;
    }
  }

  function closeMenu() {
    clearMenuCloseTimer();
    setMenuOpen(false);
  }

  function scheduleMenuClose() {
    clearMenuCloseTimer();
    menuCloseTimerRef.current = window.setTimeout(() => setMenuOpen(false), 220);
  }

  const positionMenu = useCallback((menuWidth = 160, menuHeight = 190) => {
    const button = actionButtonRef.current;
    if (!button) {
      return;
    }

    const buttonRect = button.getBoundingClientRect();
    const left = Math.min(
      Math.max(8, buttonRect.right - menuWidth),
      Math.max(8, window.innerWidth - menuWidth - 8),
    );
    const belowTop = buttonRect.bottom + 4;
    const top = belowTop + menuHeight <= window.innerHeight - 8
      ? belowTop
      : Math.max(8, buttonRect.top - menuHeight - 4);
    setMenuPosition({ left, top });
  }, []);

  function openMenu() {
    clearMenuCloseTimer();
    positionMenu();
    setMenuOpen(true);
  }

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
      if (menuCloseTimerRef.current !== null) {
        window.clearTimeout(menuCloseTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function syncMenuPosition() {
      const menu = menuRef.current;
      positionMenu(menu?.offsetWidth || 160, menu?.offsetHeight || 190);
    }

    syncMenuPosition();
    window.addEventListener("resize", syncMenuPosition);
    window.addEventListener("scroll", syncMenuPosition, true);
    return () => {
      window.removeEventListener("resize", syncMenuPosition);
      window.removeEventListener("scroll", syncMenuPosition, true);
    };
  }, [menuOpen, positionMenu]);

  async function handleCopy() {
    if (!value) {
      return;
    }

    try {
      await copyToClipboard(value);
      setCopied(true);
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(() => setCopied(false), COPY_RESET_DELAY_MS);
    } catch {
      setCopied(false);
    }
  }

  if (!value) {
    return <span className="text-zinc-400 dark:text-gray-500">--</span>;
  }

  return (
    <div className="group/ip relative inline-flex max-w-full flex-wrap items-start justify-center gap-0.5 text-center">
      <button
        aria-label={`点击复制响应地址 ${value}`}
        className="group/copy relative min-w-0 cursor-copy rounded px-1 py-1 text-left text-blue-600 transition hover:bg-zinc-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-400 dark:hover:bg-gray-800 dark:hover:text-blue-300"
        onClick={() => void handleCopy()}
        title={COPY_HINT}
        type="button"
      >
        <span className="block break-all text-xs font-medium leading-5 underline decoration-dotted underline-offset-4">{value}</span>
        <span className="pointer-events-none absolute -top-8 left-1/2 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded bg-zinc-900 px-2 py-1 text-[11px] font-medium text-white shadow-lg group-hover/copy:block group-focus-visible/copy:block dark:bg-zinc-100 dark:text-zinc-900">
          {copied ? COPY_SUCCESS_HINT : COPY_HINT}
        </span>
      </button>
      {canUseIpActions && showActions ? (
        <div className="mt-0.5 shrink-0">
          <button
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label="响应IP工具"
            className="inline-flex h-6 w-6 items-center justify-center rounded text-zinc-400 opacity-0 transition hover:bg-zinc-100 hover:text-zinc-700 focus:opacity-100 group-hover/ip:opacity-100 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            onBlur={scheduleMenuClose}
            onClick={() => (menuOpen ? closeMenu() : openMenu())}
            onFocus={openMenu}
            onMouseEnter={openMenu}
            onMouseLeave={scheduleMenuClose}
            ref={actionButtonRef}
            title="响应IP工具"
            type="button"
          >
            <EllipsisVertical aria-hidden="true" size={16} />
          </button>
        </div>
      ) : null}
      {menuOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed z-[200] w-40 pt-1"
              onBlur={scheduleMenuClose}
              onFocus={clearMenuCloseTimer}
              onMouseEnter={clearMenuCloseTimer}
              onMouseLeave={scheduleMenuClose}
              ref={menuRef}
              role="menu"
              style={{ left: menuPosition.left, top: menuPosition.top }}
            >
              <div className="overflow-hidden rounded-md border border-zinc-200 bg-white py-1 text-left shadow-lg dark:border-gray-700 dark:bg-gray-900">
                <Link className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-700 transition hover:bg-zinc-100 dark:text-gray-200 dark:hover:bg-gray-800" href={paths.ping} onClick={closeMenu} role="menuitem">
                  <Activity aria-hidden="true" size={14} /> Ping
                </Link>
                <Link className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-700 transition hover:bg-zinc-100 dark:text-gray-200 dark:hover:bg-gray-800" href={paths.tcping} onClick={closeMenu} role="menuitem">
                  <ScanSearch aria-hidden="true" size={14} /> TCPing
                </Link>
                <Link className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-700 transition hover:bg-zinc-100 dark:text-gray-200 dark:hover:bg-gray-800" href={paths.http} onClick={closeMenu} role="menuitem">
                  <Globe2 aria-hidden="true" size={14} /> 网站测速
                </Link>
                <Link className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-700 transition hover:bg-zinc-100 dark:text-gray-200 dark:hover:bg-gray-800" href={paths.traceroute} onClick={closeMenu} role="menuitem">
                  <Route aria-hidden="true" size={14} /> 路由追踪
                </Link>
                <Link className="flex items-center gap-2 border-t border-zinc-100 px-3 py-2 text-xs text-zinc-700 transition hover:bg-zinc-100 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800" href={feedbackPath(pureIp, resolvedVersion, ipLocation)} onClick={closeMenu} role="menuitem">
                  <Copy aria-hidden="true" size={14} /> IP 信息纠错
                </Link>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
