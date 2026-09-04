"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import {
  Activity,
  Cable,
  ChevronDown,
  CircleUserRound,
  Globe2,
  Home,
  ListTree,
  Moon,
  Network,
  Radar,
  Route,
  Search,
  Sun,
} from "lucide-react";

import type { PingNavItem, PingPublicLayoutConfig } from "@/lib/ping/types";
import type { AccountProfile } from "@/lib/auth/account";

import { mergeLayoutConfig } from "./layoutDefaults";

type NavIconKey =
  | "activity"
  | "batch"
  | "cable"
  | "dns"
  | "globe"
  | "home"
  | "http"
  | "ip"
  | "list"
  | "network"
  | "ping"
  | "radar"
  | "route"
  | "search"
  | "tcping"
  | "traceroute"
  | "user"
  | "whois";

const NAV_ICON_KEYS = new Set<string>([
  "activity",
  "batch",
  "cable",
  "dns",
  "globe",
  "home",
  "http",
  "ip",
  "list",
  "network",
  "ping",
  "radar",
  "route",
  "search",
  "tcping",
  "traceroute",
  "user",
  "whois",
]);

const URL_ICON_RULES: Array<[RegExp, NavIconKey]> = [
  [/^\/$/, "home"],
  [/batch/i, "batch"],
  [/ping/i, "ping"],
  [/tcping/i, "tcping"],
  [/http/i, "http"],
  [/dns/i, "dns"],
  [/trace|route/i, "traceroute"],
  [/whois/i, "whois"],
  [/ip/i, "ip"],
  [/v6|ipv6/i, "radar"],
];

function isActive(item: PingNavItem, activePath: string) {
  const url = item.url || "/";
  if (url === "/") {
    return activePath === "/";
  }

  return activePath === url || activePath.startsWith(`${url}/`);
}

function normalizeIconKey(value?: string) {
  return value?.trim().toLowerCase().replace(/[_\s]+/g, "-") ?? "";
}

function isNavIconKey(value: string): value is NavIconKey {
  return NAV_ICON_KEYS.has(value);
}

function getNavIconKey(item: PingNavItem): NavIconKey {
  const configuredIcon = normalizeIconKey(item.icon);

  if (isNavIconKey(configuredIcon)) {
    return configuredIcon;
  }

  const lookupText = `${item.url ?? ""} ${item.text ?? ""}`;
  const matched = URL_ICON_RULES.find(([pattern]) => pattern.test(lookupText));

  return matched ? matched[1] : "activity";
}

function renderNavIcon(item: PingNavItem, className = "h-4 w-4") {
  const iconClassName = `${className} shrink-0`;
  const iconProps = { "aria-hidden": true, className: iconClassName, strokeWidth: 1.9 } as const;

  switch (getNavIconKey(item)) {
    case "batch":
    case "list":
      return <ListTree {...iconProps} />;
    case "cable":
    case "tcping":
      return <Cable {...iconProps} />;
    case "dns":
    case "network":
      return <Network {...iconProps} />;
    case "globe":
    case "http":
    case "ip":
      return <Globe2 {...iconProps} />;
    case "home":
      return <Home {...iconProps} />;
    case "radar":
      return <Radar {...iconProps} />;
    case "route":
    case "traceroute":
      return <Route {...iconProps} />;
    case "search":
    case "whois":
      return <Search {...iconProps} />;
    case "user":
      return <CircleUserRound {...iconProps} />;
    case "activity":
    case "ping":
    default:
      return <Activity {...iconProps} />;
  }
}

function subscribeTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributeFilter: ["class"],
    attributes: true,
  });

  window.addEventListener("storage", callback);

  return () => {
    observer.disconnect();
    window.removeEventListener("storage", callback);
  };
}

function getThemeSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getThemeServerSnapshot() {
  return false;
}

function ThemeToggle() {
  const dark = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot);

  function toggleTheme() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("theme", next ? "dark" : "light");
    document.cookie = `darkMode=${String(next)}; path=/; max-age=31536000`;
  }

  return (
    <button
      aria-label="切换主题"
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg p-2.5 text-sm text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
      onClick={toggleTheme}
      type="button"
    >
      {dark ? (
        <Moon aria-hidden="true" className="h-4 w-4" strokeWidth={1.9} />
      ) : (
        <Sun aria-hidden="true" className="h-4 w-4" strokeWidth={1.9} />
      )}
    </button>
  );
}

