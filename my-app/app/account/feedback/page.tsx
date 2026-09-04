import type { Metadata } from "next";

import { FeedbackClient } from "@/components/ping/account/FeedbackClient";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "问题反馈 - Ping",
};

export default function FeedbackPage() {
  return <FeedbackClient />;
}
