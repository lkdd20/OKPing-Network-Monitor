"use client";

import { BellRing, CheckCircle2, LoaderCircle, LogIn } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type SignupStatus = {
  registered: boolean;
  status?: "registered" | "notified" | null;
  registeredAt?: string | null;
};

type Envelope<T> = {
  code?: number | string;
  data?: T;
  msg?: string;
};

const STATUS_CHANGED_EVENT = "ping-product-beta-changed";

export function MonitoringBetaSignup({ authenticated }: { authenticated: boolean }) {
  const [status, setStatus] = useState<SignupStatus | null>(null);
  const [loading, setLoading] = useState(authenticated);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authenticated) return;
    let cancelled = false;

    async function loadStatus() {
      try {
        const response = await fetch("/api/product-beta", { cache: "no-store" });
        const body = (await response.json().catch(() => null)) as Envelope<SignupStatus> | null;
        if (response.status === 401) {
          if (!cancelled) setStatus(null);
          return;
        }
        if (!response.ok || String(body?.code) !== "200" || !body?.data) {
          throw new Error(body?.msg || "报名状态加载失败");
        }
        if (!cancelled) setStatus(body.data);
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "报名状态加载失败");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadStatus();
    return () => {
      cancelled = true;
    };
  }, [authenticated]);

  useEffect(() => {
    function handleStatusChanged(event: Event) {
      const changed = (event as CustomEvent<SignupStatus>).detail;
      if (changed) setStatus(changed);
    }
    window.addEventListener(STATUS_CHANGED_EVENT, handleStatusChanged);
    return () => window.removeEventListener(STATUS_CHANGED_EVENT, handleStatusChanged);
  }, []);

  function goToLogin() {
    window.location.assign("/login?next=/product");
  }

  async function signup() {
    if (!authenticated) {
      goToLogin();
      return;
    }
    if (status?.registered) {
      toast.info(status.status === "notified" ? "该报名已完成上线通知。" : "您已完成报名，请等待上线通知。");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/product-beta", { method: "POST" });
      const body = (await response.json().catch(() => null)) as Envelope<SignupStatus> | null;
      if (response.status === 401) {
        goToLogin();
        return;
      }
      if (!response.ok || String(body?.code) !== "200" || !body?.data) {
        throw new Error(body?.msg || "报名失败，请稍后重试");
      }
      setStatus(body.data);
      window.dispatchEvent(new CustomEvent(STATUS_CHANGED_EVENT, { detail: body.data }));
      toast.success("报名成功。监控服务上线后，我们会通过您的okping.net账号提醒您。");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "报名失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  }

  const registered = status?.registered === true;
  const notified = status?.status === "notified";

  return (
    <div className="flex flex-wrap items-center gap-4">
      <button
        className="inline-flex h-11 min-w-36 items-center justify-center gap-2 bg-emerald-500 px-5 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-wait disabled:bg-emerald-700 disabled:text-white"
        disabled={loading || submitting}
        onClick={() => void signup()}
        type="button"
      >
        {loading || submitting ? (
          <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
        ) : registered ? (
          <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
        ) : authenticated ? (
          <BellRing aria-hidden="true" className="h-4 w-4" />
        ) : (
          <LogIn aria-hidden="true" className="h-4 w-4" />
        )}
        {loading
          ? "正在查询"
          : submitting
            ? "正在报名"
            : notified
              ? "已完成通知"
              : registered
                ? "已报名内测"
                : authenticated
                  ? "报名内测"
                  : "登录后报名"}
      </button>
      <span className="text-xs leading-5 text-zinc-300">
        {registered
          ? notified
            ? "您的报名已完成通知记录。"
            : "报名已记录，产品上线后将通过账号通知您。"
          : "报名仅用于记录内测意向和后续上线通知。"}
      </span>
    </div>
  );
}
