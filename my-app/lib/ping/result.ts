import type {
  IpStat,
  NodeDataPoint,
  PingNode,
  PingNodeMessage,
  PingNodeResult,
} from "./types";

export function toResultNodes(nodes: PingNode[]): PingNodeResult[] {
  return nodes.map((node) => ({
    ...node,
    dataValue: Array.isArray(node.dataValue) ? node.dataValue : [],
  }));
}

function getMessageNodeId(message: PingNodeMessage) {
  const id = message.nodeId;

  if (typeof id === "number") {
    return id;
  }
  if (typeof id === "string" && id.trim()) {
    const parsed = Number(id);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function normalizeDurationSeconds(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

type ProbeResultCarrier = Pick<PingNodeMessage, "ip" | "probeResult" | "resolvedIps">;

export function isProbeSuccess(value: ProbeResultCarrier) {
  return value.probeResult?.success === true;
}

export function getProbeDurationMs(value: ProbeResultCarrier) {
  const durationSeconds = normalizeDurationSeconds(value.probeResult?.duration_seconds);

  return Number((durationSeconds * 1000).toFixed(2));
}

export function getProbeIp(value: ProbeResultCarrier) {
  return (
    value.ip ||
    value.probeResult?.resolve_ip ||
    value.resolvedIps?.[0] ||
    ""
  );
}

export function getProbeAddress(value: ProbeResultCarrier) {
  const effectiveTarget = value.probeResult?.effective_target?.trim();

  if (value.probeResult?.probe === "tcp" && effectiveTarget) {
    return effectiveTarget;
  }

  return getProbeIp(value);
}

export function getProbeAddresses(value: ProbeResultCarrier) {
  const dnsIps = value.probeResult?.dns_response?.ips;
  const addresses = value.probeResult?.probe === "dns"
    ? [...(Array.isArray(dnsIps) ? dnsIps : []), ...(value.resolvedIps ?? [])]
    : [getProbeAddress(value)];

  return [...new Set(addresses.map((address) => address?.trim()).filter(Boolean) as string[])];
}

function toDataPoint(message: PingNodeMessage): NodeDataPoint {
  const success = isProbeSuccess(message);

  return {
    timeout: !success,
    value: success ? getProbeDurationMs(message) : 200,
  };
}

export function mergeNodeMessage(
  nodes: PingNodeResult[],
  message: PingNodeMessage,
) {
  const nodeId = getMessageNodeId(message);

  if (nodeId == null) {
    return nodes;
  }

  return nodes.map((node) => {
    if (Number(node.key) !== nodeId && Number(node.id) !== nodeId) {
      return node;
    }
    if (node.sequence != null && message.sequence <= node.sequence) {
      return node;
    }
    return {
      ...node,
      dataValue: [...(node.dataValue ?? []), toDataPoint(message)],
      dnsDurationSeconds: message.dnsDurationSeconds,
      error: message.error,
      finalResult: message.finalResult,
      id: nodeId,
      ip: message.ip ?? node.ip,
      ipLocation: message.ipLocation ?? node.ipLocation,
      key: node.key,
      measuredAt: message.measuredAt,
      probeResult: message.probeResult,
      resolvedIps: message.resolvedIps,
      sequence: message.sequence,
      totalRuns: message.totalRuns,
    };
  });
}

export function getRespondedCount(nodes: PingNodeResult[]) {
  return nodes.filter((node) => node.dataValue.length > 0).length;
}

export function getTimeoutCount(nodes: PingNodeResult[]) {
  return nodes.filter((node) => node.dataValue.length > 0 && !isProbeSuccess(node)).length;
}

export function getIpStats(nodes: PingNodeResult[]): IpStat[] {
  const ips = nodes
    .filter((node) => node.dataValue.length > 0)
    .flatMap(getProbeAddresses);

  const total = ips.length;
  if (!total) {
    return [];
  }

  const countMap = ips.reduce<Record<string, number>>((map, ip) => {
    map[ip] = (map[ip] ?? 0) + 1;
    return map;
  }, {});

  return Object.entries(countMap)
    .map(([value, count]) => ({
      percentage: `${((count / total) * 100).toFixed(2)}%`,
      value,
    }))
    .sort((left, right) => Number.parseFloat(right.percentage) - Number.parseFloat(left.percentage));
}
