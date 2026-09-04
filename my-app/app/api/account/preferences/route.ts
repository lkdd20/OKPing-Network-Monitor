import { fetchAuthenticatedBackend, proxyJson } from "@/lib/auth/backend";

export async function GET(request: Request) {
  try {
    return proxyJson(await fetchAuthenticatedBackend(request, "/ping/account/preferences"));
  } catch {
    return Response.json({ code: 502, msg: "习惯设置服务暂时不可用" }, { status: 502 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.text();
    const response = await fetchAuthenticatedBackend(request, "/ping/account/preferences", {
      body,
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    });
    return proxyJson(response);
  } catch {
    return Response.json({ code: 502, msg: "习惯设置保存失败" }, { status: 502 });
  }
}
