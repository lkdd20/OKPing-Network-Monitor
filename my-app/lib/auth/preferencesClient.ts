"use client";

import { useEffect, useState } from "react";

import type { AccountPreferences, AccountToolKey, ToolPreference } from "@/lib/auth/account";

type Envelope<T> = { code?: number | string; data?: T; msg?: string };

let cachedPreferences: AccountPreferences | null | undefined;
let pendingRequest: Promise<AccountPreferences | null> | null = null;
let cacheVersion = 0;

function isSuccess(code: number | string | undefined) {
  return code == null || String(code) === "200";
}

export async function loadAccountPreferences(force = false) {
  if (!force && cachedPreferences !== undefined) return cachedPreferences;
  if (!force && pendingRequest) return pendingRequest;

  const requestVersion = cacheVersion;
  const request = fetch("/api/account/preferences", { cache: "no-store" })
    .then(async (response) => {
      const body = (await response.json().catch(() => null)) as Envelope<AccountPreferences> | null;
      if (response.status === 401) {
        if (requestVersion === cacheVersion) cachedPreferences = null;
        return null;
      }
      if (!response.ok || !body || !isSuccess(body.code) || !body.data) {
        throw new Error(body?.msg || "习惯设置加载失败");
      }
      if (requestVersion === cacheVersion) cachedPreferences = body.data;
      return body.data;
    })
    .finally(() => {
      if (pendingRequest === request) pendingRequest = null;
    });
  pendingRequest = request;
  return request;
}

export function setCachedAccountPreferences(preferences: AccountPreferences) {
  cachedPreferences = preferences;
  window.dispatchEvent(new CustomEvent("ping-preferences-changed", { detail: preferences }));
}

export function resetCachedAccountPreferences() {
  cacheVersion += 1;
  cachedPreferences = undefined;
  pendingRequest = null;
}

export function useToolPreference(toolKey: AccountToolKey) {
  const [preference, setPreference] = useState<ToolPreference | null>(null);

  useEffect(() => {
    let cancelled = false;
    const apply = (preferences: AccountPreferences | null) => {
      if (!cancelled && preferences?.tools[toolKey]) setPreference(preferences.tools[toolKey]);
    };
    void loadAccountPreferences().then(apply).catch(() => undefined);
    const handleChange = (event: Event) => {
      apply((event as CustomEvent<AccountPreferences>).detail);
    };
    window.addEventListener("ping-preferences-changed", handleChange);
    return () => {
      cancelled = true;
      window.removeEventListener("ping-preferences-changed", handleChange);
    };
  }, [toolKey]);

  return preference;
}
