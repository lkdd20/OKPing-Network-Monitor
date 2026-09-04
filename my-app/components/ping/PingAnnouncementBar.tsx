import Link from "next/link";

import type { PingAnnouncementItem, PingPublicLayoutConfig } from "@/lib/ping/types";

import { mergeLayoutConfig } from "./layoutDefaults";

const LEVEL_LABELS: Record<string, string> = {
  danger: "紧急",
  info: "公告",
  warning: "重要",
};

const LEVEL_CLASSES: Record<string, string> = {
  danger:
    "border-red-200 bg-red-50 text-red-800 dark:border-red-900/70 dark:bg-red-950/55 dark:text-red-200",
  info:
    "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/70 dark:bg-blue-950/55 dark:text-blue-200",
  warning:
    "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/55 dark:text-amber-100",
};

const LABEL_CLASSES: Record<string, string> = {
  danger: "bg-red-600 text-white dark:bg-red-500 dark:text-white",
  info: "bg-blue-600 text-white dark:bg-blue-500 dark:text-white",
  warning: "bg-amber-500 text-white dark:bg-amber-400 dark:text-amber-950",
};

function normalizeLevel(level?: string) {
  return level && LEVEL_CLASSES[level] ? level : "info";
}

function normalizeHref(url?: string) {
  const href = url?.trim();
  if (!href || !/^(https?:|mailto:|tel:|\/)/i.test(href)) {
    return "";
  }

  return href;
}

function isExternal(href: string) {
  return /^(https?:|mailto:|tel:)/i.test(href);
}

function normalizeAnnouncements(announcements?: PingAnnouncementItem[]) {
  return (announcements ?? [])
    .map((item) => ({
      content: item.content?.trim() ?? "",
      href: normalizeHref(item.url),
      level: normalizeLevel(item.level),
    }))
    .filter((item) => item.content && item.href);
}

export function PingAnnouncementBar({
  layoutConfig,
}: {
  layoutConfig?: PingPublicLayoutConfig;
}) {
  const config = mergeLayoutConfig(layoutConfig);
  const announcements = normalizeAnnouncements(config.announcements);

  if (!announcements.length) {
    return null;
  }

  return (
    <div className="border-b border-zinc-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-2">
        {announcements.map((announcement, index) => {
          const content = (
            <>
              <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-semibold ${LABEL_CLASSES[announcement.level]}`}>
                {LEVEL_LABELS[announcement.level]}
              </span>
              <span className="min-w-0 truncate text-sm font-medium">{announcement.content}</span>
              <span className="ml-auto shrink-0 text-xs opacity-70">查看详情</span>
            </>
          );
          const className = `flex h-8 items-center gap-3 rounded border px-3 transition hover:brightness-95 dark:hover:brightness-110 ${LEVEL_CLASSES[announcement.level]}`;

          if (isExternal(announcement.href)) {
            return (
              <a
                className={className}
                href={announcement.href}
                key={`${announcement.level}-${announcement.href}-${index}`}
                rel="noreferrer"
                target="_blank"
              >
                {content}
              </a>
            );
          }

          return (
            <Link className={className} href={announcement.href} key={`${announcement.level}-${announcement.href}-${index}`}>
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
