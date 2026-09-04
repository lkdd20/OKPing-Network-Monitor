"use client";

import { useEffect, useRef } from "react";
import { toast, type Id } from "react-toastify";

type PingToastVariant = "error" | "success" | "info";

export function PingToast({
  message,
  onClose,
  variant = "error",
}: {
  message?: string;
  onClose: () => void;
  variant?: PingToastVariant;
}) {
  const closeHandlerRef = useRef(onClose);
  const toastIdRef = useRef<Id | null>(null);

  useEffect(() => {
    closeHandlerRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const currentToastId = toastIdRef.current;

    if (!message) {
      if (currentToastId != null && toast.isActive(currentToastId)) {
        toast.dismiss(currentToastId);
      }
      toastIdRef.current = null;
      return;
    }

    const options = {
      ariaLabel: "页面通知",
      autoClose: variant === "error" ? 7000 : 4500,
      closeOnClick: false,
      onClose: () => closeHandlerRef.current(),
    };

    if (currentToastId != null && toast.isActive(currentToastId)) {
      toast.update(currentToastId, {
        ...options,
        render: message,
        type: variant,
      });
      return;
    }

    toastIdRef.current = toast[variant](message, options);
  }, [message, variant]);

  return null;
}
