import { fetchAuthenticatedBackend, proxyJson } from "@/lib/auth/backend";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const pageNum = Math.max(1, Number(url.searchParams.get("pageNum")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize")) || 10));
  try {
    return proxyJson(await fetchAuthenticatedBackend(
      request,
      `/ping/account/login-logs?pageNum=${pageNum}&pageSize=${pageSize}`,
    ));
  } catch {
    return Response.json({ code: 502, msg: "登录日志服务暂时不可用" }, { status: 502 });
  }
}
