import { fetchAuthenticatedBackend, proxyJson } from "@/lib/auth/backend";

export async function GET(request: Request) {
  try {
    return proxyJson(await fetchAuthenticatedBackend(request, "/ping/account/me"));
  } catch {
    return Response.json({ code: 502, msg: "账号服务暂时不可用" }, { status: 502 });
  }
}
