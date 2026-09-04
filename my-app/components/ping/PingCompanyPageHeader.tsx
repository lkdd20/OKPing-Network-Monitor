import Link from "next/link";

const COMPANY_TABS = [
  { href: "/about", label: "公司介绍" },
  { href: "/develop", label: "发展历程" },
  { href: "/contact", label: "联系我们" },
];

export function PingCompanyPageHeader({
  activePath,
  description,
  title,
}: {
  activePath: string;
  description: string;
  title: string;
}) {
  return (
    <>
      <div className="border-b border-zinc-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex h-28 max-w-7xl items-center justify-between px-6">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500 dark:text-gray-400">
              <Link className="transition hover:text-blue-600 dark:hover:text-blue-400" href="/">
                首页
              </Link>
              <span>/</span>
              <span className="text-zinc-700 dark:text-gray-200">{title}</span>
            </div>
            <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-100">{title}</h1>
          </div>
          <p className="max-w-xl text-right text-sm leading-6 text-zinc-500 dark:text-gray-400">{description}</p>
        </div>
      </div>

      <nav aria-label="公司信息" className="border-b border-zinc-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex h-12 max-w-7xl items-end gap-8 px-6">
          {COMPANY_TABS.map((tab) => {
            const active = tab.href === activePath;
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={`flex h-12 items-center border-b-2 px-1 text-sm font-medium transition ${
                  active
                    ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                    : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-gray-400 dark:hover:text-gray-100"
                }`}
                href={tab.href}
                key={tab.href}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
