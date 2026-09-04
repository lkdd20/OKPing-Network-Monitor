import { fetchWhois } from "@/lib/ping/server";

type WhoisRequest = {
  domain?: unknown;
  host?: unknown;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as WhoisRequest | null;
  const host = typeof body?.host === "string"
    ? body.host.trim()
    : typeof body?.domain === "string"
      ? body.domain.trim()
      : "";

  if (!host) {
    return Response.json({ code: 400, msg: "请输入要查询的域名" }, { status: 400 });
  }

  try {
    return Response.json({ code: 200, data: await fetchWhois(host) });
  } catch (error) {
    return Response.json(
      { code: 400, msg: error instanceof Error ? error.message : "WHOIS查询失败" },
      { status: 400 },
    );
  }
}
