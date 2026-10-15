"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Info, Library } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "首页", icon: Home },
  { href: "/archive", label: "文存", icon: Library },
  { href: "/about", label: "关于", icon: Info },
];

/**
 * 手机端底部固定导航。
 * 桌面端（≥768px）由 Header 内的横向导航承担，此处隐藏。
 */
export function MobileNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav
      aria-label="主导航"
      className="pb-safe fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-ink-950/95 backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto flex max-w-md items-stretch">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                data-tap
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-14 flex-col items-center justify-center gap-1 font-sans text-[11px] tracking-widest2 transition-colors",
                  active ? "text-brass" : "text-parchment/70",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-0 top-0 h-px bg-brass transition-opacity duration-300",
                    active ? "opacity-100" : "opacity-0",
                  )}
                />
                <Icon size={18} strokeWidth={1.6} aria-hidden />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
