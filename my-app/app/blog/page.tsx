import { Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { BlogPagination } from "@/components/ping/BlogPagination";
import { BlogPostCard } from "@/components/ping/BlogPostCard";
import { PingShell } from "@/components/ping/PingShell";
import { fetchPublicBlogPosts, fetchPublicLayoutConfig } from "@/lib/ping/server";
import type { PingBlogPage } from "@/lib/ping/types";

export const metadata: Metadata = {
  alternates: { canonical: "/blog" },
  description: "Ping 技术博客，分享网络检测、Ping、TCPing、HTTP、DNS、路由追踪及 IPv6 实践。",
  title: "技术博客 - Ping",
};

type BlogPageProps = {
  searchParams: Promise<{
    category?: string | string[];
    keyword?: string | string[];
    page?: string | string[];
  }>;
};

const EMPTY_PAGE: PingBlogPage = {
  categories: [],
  pageNum: 1,
  pageSize: 9,
  rows: [],
  total: 0,
};

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function safePage(value?: string) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1;
}

function categoryHref(category: string, keyword: string) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (keyword) params.set("keyword", keyword);
  const query = params.toString();
  return query ? `/blog?${query}` : "/blog";
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const query = await searchParams;
  const keyword = firstParam(query.keyword)?.trim().slice(0, 80) || "";
  const category = firstParam(query.category)?.trim().slice(0, 64) || "";
  const page = safePage(firstParam(query.page));
  const [layoutConfig, blogData] = await Promise.all([
    fetchPublicLayoutConfig("default").catch(() => undefined),
    fetchPublicBlogPosts({ category, keyword, pageNum: page, pageSize: 9 }).catch(() => ({ ...EMPTY_PAGE, pageNum: page })),
  ]);

  return (
    <PingShell activePath="/blog" layoutConfig={layoutConfig}>
      <div className="border-b border-zinc-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex h-28 max-w-7xl items-center justify-between px-6">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-100">技术博客</h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-gray-400">网络检测、故障分析与工程实践</p>
          </div>
          <div className="text-sm text-zinc-400 dark:text-gray-500">{blogData.total} 篇文章</div>
        </div>
      </div>

      <section className="mx-auto w-full max-w-7xl px-6 py-7">
        <form action="/blog" className="flex items-center gap-3" method="get">
          {category ? <input name="category" type="hidden" value={category} /> : null}
          <div className="relative w-[520px]">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={17} />
            <input
              className="h-10 w-full rounded-lg border border-zinc-300 bg-white pl-10 pr-4 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-500 dark:focus:ring-blue-950"
              defaultValue={keyword}
              maxLength={80}
              name="keyword"
              placeholder="搜索文章标题、摘要或标签"
              type="search"
            />
          </div>
          <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-700" type="submit">
            <Search aria-hidden="true" size={16} />
            搜索
          </button>
          {keyword || category ? (
            <Link className="text-sm text-zinc-500 transition hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400" href="/blog">
              清除筛选
            </Link>
          ) : null}
        </form>

        <nav aria-label="文章分类" className="mt-6 flex items-center gap-1 border-b border-zinc-200 dark:border-gray-800">
          {["", ...blogData.categories].map((item) => {
            const active = item === category;
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={`border-b-2 px-4 py-3 text-sm font-medium transition ${active ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400" : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-gray-400 dark:hover:text-gray-100"}`}
                href={categoryHref(item, keyword)}
                key={item || "all"}
              >
                {item || "全部文章"}
              </Link>
            );
          })}
        </nav>

        {blogData.rows.length ? (
          <div className="mt-6 grid grid-cols-3 gap-5">
            {blogData.rows.map((post) => <BlogPostCard key={post.id} post={post} />)}
          </div>
        ) : (
          <div className="flex min-h-72 items-center justify-center border-b border-zinc-200 text-sm text-zinc-500 dark:border-gray-800 dark:text-gray-400">
            {keyword || category ? "没有找到符合条件的文章" : "暂无已发布文章"}
          </div>
        )}

        <BlogPagination
          category={category}
          currentPage={blogData.pageNum}
          keyword={keyword}
          pageSize={blogData.pageSize}
          total={blogData.total}
        />
      </section>
    </PingShell>
  );
}
