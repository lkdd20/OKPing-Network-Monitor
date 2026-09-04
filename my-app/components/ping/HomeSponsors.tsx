"use client";

import { useState } from "react";

import type { PingSponsor } from "@/lib/ping/types";

function normalizeSponsor(item: PingSponsor) {
  const name = item.name?.trim() ?? "";
  const url = item.url?.trim() ?? "";
  const imgUrl = item.imgUrl?.trim() ?? "";
  if (!name || !/^https?:\/\//i.test(url) || !/^(https?:\/\/|\/)/i.test(imgUrl)) {
    return null;
  }
  return { imgUrl, name, url };
}

function SponsorLogo({ imgUrl, name }: { imgUrl: string; name: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <span className="max-w-full truncate text-sm font-medium text-zinc-600 dark:text-gray-300">{name}</span>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- Sponsor image hosts are configured by administrators.
    <img
      alt={name}
      className="max-h-14 max-w-full object-contain transition group-hover:scale-[1.02]"
      height={56}
      loading="lazy"
      onError={() => setFailed(true)}
      src={imgUrl}
      width={180}
    />
  );
}

export function HomeSponsors({ sponsors }: { sponsors?: PingSponsor[] }) {
  const visibleSponsors = (sponsors ?? [])
    .map(normalizeSponsor)
    .filter((item): item is NonNullable<typeof item> => item !== null);

  if (!visibleSponsors.length) return null;

  return (
    <section aria-labelledby="home-sponsors-title" className="mx-auto mt-9 w-full max-w-7xl px-6">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-950 dark:text-zinc-100" id="home-sponsors-title">赞助商</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-gray-400">感谢合作伙伴对okping.net的支持</p>
        </div>
        <span className="text-xs text-zinc-400 dark:text-gray-500">{visibleSponsors.length} 家</span>
      </div>
      <div className="grid grid-cols-5 gap-4">
        {visibleSponsors.map((sponsor) => (
          <a
            className="group flex h-24 items-center justify-center rounded-lg border border-zinc-200 bg-white px-5 py-4 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600"
            href={sponsor.url}
            key={`${sponsor.name}-${sponsor.url}`}
            rel="noreferrer"
            target="_blank"
            title={sponsor.name}
          >
            <SponsorLogo imgUrl={sponsor.imgUrl} name={sponsor.name} />
          </a>
        ))}
      </div>
    </section>
  );
}
