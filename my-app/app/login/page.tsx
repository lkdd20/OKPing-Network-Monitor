import type { Metadata } from "next";

import { PingShell } from "@/components/ping/PingShell";
import { fetchPublicLayoutConfig } from "@/lib/ping/server";

import { LoginClient } from "./LoginClient";

export const metadata: Metadata = {
  alternates: { canonical: "/login" },
  description: "使用okping.net微信小程序扫码登录平台账号。",
  title: "登录 - Ping",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const layoutConfig = await fetchPublicLayoutConfig("default").catch(() => undefined);
  const rawNext = (await searchParams).next;
  const requestedNext = Array.isArray(rawNext) ? rawNext[0] : rawNext;
  const nextPath = requestedNext?.startsWith("/") && !requestedNext.startsWith("//")
    ? requestedNext
    : "/";

  return (
    <PingShell activePath="/login" layoutConfig={layoutConfig} mobileResponsive>
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-12">
        <LoginClient nextPath={nextPath} />
      </div>
    </PingShell>
  );
}
