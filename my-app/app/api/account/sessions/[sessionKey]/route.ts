import {
  fetchAuthenticatedBackend,
  PING_SESSION_COOKIE,
} from "@/lib/auth/backend";

type RouteContext = {
  params: Promise<{ sessionKey: string }>;
};

export async function DELETE(request: Request, { params }: RouteContext) {
  const { sessionKey } = await params;
  if (!/^[0-9a-f]{32}$/.test(sessionKey)) {
    return Response.json({ code: 400, msg: "登录设备标识无效" }, { status: 400 });
  }

  try {
    const response = await fetchAuthenticatedBackend(
      request,
      `/ping/account/sessions/${encodeURIComponent(sessionKey)}`,
      { method: "DELETE" },
    );
    const body = await response.text();
    const parsed = JSON.parse(body) as {
      code?: number | string;
      data?: { currentSession?: boolean };
    };
    const headers = new Headers({
      "Cache-Control": "no-store",
      "Content-Type": response.headers.get("Content-Type") ?? "application/json; charset=utf-8",
    });
    if (response.ok && parsed.data?.currentSession) {
      headers.append(
        "Set-Cookie",
        `${PING_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${
          process.env.NODE_ENV === "production" ? "; Secure" : ""
        }`,
      );
    }
    const status = String(parsed.code) === "401" ? 401 : response.status;
    return new Response(body, { headers, status });
  } catch {
    return Response.json({ code: 502, msg: "设备下线失败" }, { status: 502 });
  }
}
