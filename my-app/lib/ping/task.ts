import { DEFAULT_REGIONS, OPERATOR_OPTIONS } from "./constants";
import { parseProbeTarget } from "./target";
import type { ProbeModel, ProbePayload, ProbeType } from "./types";

type BuildProbePayloadOptions = {
  body?: string;
  dns?: string | null;
  model?: ProbeModel;
  operators?: string[];
  region?: string[];
  target: string;
  type: ProbeType;
};

export function buildProbePayload({
  body = "",
  dns = null,
  model = "",
  operators,
  region,
  target,
  type,
}: BuildProbePayloadOptions): ProbePayload {
  const targetParts = parseProbeTarget(target);
  const config = {
    operators: operators?.length ? operators : [...OPERATOR_OPTIONS],
    region: region?.length ? region : [...DEFAULT_REGIONS],
  };

  return {
    agreement: targetParts.agreement,
    body,
    config: JSON.stringify(config),
    dns: dns?.trim() ? dns.trim() : null,
    model,
    pathOrParams: targetParts.pathOrParams,
    port: targetParts.port,
    type,
    url: targetParts.hostname,
  };
}
