import type { ProbeTargetParts } from "./types";

export function normalizeProbeTarget(value: string) {
  return value.replace(/\s+/g, "").replace(/：/g, ":");
}

export function buildProbeSharePath(basePath: string, target: string) {
  const normalizedBasePath = `/${basePath.split("/").filter(Boolean).join("/")}`;
  const normalizedTarget = target.trim();
  return normalizedTarget
    ? `${normalizedBasePath}/${encodeURIComponent(normalizedTarget)}`
    : normalizedBasePath;
}

export function probeTargetFromPathSegments(segments?: string[]) {
  if (!segments?.length) {
    return "";
  }

  // App Router parameters retain percent-encoded path segments in Next.js 16.
  // Decode exactly once so the form receives the real target while shared URLs
  // remain encoded through buildProbeSharePath.
  return segments.map((segment) => {
    try {
      return decodeURIComponent(segment);
    } catch {
      return segment;
    }
  }).join("/");
}

function hasProtocol(value: string) {
  return /^[a-z][a-z\d+.-]*:\/\//i.test(value);
}

function wrapIpv6Host(value: string) {
  const hasManyColons = (value.match(/:/g) ?? []).length > 1;
  const isBracketed = value.startsWith("[");

  return hasManyColons && !isBracketed ? `[${value}]` : value;
}

export function parseProbeTarget(input: string): ProbeTargetParts {
  const raw = input.trim().replace(/：/g, ":");

  if (!raw) {
    throw new Error("请输入要检测的域名或 IP。");
  }

  const parseable = hasProtocol(raw) ? raw : `http://${wrapIpv6Host(raw)}`;

  try {
    const url = new URL(parseable);
    const pathOrParams = `${url.pathname === "/" ? "" : url.pathname}${url.search}`;
    const port = url.port ? Number(url.port) : null;

    return {
      agreement: url.protocol || "http:",
      hostname: url.hostname.replace(/^\[/, "").replace(/\]$/, ""),
      pathOrParams,
      port: Number.isFinite(port) ? port : null,
      raw,
    };
  } catch {
    return {
      agreement: "http:",
      hostname: raw,
      pathOrParams: "",
      port: null,
      raw,
    };
  }
}

export function ensureProbeTargetPort(input: string, fallbackPort: number) {
  const raw = input.trim().replace(/：/g, ":");
  if (!raw) {
    return "";
  }

  const parsed = parseProbeTarget(raw);
  if (parsed.port !== null) {
    return raw;
  }

  const safePort = Number.isFinite(fallbackPort) && fallbackPort > 0 ? Math.trunc(fallbackPort) : 80;
  const hostname = parsed.hostname.includes(":") ? `[${parsed.hostname}]` : parsed.hostname;
  const path = parsed.pathOrParams || "";

  return `${parsed.agreement || "http:"}//${hostname}:${safePort}${path}`;
}
