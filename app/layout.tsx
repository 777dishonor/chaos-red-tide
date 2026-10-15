import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";

import { assetUrl } from "@/lib/asset";

import "./globals.css";

/**
 * 标题字体：Cormorant Garamond（古典衬线，含意大利斜体）
 * 中文字形由 tailwind.config.js 中的中文衬线回退栈接管。
 */
const display = Cormorant_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

/** 正文字体：Inter（极简无衬线） */
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const siteName = "混沌赤潮";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: `${siteName} · 一部仍在书写的实践档案`,
    template: `%s · ${siteName}`,
  },
  description:
    "混沌赤潮：西方仪式魔法的实操记录与文献译介。收录召灵实录、灵体名录、行星与月宿魔法、魔典考据与随笔。",
  keywords: [
    "混沌赤潮",
    "仪式魔法",
    "西方神秘学",
    "魔典",
    "灵体名录",
    "行星魔法",
    "月宿",
    "Dark Academia",
  ],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName,
    title: `${siteName} · 一部仍在书写的实践档案`,
    description:
      "以第一人称记录的仪式实践档案：召灵桌前的一切，成功、失败与忘买蜡烛，都照实写下。",
  },
  robots: {
    index: true,
    follow: true,
  },
  // 网页应用清单：文件在 public/manifest.webmanifest。
  // 注意 Next 不会给 manifest 字段自动加部署子路径，所以这里显式拼前缀；
  // 清单内部的 start_url / icons 用相对路径，本地与线上都正确。
  manifest: assetUrl("/manifest.webmanifest"),
};

export const viewport: Viewport = {
  themeColor: "#0D0D0F",
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${display.variable} ${sans.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-ink-950 text-parchment">
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("chaos-theme");document.documentElement.classList.toggle("dark",t?t==="dark":true)}catch(e){document.documentElement.classList.add("dark")}`,
          }}
        />
        <div className="grain-overlay" aria-hidden />
        {children}
      </body>
    </html>
  );
}
