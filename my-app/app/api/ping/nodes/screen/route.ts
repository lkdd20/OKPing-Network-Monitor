import { DEFAULT_REGIONS, OPERATOR_OPTIONS } from "@/lib/ping/constants";
import { fetchScreenNodes } from "@/lib/ping/server";
import type { NodeScreenRequest } from "@/lib/ping/types";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Partial<NodeScreenRequest> | null;
  const query: NodeScreenRequest = {
    operators: body?.operators?.length ? body.operators : [...OPERATOR_OPTIONS],
    region: body?.region?.length ? body.region : [...DEFAULT_REGIONS],
  };

  try {
    return Response.json({
      code: 200,
      data: await fetchScreenNodes(query),
    });
  } catch (error) {
    const message = error instanceof Error && error.message ? error.message : "筛选节点请求失败";

    return Response.json(
      {
        code: 502,
        message,
      },
      { status: 502 },
    );
  }
}
