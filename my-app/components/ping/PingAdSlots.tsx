"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import type { PingAdLinks, PingSponsor } from "@/lib/ping/types";

type NormalizedAd = {
  href: string;
  imgUrl: string;
  name: string;
};

type AdSlotProps = {
  ads?: PingAdLinks;
};

const AD_BLOCK_TOAST_ID = "ping-ad-resource-warning";
const AD_BLOCK_MESSAGE = "检测到部分广告资源可能被拦截，如页面展示异常，请关闭广告拦截或安全拦截程序后刷新。";

function showAdBlockToast() {
  if (toast.isActive(AD_BLOCK_TOAST_ID)) {
    return;
  }

  toast.warning(AD_BLOCK_MESSAGE, {
    ariaLabel: "广告资源提醒",
    autoClose: false,
    closeOnClick: false,
    toastId: AD_BLOCK_TOAST_ID,
  });
}

function normalizeHref(value?: string | null) {
  const href = value?.trim() ?? "";
  if (!href || !/^(https?:|mailto:|tel:|\/)/i.test(href)) {
    return "";
  }

  return href;
}

function normalizeAd(item?: PingSponsor | null) {
  const name = item?.name?.trim() ?? "";
  const href = normalizeHref(item?.url);
  const imgUrl = item?.imgUrl?.trim() ?? "";

  if (!name || !href || !imgUrl) {
    return null;
  }

  return { href, imgUrl, name };
}

function normalizeAds(items?: PingSponsor[]) {
  return (items ?? [])
    .map(normalizeAd)
    .filter((item): item is NormalizedAd => item !== null);
}

function isExternal(href: string) {
  return /^(https?:|mailto:|tel:)/i.test(href);
}

function AdLink({ ad, children }: { ad: NormalizedAd; children: ReactNode }) {
  if (isExternal(ad.href)) {
    return (
      <a className="block" href={ad.href} rel="noreferrer" target="_blank">
        {children}
      </a>
    );
  }

  return (
    <Link className="block" href={ad.href}>
      {children}
    </Link>
  );
}

function useAdLoadState() {
  const [failed, setFailed] = useState(0);

  return {
    markFailed: () => setFailed((current) => current + 1),
    showNotice: failed > 0,
  };
}

function useAdBlockToast(showNotice: boolean) {
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (!showNotice || notifiedRef.current) {
      return;
    }

    notifiedRef.current = true;
    showAdBlockToast();
  }, [showNotice]);
}

function AdImage({
  ad,
  className,
  onError,
}: {
  ad: NormalizedAd;
  className: string;
  onError?: () => void;
}) {
  return (
    <AdLink ad={ad}>
      <div className={className}>
        <span className="absolute right-1 top-1 z-10 rounded bg-black/10 px-1.5 py-0.5 text-[10px] text-white backdrop-blur">
          广告
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element -- 广告图片由后台配置，域名在构建时不可预知。 */}
        <img
          alt={ad.name}
          className="block h-full w-full object-fill"
          loading="lazy"
          onError={onError}
          src={ad.imgUrl}
        />
      </div>
    </AdLink>
  );
}

export function PingTopAds({ ads }: AdSlotProps) {
  const topAds = normalizeAds(ads?.top).slice(0, 4);
  const adLoad = useAdLoadState();
  useAdBlockToast(adLoad.showNotice);

  if (!topAds.length) {
    return null;
  }

  return (
    <section
      aria-label="顶部广告"
      className="mx-auto w-full max-w-7xl px-4 pt-4"
      data-html2canvas-ignore
    >
      <div className="grid grid-cols-4 gap-3">
        {topAds.map((ad) => (
          <AdImage
            ad={ad}
            className="relative h-20 w-[278px] overflow-hidden rounded border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600"
            key={`${ad.name}-${ad.href}-${ad.imgUrl}`}
            onError={adLoad.markFailed}
          />
        ))}
      </div>
    </section>
  );
}

export function PingCenterAds({ ads }: AdSlotProps) {
  const centerAds = normalizeAds(ads?.center);
  const adLoad = useAdLoadState();
  useAdBlockToast(adLoad.showNotice);

  if (!centerAds.length) {
    return null;
  }

  return (
    <section
      aria-label="页面广告"
      className="mx-auto w-full max-w-7xl px-4 pb-3"
      data-html2canvas-ignore
    >
      <div className="grid grid-cols-2 gap-1">
        {centerAds.map((ad) => (
          <AdImage
            ad={ad}
            className="relative h-[50px] overflow-hidden rounded border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600"
            key={`${ad.name}-${ad.href}-${ad.imgUrl}`}
            onError={adLoad.markFailed}
          />
        ))}
      </div>
    </section>
  );
}
