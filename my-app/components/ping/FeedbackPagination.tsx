import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

function buildHref(page: number, keyword: string) {
  const params = new URLSearchParams();
  if (keyword) params.set("keyword", keyword);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/feedback?${query}` : "/feedback";
}

export function FeedbackPagination({
  currentPage,
  keyword,
  pageSize,
  total,
}: {
  currentPage: number;
  keyword: string;
  pageSize: number;
  total: number;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="问题列表分页" className="mt-6 flex items-center justify-between border-t border-zinc-200 pt-5 text-sm dark:border-gray-800">
      <span className="text-xs text-zinc-500 dark:text-gray-400">第 {currentPage} / {totalPages} 页</span>
      <div className="flex items-center gap-2">
        {currentPage > 1 ? (
          <Link className="inline-flex h-9 items-center gap-1.5 border border-zinc-300 px-3 text-zinc-600 transition hover:border-blue-400 hover:text-blue-600 dark:border-gray-700 dark:text-gray-300" href={buildHref(currentPage - 1, keyword)}>
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />上一页
          </Link>
        ) : <span className="inline-flex h-9 items-center gap-1.5 border border-zinc-200 px-3 text-zinc-300 dark:border-gray-800 dark:text-gray-600"><ChevronLeft aria-hidden="true" className="h-4 w-4" />上一页</span>}
        {currentPage < totalPages ? (
          <Link className="inline-flex h-9 items-center gap-1.5 border border-zinc-300 px-3 text-zinc-600 transition hover:border-blue-400 hover:text-blue-600 dark:border-gray-700 dark:text-gray-300" href={buildHref(currentPage + 1, keyword)}>
            下一页<ChevronRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        ) : <span className="inline-flex h-9 items-center gap-1.5 border border-zinc-200 px-3 text-zinc-300 dark:border-gray-800 dark:text-gray-600">下一页<ChevronRight aria-hidden="true" className="h-4 w-4" /></span>}
      </div>
    </nav>
  );
}
