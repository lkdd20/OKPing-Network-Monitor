import { PingShell } from "@/components/ping/PingShell";

export default function Loading() {
  return (
    <PingShell activePath="/ping">
      <div className="flex min-h-[520px] w-full min-w-[1280px] items-center justify-center px-4 py-16">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="relative h-20 w-20">
            <div className="absolute inset-0 rounded-full border-2 border-blue-200 dark:border-blue-950" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-blue-600 border-r-blue-600 dark:border-t-blue-400 dark:border-r-blue-400" />
            <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600 shadow-[0_0_24px_rgba(37,99,235,0.55)] dark:bg-blue-400 dark:shadow-[0_0_24px_rgba(96,165,250,0.55)]" />
            <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full border border-blue-400/50 dark:border-blue-300/50" />
          </div>
          <div>
            <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">正在加载检测页面</p>
            <p className="mt-2 text-sm text-zinc-500 dark:text-gray-400">Ping 正在准备节点与页面配置</p>
          </div>
        </div>
      </div>
    </PingShell>
  );
}
