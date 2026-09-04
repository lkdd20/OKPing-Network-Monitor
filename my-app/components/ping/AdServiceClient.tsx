"use client";

import { Check, Copy, Eye, ImageIcon, MessageCircle, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type ExampleKey = "A" | "B" | "sponsor";

type AdExample = {
  alt: string;
  height: number;
  src: string;
  width: number;
};

type AdPosition = {
  available: string;
  code: string;
  exampleKey: Exclude<ExampleKey, "sponsor">;
  examples: AdExample[];
  page: string;
  position: string;
  price: string;
  size: string;
};

const CONTACT_QQ = "1607765571";
const CLIPBOARD_TIMEOUT_MS = 500;
const QQ_CONTACT_URL = `https://wpa.qq.com/msgrd?v=3&uin=${CONTACT_QQ}&site=qq&menu=yes`;

const AD_POSITIONS: AdPosition[] = [
  {
    available: "A1-A4",
    code: "A1-A4",
    exampleKey: "A",
    examples: [
      { alt: "首页顶部大图广告示例一", height: 80, src: "/ads/jhy01.gif", width: 278 },
      { alt: "首页顶部大图广告示例二", height: 80, src: "/ads/ddc158.gif", width: 278 },
    ],
    page: "首页和分类页",
    position: "首页顶部大图",
    price: "¥5000/月",
    size: "278 × 80",
  },
  {
    available: "B2-B4",
    code: "B1-B4",
    exampleKey: "B",
    examples: [
      { alt: "详情页顶部大图广告示例一", height: 50, src: "/ads/jhy02.gif", width: 690 },
      { alt: "详情页顶部大图广告示例二", height: 50, src: "/ads/cnmcdn.gif", width: 690 },
    ],
    page: "检测结果详情页",
    position: "详情页顶部大图",
    price: "¥3000/月",
    size: "690 × 50",
  },
];

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await Promise.race([
        navigator.clipboard.writeText(value),
        new Promise<never>((_, reject) => {
          window.setTimeout(() => reject(new Error("clipboard timeout")), CLIPBOARD_TIMEOUT_MS);
        }),
      ]);
      return true;
    } catch {
      // Fall back for local HTTP and browsers that expose but block Clipboard API.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.left = "0";
  textarea.style.opacity = "0";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.focus({ preventScroll: true });
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  try {
    return document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
}

function AdExampleDialog({ activeExample, onClose }: { activeExample: ExampleKey | null; onClose: () => void }) {
  useEffect(() => {
    if (!activeExample) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeExample, onClose]);

  if (!activeExample) return null;

  const position = AD_POSITIONS.find((item) => item.exampleKey === activeExample);
  const title = activeExample === "sponsor" ? "节点赞助展示示例" : `${position?.code ?? ""} 广告素材示例`;

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 p-6"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
      role="presentation"
    >
      <section
        aria-label={title}
        aria-modal="true"
        className="w-full max-w-4xl overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
        role="dialog"
      >
        <header className="flex h-14 items-center justify-between border-b border-zinc-200 px-5 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <ImageIcon aria-hidden="true" className="text-blue-600 dark:text-blue-400" size={18} />
            <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-100">{title}</h2>
          </div>
          <button
            aria-label="关闭示例"
            className="inline-flex h-8 w-8 items-center justify-center rounded text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
            onClick={onClose}
            title="关闭"
            type="button"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </header>

        <div className="max-h-[70vh] overflow-y-auto p-6">
          {activeExample === "sponsor" ? (
            <div>
              <p className="mb-4 text-sm leading-6 text-zinc-600 dark:text-gray-300">
                节点赞助文字会显示在 Ping、TCPing、网站测速等检测结果的赞助商列中。
              </p>
              <div className="overflow-hidden border border-zinc-200 dark:border-gray-700">
                <table className="w-full table-fixed text-xs">
                  <thead className="bg-zinc-50 text-zinc-600 dark:bg-gray-800 dark:text-gray-300">
                    <tr>
                      <th className="border-r border-zinc-200 px-4 py-3 text-left dark:border-gray-700">检测节点</th>
                      <th className="border-r border-zinc-200 px-4 py-3 text-center dark:border-gray-700">响应时间</th>
                      <th className="px-4 py-3 text-center">赞助商</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-zinc-200 text-zinc-700 dark:border-gray-700 dark:text-gray-200">
                      <td className="border-r border-zinc-200 px-4 py-4 dark:border-gray-700">广东深圳联通</td>
                      <td className="border-r border-zinc-200 px-4 py-4 text-center dark:border-gray-700">28.6 ms</td>
                      <td className="px-4 py-4 text-center font-medium text-blue-600 dark:text-blue-400">品牌赞助文字</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {position?.examples.map((example) => (
                <figure className="border border-zinc-200 bg-zinc-50 p-5 dark:border-gray-700 dark:bg-gray-950" key={example.src}>
                  <div className="flex min-h-24 items-center justify-center overflow-hidden bg-white p-4 dark:bg-gray-900">
                    <Image
                      alt={example.alt}
                      className="h-auto max-w-full"
                      height={example.height}
                      src={example.src}
                      unoptimized
                      width={example.width}
                    />
                  </div>
                  <figcaption className="mt-3 text-center text-xs text-zinc-500 dark:text-gray-400">
                    展示尺寸：{example.width} × {example.height} px
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
}

export function AdServiceClient() {
  const [activeExample, setActiveExample] = useState<ExampleKey | null>(null);
  const [copyStatus, setCopyStatus] = useState<"copied" | "idle" | "manual">("idle");
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) window.clearTimeout(resetTimerRef.current);
    };
  }, []);

  async function copyContactQq() {
    setCopyStatus("manual");
    try {
      const copied = await copyText(CONTACT_QQ);
      setCopyStatus(copied ? "copied" : "manual");
      if (resetTimerRef.current !== null) window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = window.setTimeout(() => setCopyStatus("idle"), 2500);
    } catch {
      setCopyStatus("manual");
    }
  }

  return (
    <>
      <section>
        <div className="mb-5 border-l-4 border-blue-600 pl-4 dark:border-blue-400">
          <p className="text-xs font-semibold uppercase text-blue-600 dark:text-blue-400">Ad Positions</p>
          <h2 className="mt-1 text-xl font-semibold text-zinc-950 dark:text-zinc-100">广告位说明</h2>
        </div>

        <div className="overflow-hidden border border-zinc-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          <table className="w-full table-fixed text-sm">
            <thead className="bg-zinc-50 text-zinc-600 dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <th className="w-[17%] border-r border-zinc-200 px-4 py-3 text-left font-medium dark:border-gray-700">广告位页面</th>
                <th className="w-[17%] border-r border-zinc-200 px-4 py-3 text-left font-medium dark:border-gray-700">广告位置</th>
                <th className="w-[11%] border-r border-zinc-200 px-4 py-3 text-center font-medium dark:border-gray-700">广告编号</th>
                <th className="w-[12%] border-r border-zinc-200 px-4 py-3 text-center font-medium dark:border-gray-700">广告规格</th>
                <th className="w-[13%] border-r border-zinc-200 px-4 py-3 text-center font-medium dark:border-gray-700">价格</th>
                <th className="w-[15%] border-r border-zinc-200 px-4 py-3 text-center font-medium dark:border-gray-700">可投放编号</th>
                <th className="w-[15%] px-4 py-3 text-center font-medium">素材示例</th>
              </tr>
            </thead>
            <tbody>
              {AD_POSITIONS.map((ad) => (
                <tr
                  className="border-t border-zinc-200 text-zinc-700 transition hover:bg-zinc-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                  key={ad.code}
                >
                  <td className="border-r border-zinc-200 px-4 py-4 font-medium text-zinc-900 dark:border-gray-700 dark:text-gray-100">{ad.page}</td>
                  <td className="border-r border-zinc-200 px-4 py-4 dark:border-gray-700">{ad.position}</td>
                  <td className="border-r border-zinc-200 px-4 py-4 text-center font-mono text-xs dark:border-gray-700">{ad.code}</td>
                  <td className="border-r border-zinc-200 px-4 py-4 text-center font-mono text-xs dark:border-gray-700">{ad.size}</td>
                  <td className="border-r border-zinc-200 px-4 py-4 text-center font-semibold text-emerald-600 dark:border-gray-700 dark:text-emerald-400">
                    {ad.price}
                  </td>
                  <td className="border-r border-zinc-200 px-4 py-4 text-center font-medium text-blue-600 dark:border-gray-700 dark:text-blue-400">
                    {ad.available}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      className="inline-flex h-8 items-center gap-1.5 rounded bg-blue-600 px-3 text-xs font-medium text-white transition hover:bg-blue-700"
                      onClick={() => setActiveExample(ad.exampleKey)}
                      type="button"
                    >
                      <Eye aria-hidden="true" size={14} /> 查看
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-5 border-l-4 border-emerald-600 pl-4 dark:border-emerald-400">
          <p className="text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-400">Node Sponsorship</p>
          <h2 className="mt-1 text-xl font-semibold text-zinc-950 dark:text-zinc-100">拨测节点赞助</h2>
        </div>

        <div className="grid grid-cols-[1fr_380px] border border-zinc-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          <dl className="divide-y divide-zinc-200 border-r border-zinc-200 dark:divide-gray-700 dark:border-gray-700">
            <div className="grid min-h-20 grid-cols-[150px_1fr]">
              <dt className="flex items-center bg-zinc-50 px-5 text-sm font-medium text-zinc-600 dark:bg-gray-800 dark:text-gray-300">节点赞助说明</dt>
              <dd className="flex items-center px-5 py-4 text-sm leading-6 text-zinc-700 dark:text-gray-200">
                为保障平台长期稳定运行，拨测检测节点开放赞助商文字广告位。
              </dd>
            </div>
            <div className="grid min-h-20 grid-cols-[150px_1fr]">
              <dt className="flex items-center bg-zinc-50 px-5 text-sm font-medium text-zinc-600 dark:bg-gray-800 dark:text-gray-300">广告位规格</dt>
              <dd className="flex items-center px-5 py-4 text-sm leading-6 text-zinc-700 dark:text-gray-200">15 个汉字以内，两个半角字符按一个汉字计算。</dd>
            </div>
            <div className="grid min-h-20 grid-cols-[150px_1fr]">
              <dt className="flex items-center bg-zinc-50 px-5 text-sm font-medium text-zinc-600 dark:bg-gray-800 dark:text-gray-300">展示位置</dt>
              <dd className="flex items-center px-5 py-4 text-sm leading-6 text-zinc-700 dark:text-gray-200">
                Ping、TCPing、网站测速和 DNS 查询等检测结果列表的赞助商列。
              </dd>
            </div>
          </dl>

          <div className="flex flex-col justify-center px-7 py-6">
            <div className="grid grid-cols-2 divide-x divide-zinc-200 border-b border-zinc-200 pb-5 text-center dark:divide-gray-700 dark:border-gray-700">
              <div>
                <strong className="block text-3xl font-semibold text-zinc-950 dark:text-zinc-100">300</strong>
                <span className="mt-1 block text-xs text-zinc-500 dark:text-gray-400">元 / 条 / 月</span>
              </div>
              <div>
                <strong className="block text-3xl font-semibold text-zinc-950 dark:text-zinc-100">600</strong>
                <span className="mt-1 block text-xs text-zinc-500 dark:text-gray-400">元 / 条 / 季度</span>
              </div>
            </div>
            <div className="mt-5 flex justify-center gap-2">
              <button
                className="inline-flex h-9 items-center gap-2 rounded border border-zinc-300 bg-white px-3 text-xs font-medium text-zinc-700 transition hover:border-blue-400 hover:text-blue-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-blue-500 dark:hover:text-blue-400"
                onClick={() => setActiveExample("sponsor")}
                type="button"
              >
                <Eye aria-hidden="true" size={14} /> 展示示例
              </button>
              <a
                className="inline-flex h-9 items-center gap-2 rounded bg-blue-600 px-3 text-xs font-medium text-white transition hover:bg-blue-700"
                href={QQ_CONTACT_URL}
                rel="noreferrer"
                target="_blank"
              >
                <MessageCircle aria-hidden="true" size={14} /> 联系 QQ
              </a>
              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded border border-zinc-300 bg-white text-zinc-600 transition hover:border-blue-400 hover:text-blue-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:text-blue-400"
                onClick={() => void copyContactQq()}
                title={copyStatus === "copied" ? "QQ 已复制" : `复制 QQ：${CONTACT_QQ}`}
                type="button"
              >
                {copyStatus === "copied" ? <Check aria-hidden="true" size={15} /> : <Copy aria-hidden="true" size={15} />}
                <span className="sr-only">{copyStatus === "copied" ? "QQ 已复制" : "复制联系 QQ"}</span>
              </button>
            </div>
            <p className="mt-3 text-center font-mono text-xs text-zinc-500 dark:text-gray-400">
              QQ：<span className="select-all">{CONTACT_QQ}</span>
              {copyStatus === "manual" ? <span className="ml-2 text-amber-600 dark:text-amber-400">请手动选择复制</span> : null}
            </p>
          </div>
        </div>
      </section>

      <AdExampleDialog activeExample={activeExample} onClose={() => setActiveExample(null)} />
    </>
  );
}
