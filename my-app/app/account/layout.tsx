import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AccountSidebar } from "@/components/ping/account/AccountSidebar";
import { PingShell } from "@/components/ping/PingShell";
import { getAuthenticatedAccountProfile } from "@/lib/auth/serverAccount";
import { fetchPublicLayoutConfig } from "@/lib/ping/server";

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const [profile, layoutConfig, requestHeaders] = await Promise.all([
    getAuthenticatedAccountProfile(),
    fetchPublicLayoutConfig("default").catch(() => undefined),
    headers(),
  ]);
  if (!profile) {
    const requestedPath = requestHeaders.get("x-ping-account-path");
    const nextPath = requestedPath?.startsWith("/account") && !requestedPath.startsWith("//")
      ? requestedPath
      : "/account/preferences";
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return (
    <PingShell activePath="/account" layoutConfig={layoutConfig} mobileResponsive>
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-5 sm:py-6">
        <div className="grid overflow-hidden border border-zinc-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900 lg:grid-cols-[210px_1fr]">
          <AccountSidebar profile={profile} />
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </PingShell>
  );
}
