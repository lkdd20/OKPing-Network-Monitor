import { fetchTracerouteNodes } from "@/lib/ping/server";

export async function GET() {
  try {
    return Response.json({
      code: 200,
      data: await fetchTracerouteNodes(),
    });
  } catch (error) {
    const message = error instanceof Error && error.message ? error.message : "路由追踪节点列表请求失败";

    return Response.json(
      {
        code: 502,
        message,
      },
      { status: 502 },
    );
  }
}
