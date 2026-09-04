"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { AlertTriangle, Check, ChevronDown, ChevronUp, X } from "lucide-react";

import type { PingIpInfo } from "@/lib/ping/types";

import { IpLocationMap } from "./IpLocationMap";

function display(value: unknown, fallback = "--") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function countryFlag(code?: string | null) {
  const normalized = code?.trim().toUpperCase();
  if (!normalized || !/^[A-Z]{2}$/.test(normalized)) return "";
  return String.fromCodePoint(...[...normalized].map((character) => 127397 + character.charCodeAt(0)));
}

function safeDomainUrl(domain?: string | null) {
  if (!domain || !/^[a-z\d][a-z\d._-]{0,252}\.[a-z]{2,}$/i.test(domain)) return null;
  return `https://${domain}`;
}

function DetailRow({ alternate, children, label }: { alternate?: boolean; children: ReactNode; label: string }) {
  return (
    <div className={`grid min-h-12 grid-cols-[130px_minmax(0,1fr)] border-b border-zinc-200 last:border-b-0 dark:border-gray-700 ${alternate ? "bg-zinc-50 dark:bg-gray-950/50" : "bg-white dark:bg-gray-900"}`}>
      <div className="flex items-center justify-end px-5 py-4 text-right text-[15px] text-zinc-700 dark:text-gray-300">{label}</div>
      <div className="min-w-0 break-words px-6 py-4 text-[15px] leading-6 text-zinc-900 dark:text-gray-100">{children}</div>
    </div>
  );
}

function TypeBadge({ children, tone = "blue" }: { children: ReactNode; tone?: "blue" | "green" | "red" | "zinc" }) {
  const colors = {
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    red: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    zinc: "bg-zinc-100 text-zinc-700 dark:bg-gray-800 dark:text-gray-300",
  };
  return <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${colors[tone]}`}>{children}</span>;
}

function riskMeta(score?: number | null) {
  if (typeof score !== "number") return { label: "暂无评分", color: "text-zinc-500 dark:text-gray-400", dot: "bg-zinc-400" };
  if (score < 15) return { label: "低风险", color: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" };
  if (score < 35) return { label: "较低风险", color: "text-green-600 dark:text-green-400", dot: "bg-green-500" };
  if (score < 55) return { label: "中等风险", color: "text-amber-600 dark:text-amber-400", dot: "bg-amber-400" };
  if (score < 75) return { label: "较高风险", color: "text-orange-600 dark:text-orange-400", dot: "bg-orange-500" };
  return { label: "高风险", color: "text-red-600 dark:text-red-400", dot: "bg-red-500" };
}

function networkTypeLabel(value?: string | null) {
  const type = value?.toLowerCase();
  if (!type) return "--";
  if (["isp", "residential", "consumer"].includes(type)) return "家庭带宽IP";
  if (type === "mobile") return "移动网络";
  if (["hosting", "idc", "datacenter"].includes(type)) return "IDC机房IP";
  if (["business", "corporate"].includes(type)) return "商业网络IP";
  if (type === "education") return "教育网络";
  if (type === "government") return "政企网络";
  return value || "--";
}

function DetectionItem({ active, label, value }: { active?: boolean; label: string; value?: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200">
      <span>{label}</span>
      {typeof active === "boolean" ? (
        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-white ${active ? "bg-orange-500" : "bg-emerald-500"}`}>
          {active ? <Check aria-hidden="true" size={16} /> : <X aria-hidden="true" size={16} />}
        </span>
      ) : <span className="text-zinc-500 dark:text-gray-400">{value || "无"}</span>}
    </span>
  );
}

