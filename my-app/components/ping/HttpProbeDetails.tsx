import type { PingNodeResult } from "@/lib/ping/types";

export type HTTPHeaderSnapshot = {
  headers: Record<string, string[]>;
  protocol?: string;
  status?: string;
  status_code?: number;
  url?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeHeaders(value: unknown) {
  if (!isRecord(value)) {
    return {};
  }

  return Object.entries(value).reduce<Record<string, string[]>>((headers, [key, item]) => {
    if (typeof item === "string") {
      headers[key] = [item];
    } else if (Array.isArray(item)) {
      const values = item.filter((entry): entry is string => typeof entry === "string");
      if (values.length) {
        headers[key] = values;
      }
    }
    return headers;
  }, {});
}

export function getHTTPHeaderSnapshots(node: PingNodeResult): HTTPHeaderSnapshot[] {
  const responseHeaders = node.probeResult?.response_headers;
  if (!Array.isArray(responseHeaders)) {
    return [];
  }

  return responseHeaders.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }

    return [{
      headers: normalizeHeaders(item.headers),
      protocol: typeof item.protocol === "string" ? item.protocol : undefined,
      status: typeof item.status === "string" ? item.status : undefined,
      status_code:
        typeof item.status_code === "number" && Number.isFinite(item.status_code)
          ? item.status_code
          : undefined,
      url: typeof item.url === "string" ? item.url : undefined,
    }];
  });
}

export function getHTTPStatusCodeFromHeaders(node: PingNodeResult) {
  return getHTTPHeaderSnapshots(node)
    .map((item) => item.status_code)
    .filter((value): value is number => typeof value === "number")
    .at(-1);
}

function getStatusLine(snapshot: HTTPHeaderSnapshot) {
  const status = snapshot.status?.trim();
  if (status?.startsWith("HTTP/")) {
    return status;
  }
  if (snapshot.protocol && status) {
    return `${snapshot.protocol} ${status}`;
  }
  if (status) {
    return `HTTP ${status}`;
  }
  if (snapshot.protocol && snapshot.status_code) {
    return `${snapshot.protocol} ${snapshot.status_code}`;
  }
  return snapshot.status_code ? `HTTP ${snapshot.status_code}` : "HTTP 响应";
}

function formatSnapshot(snapshot: HTTPHeaderSnapshot) {
  const lines = [getStatusLine(snapshot)];

  Object.entries(snapshot.headers).forEach(([key, values]) => {
    values.forEach((value) => lines.push(`${key}: ${value}`));
  });

  return lines.join("\n");
}

export function HttpProbeDetails({ node }: { node: PingNodeResult }) {
  const snapshots = getHTTPHeaderSnapshots(node);
  const redirectCount = snapshots.filter((snapshot) => {
    const statusCode = snapshot.status_code ?? 0;
    return statusCode >= 300 && statusCode < 400;
  }).length;

  if (!snapshots.length) {
    return <p className="text-sm text-zinc-500 dark:text-gray-400">未获取到响应头信息</p>;
  }

  return (
    <div className="text-left">
      <div className="mb-3 flex items-center gap-4 text-xs text-zinc-500 dark:text-gray-400">
        <span>响应次数：{snapshots.length}</span>
        <span>重定向次数：{redirectCount}</span>
      </div>
      <div className="divide-y divide-zinc-200 border-y border-zinc-200 dark:divide-gray-700 dark:border-gray-700">
        {snapshots.map((snapshot, index) => (
          <section className="py-3 first:pt-0 last:pb-0" key={`${snapshot.url ?? "response"}-${index}`}>
            <div className="mb-2 flex min-w-0 items-center gap-3">
              <span className="shrink-0 text-xs font-medium text-zinc-700 dark:text-gray-200">
                第 {index + 1} 次响应
              </span>
              {snapshot.url ? (
                <code className="min-w-0 break-all text-xs text-blue-600 dark:text-blue-400">
                  {snapshot.url}
                </code>
              ) : null}
            </div>
            <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-all bg-zinc-950 p-3 text-xs leading-5 text-zinc-100 dark:bg-black">
              {formatSnapshot(snapshot)}
            </pre>
          </section>
        ))}
      </div>
    </div>
  );
}
