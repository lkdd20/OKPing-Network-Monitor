import { getAuthBackendUrl, getForwardedRequestHeaders } from "@/lib/auth/backend";

type RouteContext = {
  params: Promise<{ sessionId: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const { sessionId } = await params;
  const response = await fetch(
    getAuthBackendUrl(`/auth/wechat-miniapp/qr/${encodeURIComponent(sessionId)}/status`),
    {
      cache: "no-store",
      headers: getForwardedRequestHeaders(request),
    },
  );

  const body = (await response.json().catch(() => null)) as {
    code?: number | string;
    msg?: string;
    data?: {
      status?: string;
      access_token?: string;
      expire_in?: number;
      client_id?: string;
      authenticated?: boolean;
    };
  } | null;

  if (!body) {
    return Response.json({ code: 502, msg: "登录服务响应为空" }, { status: 502 });
  }

  const headers = new Headers({
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
  });
  const token = body.data?.access_token;
  if (response.ok && String(body.code) === "200" && token && body.data) {
    const maxAge = Math.max(60, Math.min(body.data.expire_in || 604800, 604800));
    headers.append(
      "Set-Cookie",
      `ping_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${
        process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`,
    );
    delete body.data.access_token;
    body.data.authenticated = true;
  }

  return new Response(JSON.stringify(body), {
    headers,
    status: response.status,
  });
}
