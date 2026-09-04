import { isIP } from "node:net";

import { createWsAccessKey } from "@/lib/ping/server";
import { parseProbeTarget } from "@/lib/ping/target";
import type { ProbePayload } from "@/lib/ping/types";

type TracerouteRequestBody = {
  dns?: unknown;
  nodeId?: unknown;
  target?: unknown;
  url?: unknown;
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as TracerouteRequestBody | null;
  const rawTarget = typeof body?.url === "string" ? body.url : body?.target;
  const target = typeof rawTarget === "string" ? parseProbeTarget(rawTarget).hostname.trim() : "";
  const nodeId = Number(body?.nodeId);

  if (!target) {
    return Response.json({ code: 400, message: "请输入要追踪的域名或 IPv6 地址。" }, { status: 400 });
  }
  if (isIP(target) === 4) {
    return Response.json(
      { code: 400, message: "IPv6 路由追踪不支持 IPv4 地址，请使用 IPv4 路由追踪。" },
      { status: 400 },
    );
  }
  if (!Number.isInteger(nodeId) || nodeId <= 0) {
    return Response.json({ code: 400, message: "请选择 IPv6 路由追踪节点。" }, { status: 400 });
  }

  try {
    const payload: ProbePayload = {
      agreement: "",
      body: "",
      config: JSON.stringify({ node: nodeId }),
      dns: typeof body?.dns === "string" && body.dns.trim() ? body.dns.trim() : null,
      model: "",
      pathOrParams: "",
      port: null,
      type: "traceroute_v6",
      url: target,
    };
    const accessKey = await createWsAccessKey(payload);
    return Response.json({
      code: 200,
      data: { accessKey, target, taskId: accessKey },
      task_id: accessKey,
    });
  } catch (error) {
    const message = error instanceof Error && error.message
      ? error.message
      : "IPv6 路由追踪任务提交失败。";
    return Response.json({ code: 502, message }, { status: 502 });
  }
}