function AccountButton({ activePath }: { activePath: string }) {
  const [profile, setProfile] = useState<AccountProfile | null | undefined>(undefined);

  const loadProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/account/me", { cache: "no-store" });
      const body = (await response.json().catch(() => null)) as {
        code?: number | string;
        data?: AccountProfile;
      } | null;
      setProfile(response.ok && String(body?.code) === "200" && body?.data ? body.data : null);
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadProfile(), 0);
    window.addEventListener("ping-auth-changed", loadProfile);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("ping-auth-changed", loadProfile);
    };
  }, [loadProfile]);

  const authenticated = Boolean(profile);
  const href = authenticated ? "/account/preferences" : "/login";
  const label = authenticated ? "个人中心" : "登录";
  const active = authenticated
    ? activePath === "/account" || activePath.startsWith("/account/")
    : activePath === "/login" || activePath.startsWith("/login/");

  return (
    <Link
      aria-label={profile === undefined ? "正在检查登录状态" : label}
      className={`inline-flex h-10 min-w-10 items-center justify-center gap-1.5 whitespace-nowrap rounded px-2.5 py-2 text-sm tracking-wide transition-all hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 ${
        active ? "bg-gray-100 text-gray-700 dark:bg-gray-600" : "text-gray-500"
      }`}
      href={href}
      title={authenticated ? `${label} · ${profile?.nickname || profile?.username || ""}` : label}
    >
      <CircleUserRound aria-hidden="true" className="h-4 w-4 shrink-0" strokeWidth={1.9} />
      <span className="hidden sm:inline">{profile === undefined ? "账户" : label}</span>
    </Link>
  );
}

export function PingHeader({
  activePath,
  layoutConfig,
}: {
  activePath: string;
  layoutConfig?: PingPublicLayoutConfig;
}) {
  const config = mergeLayoutConfig(layoutConfig);
  const navItems = config.navItems ?? [];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur transition-all dark:border-gray-700 dark:bg-gray-900/95">
      <div className="mx-auto flex h-14 w-full max-w-none items-center justify-between px-4">
        <div className="flex h-full min-w-0 flex-1 items-center gap-3">
          <Link className="mr-1 inline-flex h-full shrink-0 items-center" href="/">
            {/* eslint-disable-next-line @next/next/no-img-element -- Admin-configured logo URLs may be remote domains not known at build time. */}
            <img
              alt={config.siteName || ""}
              className="h-7 w-auto"
              height={32}
              src={config.logoUrl || "/logo_t.png"}
              width={115}
            />
            <span className={"ml-2"}>{config.siteName }</span>
          </Link>
          <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-visible max-lg:overflow-x-auto max-lg:pr-2 max-lg:[scrollbar-width:none] max-lg:[&::-webkit-scrollbar]:hidden">
            {navItems.map((item) => {
              const children = item.children?.filter((child) => child.text && child.url) ?? [];
              const active = isActive(item, activePath) || children.some((child) => isActive(child, activePath));

              if (children.length) {
                return (
                  <div className="group relative flex h-full items-center" key={item.url || item.text}>
                    <button
                      aria-haspopup="menu"
                      aria-label={item.text}
                      className={`inline-flex items-center gap-1 whitespace-nowrap rounded px-1.5 py-2 text-xs tracking-wide transition-all hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 ${
                        active ? "bg-gray-100 text-gray-700 dark:bg-gray-600" : "text-gray-500"
                      }`}
                      title={item.text}
                      type="button"
                    >
                      {renderNavIcon(item, "h-3.5 w-3.5")}
                      <span>{item.text}</span>
                      <ChevronDown aria-hidden="true" className="h-3.5 w-3.5 shrink-0" strokeWidth={1.9} />
                    </button>
                    <div className="invisible absolute left-0 top-full z-[70] w-44 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                      <div className="rounded-md border border-gray-100 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                        {children.map((child) => (
                          <Link
                            className={`flex items-center gap-2 px-3 py-2 text-sm transition hover:bg-gray-100 focus:bg-gray-100 focus:outline-none dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:bg-gray-700 ${
                              activePath === child.url ? "bg-gray-100 text-gray-700 dark:bg-gray-600" : "text-gray-500"
                            }`}
                            href={child.url || "/"}
                            key={child.url || child.text}
                            role="menuitem"
                          >
                            {renderNavIcon(child, "h-3.5 w-3.5")}
                            <span className="min-w-0 truncate">{child.text}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  aria-label={item.text}
                  className={`inline-flex items-center gap-1 whitespace-nowrap rounded px-1.5 py-2 text-xs tracking-wide transition-all hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 ${
                    active ? "bg-gray-100 text-gray-700 dark:bg-gray-600" : "text-gray-500"
                  }`}
                  href={item.url || "/"}
                  key={item.url || item.text}
                  title={item.text}
                >
                  {renderNavIcon(item, "h-3.5 w-3.5")}
                  <span>{item.text}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="relative z-[80] flex shrink-0 items-center gap-1 bg-white/95 pl-2 dark:bg-gray-900/95">
          <AccountButton activePath={activePath} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
