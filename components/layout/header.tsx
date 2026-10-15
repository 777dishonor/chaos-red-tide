"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/archive", label: "文存" },
  { href: "/about", label: "关于" },
];

export function Header() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-ink-950/85 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="group flex items-baseline gap-3">
          <span className="font-display text-xl font-semibold tracking-wide text-parchment transition-colors group-hover:text-brass">
            混沌赤潮
          </span>
          <span className="hidden font-sans text-[11px] uppercase tracking-widest3 text-brass/85 sm:inline">
            Societas Chaos
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <nav aria-label="主导航" className="hidden items-center gap-7 md:flex">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative py-1 font-sans text-sm tracking-wide transition-colors hover:text-brass",
                    active ? "text-brass" : "text-parchment/70",
                  )}
                >
                  {item.label}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-0 -bottom-0.5 h-px bg-brass transition-opacity duration-300",
                      active ? "opacity-100" : "opacity-0",
                    )}
                  />
                </Link>
              );
            })}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
