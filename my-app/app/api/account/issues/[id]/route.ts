import { fetchAuthenticatedBackend, proxyJson } from "@/lib/auth/backend";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!/^\d+$/.test(id)) {
    return Response.json({ code: 400, msg: "问题编号无效" }, { status: 400 });
  }
  try {
    return proxyJson(await fetchAuthenticatedBackend(request, `/ping/issues/mine/${id}`));
  } catch {
    return Response.json({ code: 502, msg: "问题详情暂时不可用" }, { status: 502 });
  }
}
