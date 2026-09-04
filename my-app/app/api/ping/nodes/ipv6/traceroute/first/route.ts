import { fetchIPv6TracerouteNodes } from "@/lib/ping/server";

export async function GET() {
  try {
    return Response.json({ code: 200, data: await fetchIPv6TracerouteNodes() });
  } catch (error) {
    const message = error instanceof Error && error.message
      ? error.message
      : "IPv6 路由追踪节点列表请求失败";
    return Response.json({ code: 502, message }, { status: 502 });
  }
}
