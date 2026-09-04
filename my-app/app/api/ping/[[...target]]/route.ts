import { DEFAULT_REGIONS, OPERATOR_OPTIONS } from "@/lib/ping/constants";
import { createWsAccessKey } from "@/lib/ping/server";
import { buildProbePayload } from "@/lib/ping/task";
import type { ProbeModel } from "@/lib/ping/types";

type PingRouteContext = {
  params: Promise<{
    target?: string[];
  }>;
};

type PingRequestBody = {
  dns?: unknown;
  model?: unknown;
  operators?: unknown;
  region?: unknown;
  target?: unknown;
  url?: unknown;
};

async function getRequestBody(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  return (await request.json().catch(() => null)) as PingRequestBody | null;
}

async function getFormUrl(request: Request) {
  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return "";
  }

  const url = formData.get("url") ?? formData.get("target");

  return typeof url === "string" ? url : "";
}

function getUrlFromBody(body: PingRequestBody | null) {
  if (typeof body?.url === "string") {
    return body.url;
  }

  return typeof body?.target === "string" ? body.target : "";
}

function getStringList(value: unknown, fallback: readonly string[]) {
  if (!Array.isArray(value)) {
    return [...fallback];
  }

  const list = value.filter((item): item is string => typeof item === "string");

  return list.length ? list : [...fallback];
}

function getModel(value: unknown): ProbeModel {
  return value === "persistent" || value === "slow" ? value : "";
}

export async function POST(request: Request, { params }: PingRouteContext) {

  await params;
  const body = await getRequestBody(request);
  const bodyUrl = getUrlFromBody(body).trim();
  const formUrl = body ? "" : (await getFormUrl(request)).trim();
  const url = bodyUrl || formUrl;

  if (!url) {
    return Response.json(
      {
        code: 400,
        message: "url is required",
      },
      { status: 400 },
    );
  }

  try {
    const payload = buildProbePayload({
      dns: typeof body?.dns === "string" ? body.dns : null,
      model: getModel(body?.model),
      operators: getStringList(body?.operators, OPERATOR_OPTIONS),
      region: getStringList(body?.region, DEFAULT_REGIONS),
      target: url,
      type: "ping",
    });
    const accessKey = await createWsAccessKey(payload);

    return Response.json({
      code: 200,
      data: {
        accessKey,
        target: payload.url,
        taskId: accessKey,
      },
      task_id: accessKey,
    });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error && error.message
        ? error.message
        : "backend request failed";

    return Response.json(
      {
        code: 502,
        message,
      },
      { status: 502 },
    );
  }
}
