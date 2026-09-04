import type { Metadata } from "next";
import Script from "next/script";

import "./globals.css";

export const metadata: Metadata = {
  title: "Ping",
  description: "Ping 网络拨测工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased" suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        <Script id="theme-bootstrap" strategy="beforeInteractive">
          {`(() => {
  try {
    const stored = window.localStorage.getItem("theme");
    const cookieDark = document.cookie.includes("darkMode=true");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = stored ? stored === "dark" : cookieDark || prefersDark;
    document.documentElement.classList.toggle("dark", dark);
  } catch {
    document.documentElement.classList.remove("dark");
  }
})();`}
        </Script>
        <Script
          data-website-id="471fcd8a-d19b-42c4-b7e9-03ee3765e668"
          defer
          src="https://tongji.okping.net/script.js"
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}
