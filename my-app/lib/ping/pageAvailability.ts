import { notFound } from "next/navigation";

import type { PingPublicPageConfig } from "./types";

export function requirePublicPageEnabled<T extends PingPublicPageConfig>(config: T) {
  if (config.enabled === false) {
    notFound();
  }

  return config;
}
