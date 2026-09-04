"use client";

import { Handshake, LogIn, MessageSquareText, Settings2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { AccountProfile } from "@/lib/auth/account";

const ITEMS = [
  { href: "/account/preferences", icon: Settings2, label: "习惯设置" },
  { href: "/account/security", icon: ShieldCheck, label: "账号管理" },
  { href: "/account/feedback", icon: MessageSquareText, label: "问题反馈" },
  { href: "/account/cooperation", icon: Handshake, label: "合作沟通" },
];

export function AccountSidebar({ profile }: { profile: AccountProfile }) {
  const pathname = usePathname();

  return (
    <aside className="border-b border-zinc-200 bg-white dark:border-gray-700 dark:bg-gray-900 lg:min-h-[680px] lg:border-r lg:border-b-0">
      <div className="border-b border-zinc-200 px-5 py-5 dark:border-gray-700">
        <p className="truncate text-sm font-semibold text-zinc-950 dark:text-zinc-100">
          {profile.nickname || profile.username}
        </p>
        <p className="mt-1 truncate text-xs text-zinc-500 dark:text-gray-400">{profile.username}</p>
      </div>
      <nav className="flex gap-1 overflow-x-auto p-3 lg:block lg:space-y-1" aria-label="个人中心">
        {ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              className={`flex min-w-max items-center gap-2 border-l-2 px-3 py-2.5 text-sm transition lg:w-full ${
                active
                  ? "border-blue-600 bg-blue-50 font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                  : "border-transparent text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              }`}
              href={href}
              key={href}
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="hidden border-t border-zinc-200 p-4 dark:border-gray-700 lg:block">
        <Link className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-blue-600 dark:text-gray-400" href="/">
          <LogIn aria-hidden="true" className="h-3.5 w-3.5 rotate-180" />
          返回检测工具
        </Link>
      </div>
    </aside>
  );
}
