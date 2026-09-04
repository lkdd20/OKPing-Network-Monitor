import { NextResponse, type NextRequest } from "next/server";

import { DEFAULT_PING_BACKEND_BASE_URL } from "@/lib/ping/constants";

const PAGE_KEYS = new Set([
  "ping",
  "tcping",
  "http",
  "dns",
  "traceroute",
  "batch_ping",
  "batch_tcping",
  "ping_v6",
  "tcping_v6",
  "http_v6",
  "traceroute_v6",
  "ip",
  "whois",
]);

function getPageKey(pathname: string) {
  const pageKey = pathname.split("/").filter(Boolean)[0] || "";
  return PAGE_KEYS.has(pageKey) ? pageKey : null;
}

function getBackendBaseUrl() {
  return (
    process.env.PING_BACKEND_BASE_URL ??
    process.env.BACKEND_PING_BASE_URL ??
    DEFAULT_PING_BACKEND_BASE_URL
  ).replace(/\/$/, "");
}

async function isPageDisabled(request: NextRequest) {
  const pageKey = getPageKey(request.nextUrl.pathname);
  if (!pageKey) return false;

  const params = new URLSearchParams({
    canonicalPath: `${request.nextUrl.pathname}${request.nextUrl.search}`,
  });

  try {
    const response = await fetch(
      `${getBackendBaseUrl()}/ping/page-config/public/${encodeURIComponent(pageKey)}?${params}`,
      { cache: "no-store" },
    );
    if (!response.ok) return false;

    const body = (await response.json()) as { data?: { enabled?: boolean } };
    return body.data?.enabled === false;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/account" || request.nextUrl.pathname.startsWith("/account/")) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(
      "x-ping-account-path",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (request.method === "POST") {
    const url = request.nextUrl.clone();
    url.pathname = `/api${url.pathname}`;

    return NextResponse.rewrite(url);
  }

  if ((request.method === "GET" || request.method === "HEAD") && await isPageDisabled(request)) {
    const unavailableUrl = request.nextUrl.clone();
    unavailableUrl.pathname = "/page-unavailable";
    unavailableUrl.search = "";
    const response = NextResponse.rewrite(unavailableUrl, { status: 404 });
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/ping/:path*",
    "/tcping/:path*",
    "/http/:path*",
    "/dns/:path*",
    "/traceroute/:path*",
    "/batch_ping/:path*",
    "/batch_tcping/:path*",
    "/ping_v6/:path*",
    "/tcping_v6/:path*",
    "/http_v6/:path*",
    "/traceroute_v6/:path*",
    "/ip/:path*",
    "/whois/:path*",
    "/account/:path*",
  ],
};
