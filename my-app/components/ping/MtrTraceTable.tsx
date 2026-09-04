import { CopyableIpCell } from "@/components/ping/CopyableIpCell";
import type { PingTracerouteHop, PingTracerouteProbe, PingTracerouteResult } from "@/lib/ping/types";

const DIVIDER = "border-r border-zinc-200 last:border-r-0 dark:border-gray-700";

type HopStats = {
  average: number | null;
  best: number | null;
  last: number | null;
  loss: number;
  received: number;
  sent: number;
  standardDeviation: number | null;
  worst: number | null;
};

function successfulDurations(probes: PingTracerouteProbe[]) {
  return probes
    .filter((probe) => !probe.timeout && typeof probe.durationMilliseconds === "number")
    .map((probe) => probe.durationMilliseconds as number)
    .filter(Number.isFinite);
}

export function calculateHopStats(hop: PingTracerouteHop): HopStats {
  const sent = hop.probes.length;
  const durations = successfulDurations(hop.probes);
  const received = durations.length;
  const average = received ? durations.reduce((total, value) => total + value, 0) / received : null;
  const variance = average == null
    ? null
    : durations.reduce((total, value) => total + (value - average) ** 2, 0) / received;

  return {
    average,
    best: received ? Math.min(...durations) : null,
    last: received ? durations[durations.length - 1] : null,
    loss: sent ? ((sent - received) / sent) * 100 : 100,
    received,
    sent,
    standardDeviation: variance == null ? null : Math.sqrt(variance),
    worst: received ? Math.max(...durations) : null,
  };
}

function formatMilliseconds(value: number | null) {
  return value == null ? "-" : value.toFixed(2);
}

function latencyClass(value: number | null) {
  if (value == null) return "text-zinc-400 dark:text-gray-500";
  if (value < 80) return "text-emerald-600 dark:text-emerald-400";
  if (value < 180) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function uniqueProbeValues(probes: PingTracerouteProbe[], field: "ip" | "ipLocation") {
  return [...new Set(probes.map((probe) => probe[field]?.trim()).filter(Boolean) as string[])];
}

function HopAddress({ probes }: { probes: PingTracerouteProbe[] }) {
  const ips = uniqueProbeValues(probes, "ip");
  if (!ips.length) {
    return <span className="font-mono text-zinc-400 dark:text-gray-500">* * *</span>;
  }

  return (
    <div className="space-y-1">
      {ips.map((ip) => <CopyableIpCell key={ip} value={ip} />)}
    </div>
  );
}

function HopLocation({ probes }: { probes: PingTracerouteProbe[] }) {
  const locations = uniqueProbeValues(probes, "ipLocation");
  return locations.length ? (
    <div className="space-y-1">
      {locations.map((location) => (
        <div className="truncate" key={location} title={location}>{location}</div>
      ))}
    </div>
  ) : <span className="text-zinc-400 dark:text-gray-500">-</span>;
}

export function MtrTraceTable({ isLoading, result }: { isLoading: boolean; result: PingTracerouteResult | null }) {
  return (
    <section className="overflow-visible rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="overflow-visible">
        <table className="w-full min-w-[1230px] table-fixed text-xs">
          <colgroup>
            <col className="w-14" />
            <col className="w-[210px]" />
            <col className="w-[300px]" />
            <col className="w-[70px]" />
            <col className="w-[55px]" />
            <col className="w-[85px]" />
            <col className="w-[85px]" />
            <col className="w-[85px]" />
            <col className="w-[85px]" />
            <col className="w-[85px]" />
          </colgroup>
          <thead className="sticky top-14 z-40 bg-zinc-50 text-zinc-500 shadow-sm dark:bg-gray-800 dark:text-gray-300">
            <tr>
              <th className={`px-2 py-3 text-center font-medium ${DIVIDER}`}>跳数</th>
              <th className={`px-3 py-3 text-left font-medium ${DIVIDER}`}>主机 / IP</th>
              <th className={`px-3 py-3 text-left font-medium ${DIVIDER}`}>IP 归属地</th>
              <th className={`px-2 py-3 text-center font-medium ${DIVIDER}`}>丢包率</th>
              <th className={`px-2 py-3 text-center font-medium ${DIVIDER}`}>已发送</th>
              <th className={`px-2 py-3 text-center font-medium ${DIVIDER}`}>最新</th>
              <th className={`px-2 py-3 text-center font-medium ${DIVIDER}`}>平均</th>
              <th className={`px-2 py-3 text-center font-medium ${DIVIDER}`}>最快</th>
              <th className={`px-2 py-3 text-center font-medium ${DIVIDER}`}>最慢</th>
              <th className="px-2 py-3 text-center font-medium">标准差</th>
            </tr>
          </thead>
          <tbody>
            {result?.hops.map((hop) => {
              const stats = calculateHopStats(hop);
              const reachedTarget = hop.probes.some((probe) => probe.ip === result.targetIp);
              return (
                <tr
                  className={`border-t border-zinc-100 align-middle dark:border-gray-700 ${reachedTarget ? "bg-emerald-50/60 dark:bg-emerald-950/20" : "hover:bg-zinc-50 dark:hover:bg-gray-800/60"}`}
                  key={hop.hop}
                >
                  <td className={`px-2 py-3 text-center font-mono text-zinc-500 dark:text-gray-400 ${DIVIDER}`}>{hop.hop}</td>
                  <td className={`px-3 py-3 text-zinc-700 dark:text-gray-200 ${DIVIDER}`}><HopAddress probes={hop.probes} /></td>
                  <td className={`px-3 py-3 text-zinc-600 dark:text-gray-300 ${DIVIDER}`}><HopLocation probes={hop.probes} /></td>
                  <td className={`px-2 py-3 text-center font-medium ${stats.loss > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"} ${DIVIDER}`}>
                    {stats.loss.toFixed(1)}%
                  </td>
                  <td className={`px-2 py-3 text-center text-zinc-600 dark:text-gray-300 ${DIVIDER}`}>{stats.sent}</td>
                  <td className={`px-2 py-3 text-center font-mono ${latencyClass(stats.last)} ${DIVIDER}`}>{formatMilliseconds(stats.last)}</td>
                  <td className={`px-2 py-3 text-center font-mono ${latencyClass(stats.average)} ${DIVIDER}`}>{formatMilliseconds(stats.average)}</td>
                  <td className={`px-2 py-3 text-center font-mono ${latencyClass(stats.best)} ${DIVIDER}`}>{formatMilliseconds(stats.best)}</td>
                  <td className={`px-2 py-3 text-center font-mono ${latencyClass(stats.worst)} ${DIVIDER}`}>{formatMilliseconds(stats.worst)}</td>
                  <td className={`px-2 py-3 text-center font-mono ${latencyClass(stats.standardDeviation)}`}>{formatMilliseconds(stats.standardDeviation)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!result ? (
        <div className="flex h-52 items-center justify-center text-sm text-zinc-400 dark:text-gray-500">
          {isLoading ? (
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400" />
          ) : "暂无路由追踪结果"}
        </div>
      ) : null}
    </section>
  );
}
