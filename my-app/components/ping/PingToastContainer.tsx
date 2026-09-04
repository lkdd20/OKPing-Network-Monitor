"use client";

import { ToastContainer } from "react-toastify";

export function PingToastContainer() {
  return (
    <ToastContainer
      aria-label="页面通知"
      closeOnClick={false}
      draggable
      limit={3}
      newestOnTop
      pauseOnFocusLoss
      position="top-center"
    />
  );
}
