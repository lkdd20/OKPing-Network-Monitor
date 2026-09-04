import type { Metadata } from "next";

import { requirePublicPageEnabled } from "./pageAvailability";
import { fetchPublicLayoutConfig, fetchPublicPageConfig } from "./server";
import { buildProbeSharePath, probeTargetFromPathSegments } from "./target";
import type { PingPublicPageConfig } from "./types";

export type PublicProbePageProps = {
  params: Promise<{ target?: string[] }>;
  searchParams: Promise<{
    error?: string | string[];
    url?: string | string[];
  }>;
};

export type PublicProbePageSpec = {
  description: (displayTarget: string) => string;
  h1: (displayTarget: string) => string;
  intro: (displayTarget: string) => string;
  keywords: (target: string) => string;
  pageKey: string;
  pageName: string;
  path: string;
  shareTargetInPath?: boolean;
  title: (displayTarget: string) => string;
};

export function stringParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export async function publicProbePageTarget({ params, searchParams }: PublicProbePageProps) {
  const routeParams = await params;
  const query = await searchParams;
  const pathTarget = probeTargetFromPathSegments(routeParams.target);
  return stringParam(query.url)?.trim() || pathTarget;
}

export function publicProbeCanonicalPath(spec: PublicProbePageSpec, target: string) {
  if (spec.shareTargetInPath) {
    return buildProbeSharePath(spec.path, target);
  }
  return target ? `${spec.path}?url=${encodeURIComponent(target)}` : spec.path;
}

export function fallbackPublicProbePageConfig(spec: PublicProbePageSpec, target: string) {
  const displayTarget = target || "目标地址";
  return {
    canonicalPath: publicProbeCanonicalPath(spec, target),
    description: spec.description(displayTarget),
    enabled: true,
    h1: spec.h1(displayTarget),
    intro: spec.intro(displayTarget),
    keywords: spec.keywords(target),
    pageKey: spec.pageKey,
    pageName: spec.pageName,
    target,
    title: spec.title(displayTarget),
  } satisfies PingPublicPageConfig;
}

export async function loadPublicProbePageConfig(spec: PublicProbePageSpec, target: string) {
  try {
    const config = requirePublicPageEnabled(await fetchPublicPageConfig(
      spec.pageKey,
      target,
      publicProbeCanonicalPath(spec, target),
    ));
    return config.title === "PING" || config.pageName === spec.pageKey
      ? fallbackPublicProbePageConfig(spec, target)
      : config;
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return fallbackPublicProbePageConfig(spec, target);
  }
}

export async function loadPublicProbeLayoutConfig() {
  try {
    return await fetchPublicLayoutConfig("default");
  } catch {
    return undefined;
  }
}

export async function publicProbeMetadata(spec: PublicProbePageSpec, target: string): Promise<Metadata> {
  const fallback = fallbackPublicProbePageConfig(spec, target);
  const config = await loadPublicProbePageConfig(spec, target);
  return {
    alternates: { canonical: config.canonicalPath || fallback.canonicalPath },
    description: config.description || fallback.description,
    keywords: (config.keywords || fallback.keywords)?.split(",").map((item) => item.trim()).filter(Boolean),
    title: config.title || fallback.title,
  };
}
