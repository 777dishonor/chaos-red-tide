import Link from "next/link";

import { assetUrl } from "@/lib/asset";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/archive", label: "文存" },
  { href: "/about", label: "关于" },
];

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-ink-900/60">
      <div className="container grid gap-12 py-14 sm:grid-cols-2 md:grid-cols-3">
        <div>
          <p className="font-display text-xl font-semibold tracking-wide text-parchment">
            混沌赤潮
          </p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-parchment/70">
            以第一人称记录的西方仪式魔法实践档案。召灵桌前的一切，照实写下。
          </p>
        </div>

        <div>
          <p className="eyebrow">目录</p>
          <ul className="mt-5 space-y-3 text-sm">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-parchment/70 transition-colors hover:text-brass"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow">订阅</p>
          <div className="mt-5 flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={assetUrl("/images/qrcode/qrcode-1.webp")}
              alt="公众号「混沌赤潮」二维码"
              width={88}
              height={88}
              loading="lazy"
              decoding="async"
              className="h-20 w-20 shrink-0 rounded-sm border border-border/70 bg-parchment/5 p-1"
            />
            <p className="text-sm leading-relaxed text-parchment/70">
              本档案源出微信公众号
              <span className="text-brass">《混沌赤潮》</span>
              <br />
              扫码关注，新记录会先出现在那里。
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-border/40">
        <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-parchment/70 sm:flex-row">
          <p>© 2026 混沌赤潮 · 保留所有权利</p>
          <p>Dark Academia · Minimal Esoteric</p>
        </div>
      </div>
    </footer>
  );
}
