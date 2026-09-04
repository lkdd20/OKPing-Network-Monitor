import { fetchCurrentClientIp } from "@/lib/ping/server";

export async function GET(request: Request) {
  try {
    const ip = await fetchCurrentClientIp(
      request.headers.get("x-forwarded-for"),
      request.headers.get("x-real-ip"),
    );
    return Response.json({ code: 200, data: ip });
  } catch (error) {
    return Response.json(
      { code: 404, msg: error instanceof Error ? error.message : "未识别到公网IP" },
      { status: 404 },
    );
  }
}
