import Link from "next/link";

import type { PingLinkItem, PingPublicLayoutConfig } from "@/lib/ping/types";

import { mergeLayoutConfig } from "./layoutDefaults";

function getHref(link?: PingLinkItem) {
  const url = link?.url || "/";
  if (url.startsWith("http") || url.startsWith("/")) {
    return url;
  }

  return `https://${url}`;
}

function isExternal(url: string) {
  return url.startsWith("http");
}

export function PingFooter({ layoutConfig }: { layoutConfig?: PingPublicLayoutConfig }) {
  const config = mergeLayoutConfig(layoutConfig);
  const footerColumns = config.footerColumns ?? [];
  const friendshipLinks = config.friendshipLinks ?? [];
  const siteName = config.siteName || "";

  return (
    <footer className="mt-10 border-t border-zinc-200 bg-white text-zinc-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
      <div className="mx-auto flex max-w-7xl gap-10 px-6 py-10">
        <div className="w-[360px] shrink-0">
          <Link className="flex items-center gap-3" href="/">
            {/* eslint-disable-next-line @next/next/no-img-element -- Admin-configured logo URLs may be remote domains not known at build time. */}
            <img
              alt={siteName}
              className="h-11 w-11 rounded-lg border border-zinc-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-900"
              height={44}
              src={config.footerLogoUrl || "/logo.png"}
              width={44}
            />
            <span className="whitespace-nowrap text-2xl font-semibold text-zinc-950 dark:text-zinc-100">{siteName}</span>
          </Link>
          {config.footerSlogan ? (
            <p className="mt-5 text-sm leading-7 text-zinc-500 dark:text-gray-400">
              {config.footerSlogan}
            </p>
          ) : null}
          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-900">
              <div className="text-base font-semibold text-blue-600 dark:text-blue-400">200+</div>
              <div className="mt-1 text-xs text-zinc-500 dark:text-gray-500">监测节点</div>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-900">
              <div className="text-base font-semibold text-emerald-600 dark:text-emerald-400">7x24</div>
              <div className="mt-1 text-xs text-zinc-500 dark:text-gray-500">持续拨测</div>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-900">
              <div className="text-base font-semibold text-fuchsia-600 dark:text-fuchsia-400">IPv6</div>
              <div className="mt-1 text-xs text-zinc-500 dark:text-gray-500">双栈能力</div>
            </div>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-3 gap-10">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <p className="mb-4 text-sm font-semibold text-zinc-950 dark:text-zinc-100">
                {column.title}
              </p>
              <ul className="space-y-3 text-sm">
                {column.links?.map((link) => {
                  const href = getHref(link);
                  return (
                    <li key={`${link.title}-${href}`}>
                      <Link
                        className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                        href={href}
                        target={isExternal(href) ? "_blank" : undefined}
                      >
                        {link.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {friendshipLinks.length ? (
        <div className="border-y border-zinc-200 bg-zinc-50/80 dark:border-gray-800 dark:bg-gray-900/60">
          <div className="mx-auto flex max-w-7xl gap-5 px-6 py-5">
            <span className="shrink-0 text-sm font-semibold text-zinc-950 dark:text-zinc-100">友情链接</span>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {friendshipLinks.map((link) => {
                const href = getHref(link);
                return (
                  <Link
                    className="text-zinc-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                    href={href}
                    key={`${link.title}-${href}`}
                    target={isExternal(href) ? "_blank" : undefined}
                  >
                    {link.title}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5">
        <div className="flex flex-wrap items-center justify-start gap-x-3 gap-y-2">
          {config.copyright ? (
            <span className="text-sm text-zinc-500 dark:text-gray-500">
              {config.copyright}
            </span>
          ) : null}
          {config.icpText ? (
            <Link
              className="text-sm text-zinc-500 transition-colors hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400"
              href={config.icpUrl || "https://beian.miit.gov.cn/"}
              target="_blank"
            >
              {config.icpText}
            </Link>
          ) : null}
        </div>
        {config.serviceText || config.serviceLinkText ? (
          <span className="block shrink-0 text-sm text-zinc-600 dark:text-gray-400">
            {config.serviceText}
            {config.serviceLinkText ? (
              <Link
                className="ml-1 font-semibold text-zinc-900 transition-colors hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
                href={config.serviceLinkUrl || "/"}
                target={isExternal(config.serviceLinkUrl || "") ? "_blank" : undefined}
              >
                {config.serviceLinkText}
              </Link>
            ) : null}
            {config.serviceLinkText ? "提供计算服务" : null}
          </span>
        ) : null}
      </div>
    </footer>
  );
}
