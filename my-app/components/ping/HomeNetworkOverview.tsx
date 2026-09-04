"use client";

import { useEffect, useState } from "react";
import { CircleCheck, CircleX, LoaderCircle } from "lucide-react";

const IP_ENDPOINTS = [
  { key: "ipv4", label: "IPv4", url: "https://v4.okping.net" },
  { key: "ipv6", label: "IPv6", url: "https://v6.okping.net" },
  { key: "preference", label: "优先网络", url: "https://vv.okping.net" },
] as const;

const TEST_SITES = [
  { name: "百度", url: "https://www.baidu.com/favicon.ico" },
  { name: "腾讯", url: "https://www.tencent.com/favicon.ico" },
  { name: "谷歌", url: "https://www.google.com/favicon.ico" },
] as const;

const TEST_COUNT = 5;

type IpKey = (typeof IP_ENDPOINTS)[number]["key"];
type SiteResult = { latency: number; status: "ok" | "fail" };

function readIpResponse(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return "";

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (typeof parsed === "string") return parsed.trim();
    if (parsed && typeof parsed === "object") {
      const data = parsed as Record<string, unknown>;
      for (const key of ["client_ip", "ip", "address", "data"]) {
        if (typeof data[key] === "string") return data[key].trim();
      }
    }
  } catch {
    return trimmed.replace(/^"|"$/g, "");
  }

  return "";
}

async function fetchIp(url: string, signal: AbortSignal) {
  const response = await fetch(url, { cache: "no-store", signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return readIpResponse(await response.text());
}

function testSite(url: string): Promise<SiteResult> {
  return new Promise((resolve) => {
    const image = new window.Image();
    const startedAt = performance.now();
    let finished = false;
    const finish = (status: SiteResult["status"]) => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timer);
      resolve({ latency: performance.now() - startedAt, status });
    };
    const timer = window.setTimeout(() => finish("fail"), 5000);
    image.onload = () => finish("ok");
    image.onerror = () => finish("fail");
    image.src = `${url}${url.includes("?") ? "&" : "?"}ping=${Date.now()}`;
  });
}

function averageLatency(results: SiteResult[]) {
  const successful = results.filter((item) => item.status === "ok");
  if (!successful.length) return "-";
  return `${Math.round(successful.reduce((sum, item) => sum + item.latency, 0) / successful.length)} ms`;
}

export function HomeNetworkOverview() {
  const [ipInfo, setIpInfo] = useState<Record<IpKey, string | null>>({
    ipv4: null,
    ipv6: null,
    preference: null,
  });
  const [ipLoading, setIpLoading] = useState(true);
  const [siteResults, setSiteResults] = useState<Record<string, SiteResult[]>>({});

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    Promise.all(
      IP_ENDPOINTS.map(async (item) => {
        try {
          return [item.key, await fetchIp(item.url, controller.signal)] as const;
        } catch {
          return [item.key, ""] as const;
        }
      }),
    ).then((entries) => {
      if (cancelled) return;
      setIpInfo(Object.fromEntries(entries) as Record<IpKey, string>);
      setIpLoading(false);
    });

    const runSiteTests = async () => {
      await Promise.all(
        TEST_SITES.map(async (site) => {
          for (let index = 0; index < TEST_COUNT && !cancelled; index += 1) {
            const result = await testSite(site.url);
            if (cancelled) return;
            setSiteResults((current) => ({
              ...current,
              [site.name]: [...(current[site.name] ?? []), result],
            }));
            if (index < TEST_COUNT - 1) {
              await new Promise((resolve) => window.setTimeout(resolve, 1000));
            }
          }
        }),
      );
    };

    void runSiteTests();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  return (
    <section aria-labelledby="network-overview-title" className="mx-auto w-full max-w-7xl px-6 pt-6">
      <h2 className="sr-only" id="network-overview-title">当前网络状态</h2>
      <div className="grid grid-cols-2 gap-5">
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="border-b border-zinc-200 bg-zinc-50 px-5 py-3 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">当前网络</h3>
          </div>
          <table className="w-full table-fixed text-sm">
            <thead className="text-xs text-zinc-500 dark:text-gray-400">
              <tr>
                <th className="w-36 px-5 py-2.5 text-left font-medium">类型</th>
                <th className="px-5 py-2.5 text-left font-medium">IP 地址</th>
              </tr>
            </thead>
            <tbody>
              {IP_ENDPOINTS.map((item) => (
                <tr className="border-t border-zinc-100 dark:border-gray-800" key={item.key}>
                  <td className="px-5 py-3 font-medium text-zinc-700 dark:text-gray-200">{item.label}</td>
                  <td className="px-5 py-3 font-mono text-xs text-zinc-600 dark:text-gray-300">
                    {ipLoading ? (
                      <span className="inline-flex items-center gap-2 text-zinc-400 dark:text-gray-500">
                        <LoaderCircle aria-hidden="true" className="animate-spin" size={14} />
                        检测中
                      </span>
                    ) : ipInfo[item.key] || "未检测到"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="border-b border-zinc-200 bg-zinc-50 px-5 py-3 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">站点连通状态</h3>
          </div>
          <table className="w-full table-fixed text-sm">
            <thead className="text-xs text-zinc-500 dark:text-gray-400">
              <tr>
                <th className="w-28 px-5 py-2.5 text-left font-medium">站点</th>
                <th className="px-5 py-2.5 text-center font-medium">检测结果</th>
                <th className="w-28 px-5 py-2.5 text-right font-medium">平均延迟</th>
              </tr>
            </thead>
            <tbody>
              {TEST_SITES.map((site) => {
                const results = siteResults[site.name] ?? [];
                return (
                  <tr className="border-t border-zinc-100 dark:border-gray-800" key={site.name}>
                    <td className="px-5 py-3 font-medium text-zinc-700 dark:text-gray-200">{site.name}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {Array.from({ length: TEST_COUNT }, (_, index) => {
                          const result = results[index];
                          if (!result) {
                            return <span aria-label="等待检测" className="h-4 w-4 rounded-full border border-zinc-300 bg-zinc-100 dark:border-gray-600 dark:bg-gray-700" key={index} />;
                          }
                          return result.status === "ok" ? (
                            <CircleCheck aria-label="可用" className="text-emerald-500" key={index} size={17} />
                          ) : (
                            <CircleX aria-label="不可用" className="text-red-500" key={index} size={17} />
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {averageLatency(results)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
