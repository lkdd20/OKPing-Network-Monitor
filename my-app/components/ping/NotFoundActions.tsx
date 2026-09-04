"use client";

import Link from "next/link";

export function NotFoundActions() {
  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.assign("/");
  }

  return (
    <div className="mt-8 flex items-center justify-center gap-3">
      <button
        className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-300 bg-white px-5 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-gray-500 dark:hover:bg-gray-800"
        onClick={goBack}
        type="button"
      >
        返回上一页
      </button>
      <Link
        className="inline-flex h-11 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-700"
        href="/"
      >
        返回首页
      </Link>
    </div>
  );
}
