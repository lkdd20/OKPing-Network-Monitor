export const MAX_BATCH_TARGETS = 256;
export const MAX_BATCH_NODES = 5;

export type BatchMode = "ping" | "tcping";
export type GatewayPosition = "first" | "last";

export type ExpandedBatchTarget = {
  displayTarget: string;
  index: number;
  port: number | null;
  target: string;
};

type ParsedInput = {
  port: number | null;
  target: string;
};

const DOMAIN_PATTERN = /^(?=.{1,253}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/;
const IPV4_PATTERN = /^(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
const CIDR_PATTERN = /^(.+)\/(\d|[12]\d|3[0-2])$/;

function assertPort(port: number) {
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("端口必须在 1 到 65535 之间。");
  }
}

function parsePort(value: string) {
  const port = Number(value);
  assertPort(port);
  return port;
}

function parseInput(value: string, mode: BatchMode, defaultPort: number): ParsedInput {
  const input = value.trim();
  if (mode === "ping") {
    return { port: null, target: input };
  }

  const bracketMatch = input.match(/^\[(.+)]:(\d+)$/);
  if (bracketMatch) {
    return { port: parsePort(bracketMatch[2]), target: bracketMatch[1] };
  }

  const separator = input.lastIndexOf(":");
  if (separator >= 0) {
    if (input.indexOf(":") !== separator) {
      throw new Error(`暂不支持批量 IPv6 目标：${input}`);
    }
    return {
      port: parsePort(input.slice(separator + 1)),
      target: input.slice(0, separator),
    };
  }

  assertPort(defaultPort);
  return { port: defaultPort, target: input };
}

function ipv4ToNumber(ip: string) {
  if (!IPV4_PATTERN.test(ip)) {
    throw new Error(`无效的 IPv4 地址：${ip}`);
  }

  return ip.split(".").reduce((result, octet) => result * 256 + Number(octet), 0);
}

function numberToIpv4(value: number) {
  return [
    Math.floor(value / 16777216) % 256,
    Math.floor(value / 65536) % 256,
    Math.floor(value / 256) % 256,
    value % 256,
  ].join(".");
}

function assertLimit(size: number) {
  if (size > MAX_BATCH_TARGETS) {
    throw new Error(`展开后的目标数量不能超过 ${MAX_BATCH_TARGETS} 个。`);
  }
}

function expandRange(value: string) {
  const parts = value.split("-");
  if (parts.length !== 2) {
    throw new Error(`无效的 IP 范围：${value}`);
  }
  const start = ipv4ToNumber(parts[0]);
  const end = ipv4ToNumber(parts[1]);
  if (start > end) {
    throw new Error("IP 范围的起始地址不能大于结束地址。");
  }
  assertLimit(end - start + 1);

  return Array.from({ length: end - start + 1 }, (_, index) => numberToIpv4(start + index));
}

function expandCidr(value: string, filterNetwork: boolean, gatewayPosition: GatewayPosition) {
  const match = value.match(CIDR_PATTERN);
  if (!match) {
    throw new Error(`无效的 CIDR：${value}`);
  }
  const ip = ipv4ToNumber(match[1]);
  const prefix = Number(match[2]);
  const blockSize = 2 ** (32 - prefix);
  const network = Math.floor(ip / blockSize) * blockSize;
  let start = network;
  let end = network + blockSize - 1;

  if (filterNetwork) {
    start += 1;
    end -= 1;
    if (gatewayPosition === "first") {
      start += 1;
    } else {
      end -= 1;
    }
  }
  if (start > end) {
    return [];
  }
  assertLimit(end - start + 1);

  return Array.from({ length: end - start + 1 }, (_, index) => numberToIpv4(start + index));
}

function validateSingleTarget(target: string) {
  if (!IPV4_PATTERN.test(target) && !DOMAIN_PATTERN.test(target)) {
    throw new Error(`无效的域名或 IPv4 地址：${target}`);
  }
}

function displayTarget(target: string, port: number | null) {
  return port == null || port === 80 ? target : `${target}:${port}`;
}

export function expandBatchTargets(
  input: string,
  mode: BatchMode,
  options: {
    defaultPort?: number;
    filterNetwork: boolean;
    gatewayPosition: GatewayPosition;
  },
) {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) {
    throw new Error("请至少输入一个检测目标。");
  }

  const defaultPort = options.defaultPort ?? 80;
  const expanded: Array<Omit<ExpandedBatchTarget, "index">> = [];

  for (const line of lines) {
    const parsed = parseInput(line, mode, defaultPort);
    let targets: string[];
    if (/^.+-.+$/.test(parsed.target) && !DOMAIN_PATTERN.test(parsed.target)) {
      targets = expandRange(parsed.target);
    } else if (parsed.target.includes("/")) {
      targets = expandCidr(parsed.target, options.filterNetwork, options.gatewayPosition);
    } else {
      validateSingleTarget(parsed.target);
      targets = [parsed.target];
    }

    for (const target of targets) {
      expanded.push({
        displayTarget: displayTarget(target, parsed.port),
        port: parsed.port,
        target,
      });
      assertLimit(expanded.length);
    }
  }

  if (!expanded.length) {
    throw new Error("当前 CIDR 过滤规则没有产生可检测地址。");
  }

  return expanded.map((target, index) => ({ ...target, index }));
}
