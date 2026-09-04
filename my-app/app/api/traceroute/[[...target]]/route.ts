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

function getTarget(body: TracerouteRequestBody | null) {
  const value = typeof body?.url === "string" ? body.url : body?.target;
  if (typeof value !== "string") {
    return "";
  }
  return parseProbeTarget(value).hostname.trim();
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as TracerouteRequestBody | null;
  const target = getTarget(body);
  const nodeId = Number(body?.nodeId);

  if (!target) {
    return Response.json({ code: 400, message: "请输入要追踪的域名或 IP。" }, { status: 400 });
  }
  if (isIP(target) === 6) {
    return Response.json(
      { code: 400, message: "当前路由追踪仅支持 IPv4，请在 IPv6 工具中使用 IPv6 路由追踪。" },
      { status: 400 },
    );
  }
  if (!Number.isInteger(nodeId) || nodeId <= 0) {
    return Response.json({ code: 400, message: "请选择路由追踪节点。" }, { status: 400 });
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
      type: "traceroute",
      url: target,
    };
    const accessKey = await createWsAccessKey(payload);

    return Response.json({
      code: 200,
      data: {
        accessKey,
        target,
        taskId: accessKey,
      },
      task_id: accessKey,
    });
  } catch (error) {
    const message = error instanceof Error && error.message ? error.message : "路由追踪任务提交失败。";
    return Response.json({ code: 502, message }, { status: 502 });
  }
}
