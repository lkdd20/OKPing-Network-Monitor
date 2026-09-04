import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

function getVisiblePages(current: number, total: number) {
  const pages = new Set([1, total, current - 2, current - 1, current, current + 1, current + 2]);
  return [...pages].filter((page) => page >= 1 && page <= total).sort((left, right) => left - right);
}

export function BlogPagination({
  category,
  currentPage,
  keyword,
  pageSize,
  total,
}: {
  category: string;
  currentPage: number;
  keyword: string;
  pageSize: number;
  total: number;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  function href(page: number) {
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (category) params.set("category", category);
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return query ? `/blog?${query}` : "/blog";
  }

  const pages = getVisiblePages(currentPage, totalPages);

  return (
    <nav aria-label="博客分页" className="mt-8 flex items-center justify-center gap-1.5">
      <Link
        aria-disabled={currentPage <= 1}
        className={`inline-flex h-9 w-9 items-center justify-center rounded border text-zinc-500 transition dark:text-gray-400 ${currentPage <= 1 ? "pointer-events-none border-zinc-100 opacity-40 dark:border-gray-800" : "border-zinc-200 hover:border-blue-400 hover:text-blue-600 dark:border-gray-700 dark:hover:border-blue-500 dark:hover:text-blue-400"}`}
        href={href(Math.max(1, currentPage - 1))}
      >
        <ChevronLeft aria-hidden="true" size={17} />
        <span className="sr-only">上一页</span>
      </Link>
      {pages.map((page, index) => {
        const previous = pages[index - 1];
        return (
          <span className="contents" key={page}>
            {previous && page - previous > 1 ? <span className="px-1 text-zinc-400">...</span> : null}
            <Link
              aria-current={page === currentPage ? "page" : undefined}
              className={`inline-flex h-9 min-w-9 items-center justify-center rounded border px-2 text-sm transition ${page === currentPage ? "border-blue-600 bg-blue-600 text-white" : "border-zinc-200 text-zinc-600 hover:border-blue-400 hover:text-blue-600 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:text-blue-400"}`}
              href={href(page)}
            >
              {page}
            </Link>
          </span>
        );
      })}
      <Link
        aria-disabled={currentPage >= totalPages}
        className={`inline-flex h-9 w-9 items-center justify-center rounded border text-zinc-500 transition dark:text-gray-400 ${currentPage >= totalPages ? "pointer-events-none border-zinc-100 opacity-40 dark:border-gray-800" : "border-zinc-200 hover:border-blue-400 hover:text-blue-600 dark:border-gray-700 dark:hover:border-blue-500 dark:hover:text-blue-400"}`}
        href={href(Math.min(totalPages, currentPage + 1))}
      >
        <ChevronRight aria-hidden="true" size={17} />
        <span className="sr-only">下一页</span>
      </Link>
    </nav>
  );
}
