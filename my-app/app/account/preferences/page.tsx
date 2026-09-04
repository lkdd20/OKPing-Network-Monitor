import type { Metadata } from "next";

import { PreferencesClient } from "@/components/ping/account/PreferencesClient";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "习惯设置 - Ping",
};

export default function PreferencesPage() {
  return <PreferencesClient />;
}
