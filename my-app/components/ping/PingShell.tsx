import type { ReactNode } from "react";

import type { PingPublicLayoutConfig } from "@/lib/ping/types";

import { PingAnnouncementBar } from "./PingAnnouncementBar";
import { PingTopAds } from "./PingAdSlots";
import { PingFooter } from "./PingFooter";
import { PingHeader } from "./PingHeader";
import { PingToastContainer } from "./PingToastContainer";

export function PingShell({
  activePath,
  children,
  layoutConfig,
  mobileResponsive = false,
}: {
  activePath: string;
  children: ReactNode;
  layoutConfig?: PingPublicLayoutConfig;
  mobileResponsive?: boolean;
}) {
  return (
    <main
      className={`min-h-screen bg-background text-foreground ${
        mobileResponsive ? "min-w-0 overflow-x-hidden" : "min-w-[1280px]"
      }`}
    >
      <PingAnnouncementBar layoutConfig={layoutConfig} />
      <div className={mobileResponsive ? "max-lg:hidden" : undefined}>
        <PingTopAds ads={layoutConfig?.adLinks} />
      </div>
      <PingHeader activePath={activePath} layoutConfig={layoutConfig} />
      <div>{children}</div>
      <div className={mobileResponsive ? "max-lg:hidden" : undefined}>
        <PingFooter layoutConfig={layoutConfig} />
      </div>
      <PingToastContainer />
    </main>
  );
}
