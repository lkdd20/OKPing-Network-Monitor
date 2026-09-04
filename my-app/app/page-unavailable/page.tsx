import type { Metadata } from "next";

import { PingNotFoundView } from "@/components/ping/PingNotFoundView";

export const metadata: Metadata = {
  description: "请求的页面不存在或已暂停开放。",
  robots: {
    follow: false,
    index: false,
  },
  title: "页面暂不可用 - Ping",
};

export default function PageUnavailable() {
  return <PingNotFoundView />;
}
