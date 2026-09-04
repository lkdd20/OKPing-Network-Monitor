import { fetchAuthenticatedBackend, proxyJson } from "@/lib/auth/backend";

export async function GET(request: Request) {
  try {
    return proxyJson(await fetchAuthenticatedBackend(request, "/ping/product-beta/status"));
  } catch {
    return Response.json({ code: 502, msg: "内测报名服务暂时不可用" }, { status: 502 });
  }
}

export async function POST(request: Request) {
  try {
    return proxyJson(await fetchAuthenticatedBackend(request, "/ping/product-beta/signup", {
      method: "POST",
    }));
  } catch {
    return Response.json({ code: 502, msg: "内测报名服务暂时不可用" }, { status: 502 });
  }
}
