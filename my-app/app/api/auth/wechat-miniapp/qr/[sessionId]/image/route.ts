import { getAuthBackendUrl } from "@/lib/auth/backend";

type RouteContext = {
  params: Promise<{ sessionId: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { sessionId } = await params;
  const response = await fetch(
    getAuthBackendUrl(`/auth/wechat-miniapp/qr/${encodeURIComponent(sessionId)}/image`),
    { cache: "no-store" },
  );

  return new Response(await response.arrayBuffer(), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": response.headers.get("Content-Type") ?? "image/png",
    },
    status: response.status,
  });
}
