import { fetchAuthenticatedBackend, proxyJson } from "@/lib/auth/backend";

export async function GET(request: Request) {
  try {
    return proxyJson(await fetchAuthenticatedBackend(request, "/ping/account/sessions"));
  } catch {
    return Response.json({ code: 502, msg: "登录设备服务暂时不可用" }, { status: 502 });
  }
}
