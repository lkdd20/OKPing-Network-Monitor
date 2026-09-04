import { CalendarDays, ChevronLeft, FolderOpen, Tag } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

import { PingShell } from "@/components/ping/PingShell";
import { formatBlogDate, sanitizeBlogContent } from "@/lib/ping/blog";
import { fetchPublicBlogPost, fetchPublicLayoutConfig } from "@/lib/ping/server";

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>;
};

const getPost = cache((slug: string) => fetchPublicBlogPost(slug));

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getPost(slug);
    return {
      alternates: { canonical: `/blog/${encodeURIComponent(post.slug)}` },
      description: post.seoDescription || post.summary,
      keywords: (post.seoKeywords || post.tags?.join(",") || "").split(",").filter(Boolean),
      openGraph: {
        description: post.seoDescription || post.summary,
        images: post.coverUrl ? [{ url: post.coverUrl }] : undefined,
        title: post.seoTitle || post.title,
        type: "article",
      },
      title: `${post.seoTitle || post.title} - Ping`,
    };
  } catch {
    return {
      robots: { follow: false, index: false },
      title: "文章不存在 - Ping",
    };
  }
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const [postResult, layoutConfig] = await Promise.all([
    getPost(slug).catch(() => null),
    fetchPublicLayoutConfig("default").catch(() => undefined),
  ]);
  if (!postResult) notFound();

  const post = postResult;
  const content = sanitizeBlogContent(post.content);
  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    dateModified: post.updateTime || post.publishTime,
    datePublished: post.publishTime,
    description: post.seoDescription || post.summary,
    headline: post.seoTitle || post.title,
    image: post.coverUrl || undefined,
    keywords: post.seoKeywords || post.tags?.join(","),
    mainEntityOfPage: `/blog/${post.slug}`,
    publisher: { "@type": "Organization", name: "Ping" },
  }).replace(/</g, "\\u003c");

  return (
    <PingShell activePath="/blog" layoutConfig={layoutConfig}>
      <article className="mx-auto w-full max-w-5xl px-6 py-8">
        <nav aria-label="面包屑" className="flex items-center gap-2 text-xs text-zinc-500 dark:text-gray-400">
          <Link className="transition hover:text-blue-600 dark:hover:text-blue-400" href="/">首页</Link>
          <span>/</span>
          <Link className="transition hover:text-blue-600 dark:hover:text-blue-400" href="/blog">技术博客</Link>
          <span>/</span>
          <span className="max-w-xl truncate text-zinc-700 dark:text-gray-200">{post.title}</span>
        </nav>

        <header className="mt-7 border-b border-zinc-200 pb-7 dark:border-gray-800">
          <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <FolderOpen aria-hidden="true" size={15} />
              {post.category}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays aria-hidden="true" size={15} />
              {formatBlogDate(post.publishTime)}
            </span>
          </div>
          <h1 className="mt-4 text-3xl font-semibold leading-[1.35] text-zinc-950 dark:text-zinc-100">{post.title}</h1>
          <p className="mt-4 max-w-4xl text-base leading-8 text-zinc-500 dark:text-gray-400">{post.summary}</p>
          {post.tags?.length ? (
            <div className="mt-5 flex items-center gap-2">
              <Tag aria-hidden="true" className="text-zinc-400" size={15} />
              {post.tags.map((tag) => (
                <span className="rounded border border-zinc-200 px-2 py-1 text-xs text-zinc-500 dark:border-gray-700 dark:text-gray-400" key={tag}>{tag}</span>
              ))}
            </div>
          ) : null}
        </header>

        {post.coverUrl ? (
          <div className="mt-7 aspect-[16/7] overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-gray-700 dark:bg-gray-800">
            {/* eslint-disable-next-line @next/next/no-img-element -- Blog cover URLs are resolved from the administrator-configured OSS service. */}
            <img alt={post.title} className="h-full w-full object-cover" height={700} src={post.coverUrl} width={1600} />
          </div>
        ) : null}

        <div className="blog-content mt-9" dangerouslySetInnerHTML={{ __html: content }} />

        <footer className="mt-10 flex items-center justify-between border-t border-zinc-200 pt-6 dark:border-gray-800">
          <Link className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400" href="/blog">
            <ChevronLeft aria-hidden="true" size={16} />
            返回文章列表
          </Link>
          <span className="text-xs text-zinc-400 dark:text-gray-500">最后更新：{formatBlogDate(post.updateTime || post.publishTime)}</span>
        </footer>
      </article>
      <script dangerouslySetInnerHTML={{ __html: structuredData }} type="application/ld+json" />
    </PingShell>
  );
}
