import { getProbeDurationMs } from "@/lib/ping/result";
import type { DnsQueryType, PingNodeResult } from "@/lib/ping/types";

function toStringList(value?: string[] | null) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string" && item.trim()) : [];
}

export function getDnsAnswerRecords(node: PingNodeResult) {
  return toStringList(node.probeResult?.dns_response?.answers);
}

function DnsRecordSection({ records, title }: { records: string[]; title: string }) {
  return (
    <section>
      <h4 className="mb-1 text-xs font-semibold text-zinc-700 dark:text-gray-200">{title}</h4>
      <pre className="whitespace-pre-wrap break-all rounded border border-zinc-200 bg-white p-3 text-xs leading-5 text-zinc-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
        {records.length ? records.join("\n") : "无记录"}
      </pre>
    </section>
  );
}

export function DnsProbeDetails({
  dnsServer,
  node,
  queryType,
  target,
}: {
  dnsServer: string;
  node: PingNodeResult;
  queryType: DnsQueryType;
  target: string;
}) {
  const response = node.probeResult?.dns_response;
  const effectiveDns = node.probeResult?.effective_target?.trim() || dnsServer || "运营商DNS";
  const duration = node.probeResult ? `${getProbeDurationMs(node)} ms` : "--";

  return (
    <div className="space-y-4 text-xs text-zinc-700 dark:text-gray-200">
      <dl className="grid grid-cols-[90px_minmax(0,1fr)_90px_minmax(0,1fr)] gap-x-3 gap-y-2">
        <dt className="text-zinc-500 dark:text-gray-400">协议</dt>
        <dd>UDP</dd>
        <dt className="text-zinc-500 dark:text-gray-400">RCODE</dt>
        <dd>{response?.rcode || "--"}</dd>
        <dt className="text-zinc-500 dark:text-gray-400">目标</dt>
        <dd className="break-all">{node.probeResult?.target || target || "--"}</dd>
        <dt className="text-zinc-500 dark:text-gray-400">类型</dt>
        <dd>{queryType}</dd>
        <dt className="text-zinc-500 dark:text-gray-400">DNS</dt>
        <dd className="break-all">{effectiveDns}</dd>
        <dt className="text-zinc-500 dark:text-gray-400">耗时</dt>
        <dd>{duration}</dd>
      </dl>
      <DnsRecordSection records={toStringList(response?.answers)} title="Answer" />
      <DnsRecordSection records={toStringList(response?.authority)} title="Authority" />
      <DnsRecordSection records={toStringList(response?.additional)} title="Additional" />
    </div>
  );
}
