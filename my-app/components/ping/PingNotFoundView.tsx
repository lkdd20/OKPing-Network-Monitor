import { fetchPublicLayoutConfig } from "@/lib/ping/server";

import { NotFoundActions } from "./NotFoundActions";
import { PingShell } from "./PingShell";

async function getLayoutConfig() {
  try {
    return await fetchPublicLayoutConfig("default");
  } catch {
    return undefined;
  }
}

export async function PingNotFoundView() {
  const layoutConfig = await getLayoutConfig();

  return (
    <PingShell activePath="" layoutConfig={layoutConfig}>
      <section className="mx-auto flex min-h-[520px] max-w-7xl items-center justify-center px-6 py-20">
        <div className="max-w-xl text-center">
          <div className="text-8xl font-bold text-zinc-200 dark:text-gray-800">404</div>
          <h1 className="mt-5 text-2xl font-semibold text-zinc-950 dark:text-gray-100">
            页面不存在或已暂停开放
          </h1>
          <p className="mt-4 text-sm leading-7 text-zinc-500 dark:text-gray-400">
            请检查访问地址，或返回上一页继续使用其他网络检测工具。
          </p>
          <NotFoundActions />
        </div>
      </section>
    </PingShell>
  );
}
