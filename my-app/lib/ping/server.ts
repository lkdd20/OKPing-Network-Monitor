import { DEFAULT_PING_BACKEND_BASE_URL } from "./constants";
import type {
  NodeScreenRequest,
  ProbePayload,
  PingAdLinks,
  PingLinkItem,
  PingMilestone,
  PingPublicLayoutConfig,
  PingPublicPageConfig,
  PingPublicIpFeedbackPage,
  PingIpInfo,
  PingSponsor,
  PingBlogPage,
  PingBlogPostDetail,
  PingNode,
  PingResponse,
  PingWhois,
  PingPublicIssue,
  PingPublicIssuePage,
} from "./types";
import {PING_SESSION_COOKIE} from "@/lib/auth/backend";

function getBackendBaseUrl() {
  return (
    process.env.PING_BACKEND_BASE_URL ??
    process.env.BACKEND_PING_BASE_URL ??
    DEFAULT_PING_BACKEND_BASE_URL
  ).replace(/\/$/, "");
}

function getBackendUrl(path: string) {
  return `${getBackendBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

function decodeRouteSegment(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function getResponseMessage(body: PingResponse<unknown>) {
  return body.msg ?? body.message ?? "";
}

function getResponseCode(body: PingResponse<unknown>) {
  return typeof body.code === "string" ? Number(body.code) : body.code;
}

async function requestBackend<T>(path: string, init?: RequestInit) {
  const hasNextCacheOptions = init && "next" in init;
  const response = await fetch(getBackendUrl(path), {
    ...init,
    ...(hasNextCacheOptions ? {} : { cache: init?.cache ?? "no-store" }),
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
  });

  const body = (await response.json().catch(() => null)) as PingResponse<T> | null;

  if (!response.ok) {
    throw new Error(
      body
        ? getResponseMessage(body) || `后端请求失败，状态码 ${response.status}`
        : `后端请求失败，状态码 ${response.status}`,
    );
  }

  if (!body) {
    throw new Error("后端响应为空");
  }

  const code = getResponseCode(body);
  if (typeof code === "number" && code !== 200) {
    throw new Error(getResponseMessage(body) || `后端返回异常状态 ${code}`);
  }

  if (body.data === undefined || body.data === null) {
    throw new Error(getResponseMessage(body) || "后端响应缺少 data");
  }

  return body.data;
}

async function requestWsAccessKey(path: string, init?: RequestInit) {
  const { cookies } = await import("next/headers");
  const token = (await cookies()).get(PING_SESSION_COOKIE)?.value;
  const response = await fetch(getBackendUrl(path), {
    ...init,
    cache: "no-store",
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  });

  const responseText = await response.text().catch(() => "");
  let body: PingResponse<string> | null = null;

  if (responseText) {
    try {
      body = JSON.parse(responseText) as PingResponse<string>;
    } catch {
      if (!response.ok) {
        throw new Error(responseText || `后端请求失败，状态码 ${response.status}`);
      }

      throw new Error("后端响应不是合法 JSON");
    }
  }

  if (!response.ok) {
    throw new Error(
      body
        ? getResponseMessage(body) || `后端请求失败，状态码 ${response.status}`
        : `后端请求失败，状态码 ${response.status}`,
    );
  }

  if (!body) {
    throw new Error("后端响应为空");
  }

  const code = getResponseCode(body);
  if (typeof code === "number" && code !== 200) {
    const message = getResponseMessage(body);
    if (code === 404 && message === "请求地址不存在") {
      throw new Error("后端 /ping/user/check 接口不存在，请重启 RuoYi 后端到最新代码。");
    }

    throw new Error(getResponseMessage(body) || `后端返回异常状态 ${code}`);
  }

  if (typeof body.data === "string" && body.data) {
    return body.data;
  }

  if (typeof body.msg === "string" && body.msg) {
    return body.msg;
  }

  throw new Error("后端响应缺少任务 UUID");
}

export function fetchFirstNodes() {
  return requestBackend<PingNode[]>("/ping/nodes/first");
}

export function fetchIPv6FirstNodes() {
  return requestBackend<PingNode[]>("/ping/nodes/ipv6/first");
}

export function fetchTracerouteNodes() {
  return requestBackend<PingNode[]>("/ping/nodes/traceroute/first");
}

export function fetchIPv6TracerouteNodes() {
  return requestBackend<PingNode[]>("/ping/nodes/ipv6/traceroute/first");
}

export function fetchScreenNodes(query: NodeScreenRequest) {
  return requestBackend<PingNode[]>("/ping/nodes/screen", {
    body: JSON.stringify(query),
    method: "POST",
  });
}

export function fetchIPv6ScreenNodes(query: NodeScreenRequest) {
  return requestBackend<PingNode[]>("/ping/nodes/ipv6/screen", {
    body: JSON.stringify(query),
    method: "POST",
  });
}

export async function createWsAccessKey(payload: ProbePayload) {
  return requestWsAccessKey("/ping/user/check", {
    body: JSON.stringify(payload),
    method: "POST",
  });
}

export function fetchPublicPageConfig(pageKey: string, target: string, canonicalPath: string) {
  const params = new URLSearchParams();
  if (target) {
    params.set("target", target);
  }
  if (canonicalPath) {
    params.set("canonicalPath", canonicalPath);
  }

  const query = params.toString();
  return requestBackend<PingPublicPageConfig>(
    `/ping/page-config/public/${encodeURIComponent(pageKey)}${query ? `?${query}` : ""}`,
    {
      cache: "no-store",
    },
  );
}

export function fetchPublicIpFeedback({
  ip = "",
  pageNum = 1,
  pageSize = 6,
}: {
  ip?: string;
  pageNum?: number;
  pageSize?: number;
} = {}) {
  const params = new URLSearchParams({
    pageNum: String(pageNum),
    pageSize: String(pageSize),
  });
  if (ip.trim()) {
    params.set("ip", ip.trim());
  }
  return requestBackend<PingPublicIpFeedbackPage>(`/ping/ip-feedback/public?${params}`, {
    cache: "no-store",
  });
}

export function fetchIpInfo(ip: string) {
  return requestBackend<PingIpInfo>("/ping/ip-info/query", {
    body: JSON.stringify({ ip }),
    method: "POST",
  });
}

export function fetchWhois(host: string) {
  return requestBackend<PingWhois>("/ping/whois/query", {
    body: JSON.stringify({ host }),
    method: "POST",
  });
}

export function fetchCurrentClientIp(forwardedFor?: string | null, realIp?: string | null) {
  return requestBackend<string>("/ping/ip-info/client", {
    cache: "no-store",
    headers: {
      ...(forwardedFor ? { "X-Forwarded-For": forwardedFor } : {}),
      ...(realIp ? { "X-Real-IP": realIp } : {}),
    },
  });
}

export async function fetchPublicLayoutConfig(configKey = "default") {
  const [layoutConfig, friendshipLinks, adLinks] = await Promise.all([
    requestBackend<PingPublicLayoutConfig>(
      `/ping/layout-config/public/${encodeURIComponent(configKey)}`,
      {
        next: {
          revalidate: 300,
        },
      },
    ),
    fetchFriendshipLinks().catch(() => []),
    fetchAdLinks().catch(() => undefined),
  ]);

  return {
    ...layoutConfig,
    adLinks,
    friendshipLinks,
  };
}

export async function fetchFriendshipLinks() {
  const links = await requestBackend<Array<{ name?: string; title?: string; url?: string }>>(
    "/web/links/lists",
    {
      next: {
        revalidate: 300,
      },
    },
  );

  return links
    .map<PingLinkItem>((link) => ({
      title: link.title || link.name || "",
      url: link.url || "",
    }))
    .filter((link) => link.title && link.url);
}

export function fetchSponsors() {
  return requestBackend<PingSponsor[]>("/web/sponsors/lists", {
    next: {
      revalidate: 300,
    },
  });
}

export function fetchAdLinks() {
  return requestBackend<PingAdLinks>("/web/adLinks/lists", {
    next: {
      revalidate: 300,
    },
  });
}

export function fetchPublicBlogPosts({
  category = "",
  keyword = "",
  pageNum = 1,
  pageSize = 9,
}: {
  category?: string;
  keyword?: string;
  pageNum?: number;
  pageSize?: number;
} = {}) {
  const params = new URLSearchParams({
    pageNum: String(pageNum),
    pageSize: String(pageSize),
  });
  if (keyword.trim()) params.set("keyword", keyword.trim());
  if (category.trim()) params.set("category", category.trim());
  return requestBackend<PingBlogPage>(`/ping/blog/public?${params}`, {
    cache: "no-store",
  });
}

export function fetchPublicBlogPost(slug: string) {
  const decodedSlug = decodeRouteSegment(slug);
  return requestBackend<PingBlogPostDetail>(`/ping/blog/public/${encodeURIComponent(decodedSlug)}`, {
    cache: "no-store",
  });
}

export function fetchPublicMilestones() {
  return requestBackend<PingMilestone[]>("/ping/milestone/public", {
    next: {
      revalidate: 300,
    },
  });
}

export function fetchPublicIssues({
  keyword = "",
  pageNum = 1,
  pageSize = 10,
}: {
  keyword?: string;
  pageNum?: number;
  pageSize?: number;
} = {}) {
  const params = new URLSearchParams({
    pageNum: String(pageNum),
    pageSize: String(pageSize),
  });
  if (keyword.trim()) params.set("keyword", keyword.trim());
  return requestBackend<PingPublicIssuePage>(`/ping/issues/public?${params}`, {
    cache: "no-store",
  });
}

export function fetchPublicIssue(id: number | string) {
  return requestBackend<PingPublicIssue>(`/ping/issues/public/${encodeURIComponent(String(id))}`, {
    cache: "no-store",
  });
}
