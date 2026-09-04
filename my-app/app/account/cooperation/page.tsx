import type { Metadata } from "next";

import { FeedbackClient } from "@/components/ping/account/FeedbackClient";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "合作沟通 - Ping",
};

export default function CooperationPage() {
  return <FeedbackClient mode="cooperation" />;
}
