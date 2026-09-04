import { fetchAuthenticatedBackend, proxyJson } from "@/lib/auth/backend";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!/^\d+$/.test(id)) {
    return Response.json({ code: 400, msg: "问题编号无效" }, { status: 400 });
  }

  try {
    const body = (await request.json().catch(() => null)) as { content?: unknown } | null;
    const content = typeof body?.content === "string" ? body.content.trim() : "";
    if (!content) {
      return Response.json({ code: 400, msg: "回复内容不能为空" }, { status: 400 });
    }
    if (content.length > 5000) {
      return Response.json({ code: 400, msg: "回复内容不能超过5000个字" }, { status: 400 });
    }
    return proxyJson(await fetchAuthenticatedBackend(request, `/ping/issues/mine/${id}/messages`, {
      body: JSON.stringify({ content }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    }));
  } catch {
    return Response.json({ code: 502, msg: "回复提交失败，请稍后重试" }, { status: 502 });
  }
}
