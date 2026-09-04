import { DEFAULT_PING_BACKEND_BASE_URL } from "@/lib/ping/constants";
import { fetchPublicIpFeedback } from "@/lib/ping/server";

function getBackendBaseUrl() {
  return (
    process.env.PING_BACKEND_BASE_URL ??
    process.env.BACKEND_PING_BASE_URL ??
    DEFAULT_PING_BACKEND_BASE_URL
  ).replace(/\/$/, "");
}

export async function POST(request: Request) {
  const body = await request.text();
  const response = await fetch(`${getBackendBaseUrl()}/ping/ip-feedback`, {
    body,
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const responseBody = await response.text();

  return new Response(responseBody, {
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
    status: response.status,
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const pageNum = Number.parseInt(url.searchParams.get("pageNum") || "1", 10);
  const pageSize = Number.parseInt(url.searchParams.get("pageSize") || "6", 10);
  try {
    const data = await fetchPublicIpFeedback({
      ip: url.searchParams.get("ip") || "",
      pageNum: Number.isFinite(pageNum) ? pageNum : 1,
      pageSize: Number.isFinite(pageSize) ? pageSize : 6,
    });
    return Response.json({ code: 200, data });
  } catch (error) {
    return Response.json(
      { code: 502, msg: error instanceof Error ? error.message : "反馈记录加载失败" },
      { status: 502 },
    );
  }
}
