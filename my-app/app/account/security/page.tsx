import type { Metadata } from "next";

import { SecurityClient } from "@/components/ping/account/SecurityClient";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "账号管理 - Ping",
};

export default function SecurityPage() {
  return <SecurityClient />;
}