export function IpInfoResult({ result }: { result: PingIpInfo }) {
  const [riskExpanded, setRiskExpanded] = useState(true);
  const risk = riskMeta(result.riskScore);
  const flag = countryFlag(result.countryCode);
  const location = [result.country, result.region, result.city, result.isp].filter(Boolean).join(" / ") || result.location || "未知";
  const asnDomainUrl = safeDomainUrl(result.asnDomain);
  const companyDomainUrl = safeDomainUrl(result.companyDomain);
  const networkLabel = networkTypeLabel(result.networkType);
  const securityFlags: Array<[string, boolean]> = [
    ["VPN", result.security.vpn],
    ["代理", result.security.proxy],
    ["Tor", result.security.tor],
    ["中继", result.security.relay],
    ["托管", result.security.datacenter],
    ["匿名网络", result.security.anonymous],
    ["攻击来源", result.security.attacker],
    ["威胁", result.security.threat],
    ["滥用", result.security.abuser],
  ];
  const riskFlags = securityFlags.filter(([, active]) => active).map(([label]) => label);
  const riskNarrative = [
    `IP ${result.ip}`,
    `归属于 ${result.asnOrganization || result.companyName || "未知机构"}`,
    result.networkType ? `网络类型识别为 ${networkLabel}` : "网络类型暂未识别",
    typeof result.riskScore === "number"
      ? `${result.riskSource || "第三方数据源"} 风险评分 ${result.riskScore}/100（${risk.label}）`
      : "暂未获得风险评分",
    riskFlags.length ? `检测标签：${riskFlags.join("、")}` : "未发现 VPN、代理、Tor 等匿名网络标记",
  ].join("，");

  return (
    <div className="space-y-5">
      {result.warnings.length ? (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
          <AlertTriangle aria-hidden="true" className="mt-0.5 shrink-0" size={15} />
          <span>{result.warnings.join("；")}，当前页面已保留其他可用数据。</span>
        </div>
      ) : null}

      <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex h-12 items-center justify-between border-b border-zinc-200 px-5 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">查询结果</h2>
          <div className="flex items-center gap-2">
            <TypeBadge tone="zinc">{result.ipVersion.toUpperCase()}</TypeBadge>
            {result.sources.map((source) => <TypeBadge key={source}>{source}</TypeBadge>)}
          </div>
        </div>
        <DetailRow alternate label="IP 地址"><span className="break-all text-lg font-semibold text-zinc-950 dark:text-white">{result.ip}</span></DetailRow>
        <DetailRow label="国家/地区"><span className="mr-2 text-lg" role="img" aria-label={result.countryCode || "国家"}>{flag}</span>{location}</DetailRow>
        <DetailRow alternate label="经纬度">{result.latitude !== null && result.latitude !== undefined && result.longitude !== null && result.longitude !== undefined ? `${result.latitude}, ${result.longitude}` : "--"}</DetailRow>
        <DetailRow label="ASN">{result.asn ? <a className="font-medium text-blue-600 hover:underline dark:text-blue-400" href={`https://bgp.he.net/${encodeURIComponent(result.asn)}`} rel="noreferrer" target="_blank">{result.asn}</a> : "--"}</DetailRow>
        <DetailRow alternate label="ASN 所有者"><div className="flex flex-wrap items-center gap-2"><span>{display(result.asnOrganization)}</span>{asnDomainUrl ? <a className="text-blue-600 hover:underline dark:text-blue-400" href={asnDomainUrl} rel="noreferrer" target="_blank">{result.asnDomain}</a> : null}</div></DetailRow>
        <DetailRow label="企业"><div className="flex flex-wrap items-center gap-2"><span>{display(result.companyName)}</span>{companyDomainUrl ? <a className="text-blue-600 hover:underline dark:text-blue-400" href={companyDomainUrl} rel="noreferrer" target="_blank">{result.companyDomain}</a> : null}</div></DetailRow>
        <DetailRow alternate label="IP类型"><div className="flex flex-wrap items-center gap-2"><TypeBadge tone={result.security.datacenter ? "red" : "green"}>{networkLabel}</TypeBadge>{typeof result.nativeIp === "boolean" ? <TypeBadge tone={result.nativeIp ? "green" : "red"}>{result.nativeIp ? "原生IP" : "广播IP"}</TypeBadge> : null}</div></DetailRow>
        <DetailRow label="欺诈值">
          <div className="space-y-4">
            <p className="text-xs text-zinc-500 dark:text-gray-400">ⓘ 评分依据来自 Scamalytics 欺诈库黑名单、攻击、诈骗、端口扫描、木马等滥用行为</p>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`inline-block h-4 w-4 rounded-full ${risk.dot}`} />
                  <span className={`text-3xl font-bold ${risk.color}`}>{typeof result.riskScore === "number" ? `${result.riskScore}/100` : "-"}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500 dark:text-gray-400">
                  <span>评分来源：{result.riskSource || "暂无数据"}</span>
                  <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${typeof result.riskScore !== "number" ? "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300" : result.riskScore >= 55 ? "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300" : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"}`}>{risk.label}</span>
                </div>
              </div>
              <button className="inline-flex items-center gap-1 rounded-full border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition hover:border-zinc-400 hover:text-zinc-900 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-400 dark:hover:text-white" onClick={() => setRiskExpanded((current) => !current)} type="button">
                {riskExpanded ? <ChevronUp aria-hidden="true" size={16} /> : <ChevronDown aria-hidden="true" size={16} />}
                {riskExpanded ? "收起说明" : "展开说明"}
              </button>
            </div>
            {riskExpanded ? <div className="rounded-lg bg-zinc-50 px-4 py-4 text-sm leading-7 text-zinc-700 dark:bg-gray-800 dark:text-gray-200"><p>{riskNarrative}</p></div> : null}
          </div>
        </DetailRow>
        <DetailRow alternate label="IP范围">{display(result.network)}</DetailRow>
        <DetailRow label="时区">{display(result.timezone)}</DetailRow>
        <DetailRow alternate label="邮政编码">{display(result.postalCode)}</DetailRow>
        <DetailRow label="隐私检测">
          <div className="flex flex-wrap gap-2">
            <DetectionItem active={result.security.vpn} label="VPN" />
            <DetectionItem active={result.security.proxy} label="代理" />
            <DetectionItem active={result.security.tor} label="Tor" />
            <DetectionItem active={result.security.relay} label="中继" />
            <DetectionItem active={result.security.datacenter} label="托管" />
            <DetectionItem label="服务类型" value={result.privacyServiceType || "无"} />
          </div>
        </DetailRow>
        <DetailRow alternate label="网络检测">
          <div className="flex flex-wrap gap-2">
            <DetectionItem active={Boolean(result.security.anycast)} label="AnyCast" />
            <DetectionItem active={result.security.mobile} label="移动网络" />
            <DetectionItem active={result.security.anonymous} label="匿名网络" />
            <DetectionItem active={result.security.satellite} label="卫星网络" />
            <DetectionItem active={result.security.datacenter} label="托管服务" />
          </div>
        </DetailRow>
        <DetailRow label="滥用信息"><div className="space-y-1 text-sm leading-7"><p>国家：{display(result.countryCode)}</p><p>网络范围：{display(result.network)}</p><p>名称：{display(result.abuse.name)}</p><p>地址：{display(result.abuse.address)}</p><p>邮箱：{result.abuse.email ? <a className="text-blue-600 hover:underline dark:text-blue-400" href={`mailto:${result.abuse.email}`}>{result.abuse.email}</a> : "--"}</p><p>电话：{display(result.abuse.phone)}</p></div></DetailRow>
      </section>

      {typeof result.latitude === "number" && typeof result.longitude === "number" ? <IpLocationMap ip={result.ip} latitude={result.latitude} location={location} longitude={result.longitude} /> : null}
    </div>
  );
}
