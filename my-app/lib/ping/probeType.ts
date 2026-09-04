import type { ProbeType } from "./types";

export function isTcpingProbeType(type: ProbeType) {
  return type === "tcping" || type === "tcping_v6";
}

export function isHttpProbeType(type: ProbeType) {
  return type === "http" || type === "http_v6";
}

export function isIPv6ProbeType(type: ProbeType) {
  return type.endsWith("_v6");
}
