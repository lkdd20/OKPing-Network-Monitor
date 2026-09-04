import { DEFAULT_REGIONS, OPERATOR_OPTIONS } from "@/lib/ping/constants";
import { createWsAccessKey } from "@/lib/ping/server";
import { buildProbePayload } from "@/lib/ping/task";
import type { ProbeModel } from "@/lib/ping/types";

type HTTPRouteContext = {
  params: Promise<{
    target?: string[];
  }>;
};

type HTTPOptionsBody = {
  body?: unknown;
  headers?: unknown;
  method?: unknown;
};

type HTTPRequestBody = {
  dns?: unknown;
  http?: HTTPOptionsBody;
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

  return (await request.json().catch(() => null)) as HTTPRequestBody | null;
}

async function getFormUrl(request: Request) {
  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return "";
  }

  const url = formData.get("url") ?? formData.get("target");

  return typeof url === "string" ? url : "";
}

function getUrlFromBody(body: HTTPRequestBody | null) {
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

function getHTTPMethod(value: unknown) {
  if (typeof value !== "string") {
    return "GET";
  }

  const method = value.trim().toUpperCase();
  return ["GET", "POST", "HEAD", "PUT", "PATCH", "DELETE", "OPTIONS"].includes(method)
    ? method
    : "GET";
}

function getHTTPHeaders(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value).reduce<Record<string, string>>((headers, [key, item]) => {
    if (typeof item !== "string") {
      return headers;
    }
    const headerKey = key.trim();
    const headerValue = item.trim();
    if (headerKey && headerValue) {
      headers[headerKey] = headerValue;
    }
    return headers;
  }, {});
}

function getHTTPOptions(body: HTTPRequestBody | null) {
  const http = body?.http;

  return {
    body: typeof http?.body === "string" ? http.body : "",
    headers: getHTTPHeaders(http?.headers),
    method: getHTTPMethod(http?.method),
  };
}

export async function POST(request: Request, { params }: HTTPRouteContext) {
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
      body: JSON.stringify(getHTTPOptions(body)),
      dns: typeof body?.dns === "string" ? body.dns : null,
      model: getModel(body?.model),
      operators: getStringList(body?.operators, OPERATOR_OPTIONS),
      region: getStringList(body?.region, DEFAULT_REGIONS),
      target: url,
      type: "http",
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
