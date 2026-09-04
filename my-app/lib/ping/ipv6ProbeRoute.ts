import { isIP } from "node:net";

import { DEFAULT_REGIONS, OPERATOR_OPTIONS } from "./constants";
import { createWsAccessKey } from "./server";
import { buildProbePayload } from "./task";
import { ensureProbeTargetPort, parseProbeTarget } from "./target";
import type { ProbeModel, ProbeType } from "./types";

type IPv6ProbeType = Extract<ProbeType, "ping_v6" | "tcping_v6" | "http_v6">;

type HTTPOptionsBody = {
  body?: unknown;
  headers?: unknown;
  method?: unknown;
};

type IPv6ProbeRequestBody = {
  dns?: unknown;
  http?: HTTPOptionsBody;
  model?: unknown;
  operators?: unknown;
  region?: unknown;
  target?: unknown;
  url?: unknown;
};

function getStringList(value: unknown, fallback: readonly string[]) {
  if (!Array.isArray(value)) return [...fallback];
  const list = value.filter((item): item is string => typeof item === "string");
  return list.length ? list : [...fallback];
}

function getModel(value: unknown): ProbeModel {
  return value === "persistent" || value === "slow" ? value : "";
}

function getHTTPMethod(value: unknown) {
  if (typeof value !== "string") return "GET";
  const method = value.trim().toUpperCase();
  return ["GET", "POST", "HEAD", "PUT", "PATCH", "DELETE", "OPTIONS"].includes(method)
    ? method
    : "GET";
}

function getHTTPHeaders(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.entries(value).reduce<Record<string, string>>((headers, [key, item]) => {
    if (typeof item !== "string") return headers;
    const headerKey = key.trim();
    const headerValue = item.trim();
    if (headerKey && headerValue) headers[headerKey] = headerValue;
    return headers;
  }, {});
}

function getHTTPOptions(body: IPv6ProbeRequestBody | null) {
  return {
    body: typeof body?.http?.body === "string" ? body.http.body : "",
    headers: getHTTPHeaders(body?.http?.headers),
    method: getHTTPMethod(body?.http?.method),
  };
}

async function requestTarget(request: Request, body: IPv6ProbeRequestBody | null) {
  const bodyTarget = typeof body?.url === "string" ? body.url : body?.target;
  if (typeof bodyTarget === "string") return bodyTarget.trim();
  const form = await request.formData().catch(() => null);
  const formTarget = form?.get("url") ?? form?.get("target");
  return typeof formTarget === "string" ? formTarget.trim() : "";
}

export async function handleIPv6ProbeRequest(request: Request, type: IPv6ProbeType) {
  const contentType = request.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json")
    ? await request.json().catch(() => null) as IPv6ProbeRequestBody | null
    : null;
  const target = await requestTarget(request, body);

  if (!target) {
    return Response.json({ code: 400, message: "请输入要检测的域名或 IPv6 地址。" }, { status: 400 });
  }

  const hostname = parseProbeTarget(target).hostname;
  if (isIP(hostname) === 4) {
    return Response.json(
      { code: 400, message: "IPv6 工具不支持 IPv4 地址，请使用对应的 IPv4 检测工具。" },
      { status: 400 },
    );
  }

  try {
    const payloadTarget = type === "tcping_v6" ? ensureProbeTargetPort(target, 80) : target;
    const payload = buildProbePayload({
      body: type === "http_v6" ? JSON.stringify(getHTTPOptions(body)) : "",
      dns: typeof body?.dns === "string" ? body.dns : null,
      model: getModel(body?.model),
      operators: getStringList(body?.operators, OPERATOR_OPTIONS),
      region: getStringList(body?.region, DEFAULT_REGIONS),
      target: payloadTarget,
      type,
    });
    const accessKey = await createWsAccessKey(payload);

    return Response.json({
      code: 200,
      data: { accessKey, target: payload.url, taskId: accessKey },
      task_id: accessKey,
    });
  } catch (error) {
    const message = error instanceof Error && error.message
      ? error.message
      : "IPv6 检测任务提交失败。";
    return Response.json({ code: 502, message }, { status: 502 });
  }
}
