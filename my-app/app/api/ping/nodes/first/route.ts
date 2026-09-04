import { fetchFirstNodes } from "@/lib/ping/server";

export async function GET() {
  try {
    return Response.json({
      code: 200,
      data: await fetchFirstNodes(),
    });
  } catch (error) {
    const message = error instanceof Error && error.message ? error.message : "节点列表请求失败";

    return Response.json(
      {
        code: 502,
        message,
      },
      { status: 502 },
    );
  }
}
