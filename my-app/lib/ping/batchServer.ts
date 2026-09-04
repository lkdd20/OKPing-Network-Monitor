import { createWsAccessKey } from "./server";
import type { BatchProbeType, ProbePayload } from "./types";

type BatchRequestBody = {
  defaultPort?: unknown;
  filterNetwork?: unknown;
  firstGateway?: unknown;
  nodeIds?: unknown;
  targets?: unknown;
};

function getNodeIds(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }
  return [...new Set(value.map(Number).filter((id) => Number.isInteger(id) && id > 0))];
}

function getPort(value: unknown) {
  const port = Number(value ?? 80);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("端口必须在 1 到 65535 之间。");
  }
  return port;
}

export async function handleBatchProbeRequest(request: Request, type: BatchProbeType) {
  const body = (await request.json().catch(() => null)) as BatchRequestBody | null;
  const targets = typeof body?.targets === "string" ? body.targets.trim() : "";
  const nodeIds = getNodeIds(body?.nodeIds);

  if (!targets) {
    return Response.json({ code: 400, message: "请至少输入一个检测目标。" }, { status: 400 });
  }
  if (!nodeIds.length || nodeIds.length > 5) {
    return Response.json({ code: 400, message: "请选择 1 到 5 个检测节点。" }, { status: 400 });
  }

  try {
    const port = type === "batch_tcping" ? getPort(body?.defaultPort) : null;
    const payload: ProbePayload = {
      agreement: "",
      body: targets,
      config: JSON.stringify({
        filterNetwork: body?.filterNetwork !== false ? "true" : "false",
        firstGateway: body?.firstGateway === "last" ? "last" : "first",
        node: nodeIds,
      }),
      dns: null,
      model: "",
      pathOrParams: "",
      port,
      type,
      url: "",
    };
    const accessKey = await createWsAccessKey(payload);

    return Response.json({
      code: 200,
      data: { accessKey, taskId: accessKey },
      task_id: accessKey,
    });
  } catch (error) {
    const message = error instanceof Error && error.message ? error.message : "批量检测任务创建失败。";
    return Response.json({ code: 502, message }, { status: 502 });
  }
}
