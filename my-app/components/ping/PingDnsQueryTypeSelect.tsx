import type { DnsQueryType } from "@/lib/ping/types";

export const DNS_QUERY_TYPES: DnsQueryType[] = [
  "A",
  "AAAA",
  "CNAME",
  "MX",
  "NS",
  "TXT",
  "PTR",
  "SRV",
];

export function PingDnsQueryTypeSelect({
  disabled,
  onChange,
  value,
}: {
  disabled?: boolean;
  onChange: (value: DnsQueryType) => void;
  value: DnsQueryType;
}) {
  return (
    <label className="flex h-11 items-center gap-2 rounded-lg border border-zinc-300 bg-zinc-50 px-3 text-xs font-medium text-zinc-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300">
      <span>记录类型</span>
      <select
        aria-label="DNS 记录类型"
        className="h-8 min-w-20 rounded border border-zinc-300 bg-white px-2 text-sm font-medium text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:text-zinc-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-950"
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as DnsQueryType)}
        value={value}
      >
        {DNS_QUERY_TYPES.map((queryType) => (
          <option key={queryType} value={queryType}>
            {queryType}
          </option>
        ))}
      </select>
    </label>
  );
}
