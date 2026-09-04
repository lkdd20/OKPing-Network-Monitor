import { DEFAULT_REGIONS, OPERATOR_OPTIONS } from "@/lib/ping/constants";
import { createWsAccessKey } from "@/lib/ping/server";
import { buildProbePayload } from "@/lib/ping/task";
import type { DnsQueryType } from "@/lib/ping/types";

type DnsRouteContext = {
  params: Promise<{
    target?: string[];
  }>;
};

type DnsRequestBody = {
  dns?: unknown;
  dnsQueryType?: unknown;
  operators?: unknown;
  region?: unknown;
  target?: unknown;
  url?: unknown;
};

const DNS_QUERY_TYPES = new Set<DnsQueryType>([
  "A",
  "AAAA",
  "CNAME",
  "MX",
  "NS",
  "PTR",
  "SRV",
  "TXT",
]);

async function getRequestBody(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  return (await request.json().catch(() => null)) as DnsRequestBody | null;
}

function getStringList(value: unknown, fallback: readonly string[]) {
  if (!Array.isArray(value)) {
    return [...fallback];
  }

  const list = value.filter((item): item is string => typeof item === "string");
  return list.length ? list : [...fallback];
}

function getDnsQueryType(value: unknown): DnsQueryType | null {
  const queryType = typeof value === "string" ? value.trim().toUpperCase() : "A";
  return DNS_QUERY_TYPES.has(queryType as DnsQueryType) ? queryType as DnsQueryType : null;
}

export async function POST(request: Request, { params }: DnsRouteContext) {
  await params;
  const body = await getRequestBody(request);
  const url = typeof body?.url === "string"
    ? body.url.trim()
    : typeof body?.target === "string"
      ? body.target.trim()
      : "";
  const queryType = getDnsQueryType(body?.dnsQueryType);

  if (!url) {
    return Response.json({ code: 400, message: "url is required" }, { status: 400 });
  }
  if (!queryType) {
    return Response.json({ code: 400, message: "unsupported DNS query type" }, { status: 400 });
  }

  try {
    const payload = buildProbePayload({
      body: JSON.stringify({ queryType }),
      dns: typeof body?.dns === "string" ? body.dns : null,
      model: "",
      operators: getStringList(body?.operators, OPERATOR_OPTIONS),
      region: getStringList(body?.region, DEFAULT_REGIONS),
      target: url,
      type: "dns",
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
    const message = error instanceof Error && error.message
      ? error.message
      : "backend request failed";

    return Response.json({ code: 502, message }, { status: 502 });
  }
}
