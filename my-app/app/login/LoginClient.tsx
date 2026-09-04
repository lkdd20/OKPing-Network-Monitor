"use client";

import { CheckCircle2, ClipboardCheck, Copy, LoaderCircle, QrCode, RefreshCw, ShieldCheck, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { resetCachedAccountPreferences } from "@/lib/auth/preferencesClient";

type LoginState = "creating" | "waiting" | "confirmed" | "expired" | "error";

type ApiEnvelope<T> = {
  code: number | string;
  msg?: string;
  data?: T;
};

type QrCreateResult = {
  sessionId: string;
  expiresIn: number;
  launchUrl?: string;
};

type QrStatusResult = {
  status: "WAITING" | "SCANNED" | "CONFIRMED" | "EXPIRED";
  authenticated?: boolean;
};

function getMessage(error: unknown) {
  return error instanceof Error && error.message ? error.message : "登录服务暂时不可用";
}

async function readEnvelope<T>(response: Response) {
  const body = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!response.ok || !body || String(body.code) !== "200" || !body.data) {
    throw new Error(body?.msg || `请求失败（${response.status}）`);
  }
  return body.data;
}

export function LoginClient({ nextPath = "/" }: { nextPath?: string }) {
  const router = useRouter();
  const started = useRef(false);
  const creatingSession = useRef(false);
  const expiresAt = useRef(0);
  const [loginState, setLoginState] = useState<LoginState>("creating");
  const [sessionId, setSessionId] = useState("");
  const [launchUrl, setLaunchUrl] = useState("");
  const [remaining, setRemaining] = useState(300);
  const [scanned, setScanned] = useState(false);
  const [sessionCopied, setSessionCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const createSession = useCallback(async () => {
    if (creatingSession.current) return;
    creatingSession.current = true;
    setLoginState("creating");
    setErrorMessage("");
    setSessionId("");
    setLaunchUrl("");
    setScanned(false);
    setSessionCopied(false);
    try {
      const result = await readEnvelope<QrCreateResult>(
        await fetch("/api/auth/wechat-miniapp/qr", { method: "POST" }),
      );
      expiresAt.current = Date.now() + (result.expiresIn || 300) * 1000;
      setSessionId(result.sessionId);
      setLaunchUrl(result.launchUrl || "");
      setRemaining(result.expiresIn || 300);
      setLoginState("waiting");
    } catch (error) {
      setErrorMessage(getMessage(error));
      setLoginState("error");
    } finally {
      creatingSession.current = false;
    }
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void createSession();
  }, [createSession]);

  useEffect(() => {
    if (loginState !== "waiting" || !sessionId) return;
    const syncRemaining = () => {
      const seconds = Math.max(0, Math.ceil((expiresAt.current - Date.now()) / 1000));
      setRemaining(seconds);
    };
    syncRemaining();
    const timer = window.setInterval(syncRemaining, 1000);
    return () => window.clearInterval(timer);
  }, [loginState, sessionId]);

  useEffect(() => {
    if (loginState !== "waiting" || !sessionId) return;
    let stopped = false;
    let timeoutId: number | undefined;

    async function poll() {
      try {
        const status = await readEnvelope<QrStatusResult>(
          await fetch(`/api/auth/wechat-miniapp/qr/${encodeURIComponent(sessionId)}`, {
            cache: "no-store",
          }),
        );
        if (stopped) return;
        if (status.status === "CONFIRMED" && status.authenticated) {
          setLoginState("confirmed");
          window.setTimeout(() => {
            resetCachedAccountPreferences();
            window.dispatchEvent(new Event("ping-auth-changed"));
            router.replace(nextPath);
            router.refresh();
          }, 900);
          return;
        }
        if (status.status === "SCANNED") {
          setScanned((current) => {
            if (!current) {
              expiresAt.current = Date.now() + 300 * 1000;
              setRemaining(300);
            }
            return true;
          });
        }
        if (status.status === "EXPIRED") {
          void createSession();
          return;
        }
      } catch (error) {
        if (!stopped) {
          setErrorMessage(getMessage(error));
          setLoginState("error");
        }
        return;
      }
      timeoutId = window.setTimeout(poll, 1800);
    }

    timeoutId = window.setTimeout(poll, 1000);
    return () => {
      stopped = true;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [createSession, loginState, nextPath, router, sessionId]);

  const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
  const seconds = String(remaining % 60).padStart(2, "0");

  async function copySessionId() {
    if (!sessionId) return;
    try {
      await navigator.clipboard.writeText(sessionId);
      setSessionCopied(true);
    } catch {
      setErrorMessage("浏览器无法复制登录码，请使用微信长按识别上方小程序码");
    }
  }

  return (
    <div className="grid grid-cols-1 overflow-hidden border border-zinc-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900 lg:grid-cols-[360px_1fr]">
      <section className="flex min-h-[420px] flex-col items-center justify-center border-b border-zinc-200 px-6 py-8 dark:border-gray-700 sm:px-8 lg:min-h-[480px] lg:border-r lg:border-b-0 lg:py-10">
        <div className="flex h-[260px] w-[260px] items-center justify-center border border-zinc-200 bg-white p-3 dark:border-gray-600 sm:h-[286px] sm:w-[286px]">
          {loginState === "waiting" && sessionId ? (
            // eslint-disable-next-line @next/next/no-img-element -- QR image is generated dynamically by the authenticated backend proxy.
            <img
              alt="Ping 微信小程序登录码"
              className="h-full w-full object-contain"
              height={260}
              src={`/api/auth/wechat-miniapp/qr/${encodeURIComponent(sessionId)}/image`}
              width={260}
            />
          ) : null}

          {loginState === "creating" ? (
            <LoaderCircle aria-hidden="true" className="h-10 w-10 animate-spin text-emerald-600" />
          ) : null}

          {loginState === "confirmed" ? (
            <div className="text-center">
              <CheckCircle2 aria-hidden="true" className="mx-auto h-14 w-14 text-emerald-600" />
              <p className="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-100">登录成功</p>
            </div>
          ) : null}

          {loginState === "expired" || loginState === "error" ? (
            <button
              className="flex flex-col items-center gap-3 text-sm text-zinc-600 transition hover:text-emerald-700 dark:text-gray-300 dark:hover:text-emerald-400"
              onClick={() => void createSession()}
              type="button"
            >
              <RefreshCw aria-hidden="true" className="h-9 w-9" />
              {loginState === "expired" ? "小程序码已过期，点击刷新" : "重新获取小程序码"}
            </button>
          ) : null}
        </div>

        <div className="mt-6 text-center">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100">微信扫码登录</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-gray-400">
            {loginState === "waiting"
              ? scanned
                ? "已扫码，请在小程序确认登录"
                : `有效时间 ${minutes}:${seconds}`
              : errorMessage || "正在准备登录"}
          </p>
          {loginState === "waiting" && launchUrl ? (
            <a
              className="mt-5 inline-flex h-11 items-center justify-center gap-2 bg-[#057A55] px-5 text-sm font-medium text-white transition hover:bg-emerald-800 lg:hidden"
              href={launchUrl}
              rel="noreferrer"
            >
              <Smartphone aria-hidden="true" className="h-4 w-4" />
              打开微信小程序登录
            </a>
          ) : null}
          {loginState === "waiting" && !launchUrl && sessionId ? (
            <div className="mt-5 grid w-full gap-2 lg:hidden">
              <button
                className="inline-flex h-11 items-center justify-center gap-2 border border-[#057A55] px-4 text-sm font-medium text-[#057A55] transition hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                onClick={() => void copySessionId()}
                type="button"
              >
                {sessionCopied ? <ClipboardCheck aria-hidden="true" className="h-4 w-4" /> : <Copy aria-hidden="true" className="h-4 w-4" />}
                {sessionCopied ? "登录码已复制" : "复制网页登录码"}
              </button>
              {sessionCopied ? (
                <a
                  className="inline-flex h-11 items-center justify-center gap-2 bg-[#057A55] px-4 text-sm font-medium text-white transition hover:bg-emerald-800"
                  href="weixin://"
                >
                  <Smartphone aria-hidden="true" className="h-4 w-4" />
                  打开微信
                </a>
              ) : null}
              <p className="text-xs leading-5 text-zinc-500 dark:text-gray-400">
                在微信打开okping.net小程序后，点击“读取已复制的登录码”。
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="flex min-h-[420px] flex-col justify-center px-6 py-8 sm:px-10 lg:min-h-[480px] lg:px-12 lg:py-10">
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400"> ACCOUNT</p>
        <h1 className="mt-3 text-2xl font-semibold text-zinc-950 dark:text-zinc-100">登录 平台</h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-600 dark:text-gray-300">
          电脑端使用微信扫描小程序码；手机端点击打开小程序并确认登录。首次使用时会先绑定微信手机号并创建平台账号。
        </p>

        <div className="mt-8 grid gap-5">
          <div className="flex items-start gap-4 border-t border-zinc-200 pt-5 dark:border-gray-700">
            <Smartphone aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">微信打开并确认</p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-gray-400">小程序不会自动授权登录，必须由你手动确认。</p>
            </div>
          </div>
          <div className="flex items-start gap-4 border-t border-zinc-200 pt-5 dark:border-gray-700">
            <ShieldCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">一次性登录会话</p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-gray-400">小程序码 5 分钟失效，登录成功后立即作废。</p>
            </div>
          </div>
          <div className="flex items-start gap-4 border-t border-zinc-200 pt-5 dark:border-gray-700">
            <QrCode aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-fuchsia-600 dark:text-fuchsia-400" />
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">新用户自动注册</p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-gray-400">完成手机号绑定后，将自动创建okping.net平台用户。</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
