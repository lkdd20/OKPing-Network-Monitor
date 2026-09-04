import { PingShell } from "@/components/ping/PingShell";

export default function Loading() {
  return (
    <PingShell activePath="/traceroute">
      <div className="flex min-h-[520px] w-full min-w-[1280px] items-center justify-center">
        <div className="h-14 w-14 animate-spin rounded-full border-2 border-zinc-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400" />
      </div>
    </PingShell>
  );
}
