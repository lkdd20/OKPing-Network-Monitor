import { BookOpen, CalendarDays, Star } from "lucide-react";
import Link from "next/link";

import { formatBlogDate } from "@/lib/ping/blog";
import type { PingBlogPost } from "@/lib/ping/types";

export function BlogPostCard({ post }: { post: PingBlogPost }) {
  return (
    <article className="group overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600">
      <Link className="block" href={`/blog/${encodeURIComponent(post.slug)}`}>
        <div className="flex aspect-[16/8] items-center justify-center overflow-hidden border-b border-zinc-100 bg-zinc-100 dark:border-gray-800 dark:bg-gray-800">
          {post.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- Blog cover URLs are resolved from the administrator-configured OSS service.
            <img
              alt={post.title}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              height={360}
              loading="lazy"
              src={post.coverUrl}
              width={720}
            />
          ) : (
            <div className="flex items-center gap-3 text-zinc-400 dark:text-gray-500">
              <BookOpen aria-hidden="true" size={28} strokeWidth={1.6} />
              <span className="text-sm font-medium">{post.category}</span>
            </div>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between gap-3 text-xs text-zinc-500 dark:text-gray-400">
            <span className="font-medium text-blue-600 dark:text-blue-400">{post.category}</span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays aria-hidden="true" size={14} />
              {formatBlogDate(post.publishTime)}
            </span>
          </div>
          <h2 className="mt-3 line-clamp-2 min-h-12 text-lg font-semibold leading-6 text-zinc-950 transition group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
            {post.title}
          </h2>
          <p className="mt-2 line-clamp-3 min-h-[66px] text-sm leading-[22px] text-zinc-500 dark:text-gray-400">
            {post.summary}
          </p>
          <div className="mt-4 flex min-h-6 items-center justify-between gap-3">
            <div className="flex min-w-0 gap-2 overflow-hidden">
              {(post.tags ?? []).slice(0, 3).map((tag) => (
                <span className="shrink-0 rounded border border-zinc-200 px-2 py-0.5 text-xs text-zinc-500 dark:border-gray-700 dark:text-gray-400" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
            {post.featured ? (
              <span className="inline-flex shrink-0 items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                <Star aria-hidden="true" fill="currentColor" size={13} />
                推荐
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}
