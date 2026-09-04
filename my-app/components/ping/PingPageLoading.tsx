import { PingShell } from "@/components/ping/PingShell";

export function PingPageLoading({ activePath }: { activePath: string }) {
  return (
    <PingShell activePath={activePath}>
      <div className="flex min-h-[520px] w-full min-w-[1280px] items-center justify-center px-4 py-16">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-2 border-blue-200 dark:border-blue-950" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-r-blue-600 border-t-blue-600 dark:border-r-blue-400 dark:border-t-blue-400" />
          <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600 dark:bg-blue-400" />
        </div>
      </div>
    </PingShell>
  );
}
