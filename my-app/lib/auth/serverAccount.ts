import "server-only";

import { cookies, headers } from "next/headers";

import type { AccountProfile } from "@/lib/auth/account";

import {
  getAuthBackendUrl,
  getWebClientId,
  PING_SESSION_COOKIE,
} from "@/lib/auth/backend";

type Envelope<T> = { code?: number | string; data?: T };

export async function getAuthenticatedAccountProfile(): Promise<AccountProfile | null> {
  const token = (await cookies()).get(PING_SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const requestHeaders = await headers();
    const response = await fetch(getAuthBackendUrl("/ping/account/me"), {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        clientid: getWebClientId(),
        ...(requestHeaders.get("user-agent") ? { "User-Agent": requestHeaders.get("user-agent") as string } : {}),
        ...(requestHeaders.get("x-forwarded-for")
          ? { "X-Forwarded-For": requestHeaders.get("x-forwarded-for") as string }
          : {}),
        ...(requestHeaders.get("x-real-ip") ? { "X-Real-IP": requestHeaders.get("x-real-ip") as string } : {}),
      },
    });
    const body = (await response.json().catch(() => null)) as Envelope<AccountProfile> | null;
    if (!response.ok || !body?.data || String(body.code) !== "200") return null;
    return body.data;
  } catch {
    return null;
  }
}
