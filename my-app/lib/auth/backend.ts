import { DEFAULT_PING_BACKEND_BASE_URL } from "@/lib/ping/constants";

export const PING_SESSION_COOKIE = "ping_session";

export function getAuthBackendUrl(path: string) {
  const baseUrl = (
    process.env.PING_BACKEND_BASE_URL ??
    process.env.BACKEND_PING_BASE_URL ??
    DEFAULT_PING_BACKEND_BASE_URL
  ).replace(/\/$/, "");

  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getWebClientId() {
  return process.env.PING_WEB_CLIENT_ID ?? "e5cd7e4891bf95d1d19206ce24a7b32e";
}

export function getForwardedRequestHeaders(request: Request) {
  const headers: Record<string, string> = {};
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const userAgent = request.headers.get("user-agent");

  if (forwardedFor) headers["X-Forwarded-For"] = forwardedFor;
  if (realIp) headers["X-Real-IP"] = realIp;
  if (userAgent) headers["User-Agent"] = userAgent;
  return headers;
}

export async function fetchAuthenticatedBackend(
  request: Request,
  path: string,
  init: RequestInit = {},
) {
  const { cookies } = await import("next/headers");
  const token = (await cookies()).get(PING_SESSION_COOKIE)?.value;
  if (!token) {
    return Response.json({ code: 401, msg: "登录状态已失效，请重新登录" }, { status: 401 });
  }

  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("clientid", getWebClientId());
  Object.entries(getForwardedRequestHeaders(request)).forEach(([key, value]) => headers.set(key, value));

  return fetch(getAuthBackendUrl(path), {
    ...init,
    cache: "no-store",
    headers,
  });
}

export async function proxyJson(response: Response) {
  const body = await response.text();
  let status = response.status;
  try {
    const parsed = JSON.parse(body) as { code?: number | string };
    if (String(parsed.code) === "401") status = 401;
  } catch {
    // Preserve the backend status when it does not return a JSON envelope.
  }

  return new Response(body, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": response.headers.get("Content-Type") ?? "application/json; charset=utf-8",
    },
    status,
  });
}
