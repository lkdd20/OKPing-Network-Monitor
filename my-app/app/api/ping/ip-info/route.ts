import { fetchIpInfo } from "@/lib/ping/server";

type IpInfoRequest = {
  ip?: unknown;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as IpInfoRequest | null;
  const ip = typeof body?.ip === "string" ? body.ip.trim() : "";
  if (!ip) {
    return Response.json({ code: 400, msg: "请输入IP地址" }, { status: 400 });
  }

  try {
    return Response.json({ code: 200, data: await fetchIpInfo(ip) });
  } catch (error) {
    return Response.json(
      { code: 400, msg: error instanceof Error ? error.message : "IP信息查询失败" },
      { status: 400 },
    );
  }
}
