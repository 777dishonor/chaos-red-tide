"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { ArticleMeta } from "@/lib/articles";
import { cn } from "@/lib/utils";

export interface BrowserCategory {
  key: string;
  label: string;
  description: string;
  tags: string[];
  count: number;
}

function toRoman(year: number): string {
  const table: Array<[number, string]> = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let n = year;
  let out = "";
  for (const [value, symbol] of table) {
    while (n >= value) {
      out += symbol;
      n -= value;
    }
  }
  return out;
}

export function ArchiveBrowser({
  articles,
  categories,
}: {
  articles: ArticleMeta[];
  categories: BrowserCategory[];
}) {
  const [query, setQuery] = useState("");
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  /* 首屏从地址栏读取分类，使 /archive?cat=xxx 的链接可分享；
     但初始渲染不依赖 URL，因此页面仍可静态预渲染。 */
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("cat");
    if (fromUrl && categories.some((category) => category.key === fromUrl)) {
      setActiveKey(fromUrl);
    }
    setReady(true);
  }, [categories]);

  /* 选择变化后再同步回地址栏，不触发导航与滚动复位 */
  useEffect(() => {
    if (!ready) return;
    const params = new URLSearchParams(window.location.search);
    if (activeKey) params.set("cat", activeKey);
    else params.delete("cat");
    const search = params.toString();
    window.history.replaceState(
      null,
      "",
      search ? `${window.location.pathname}?${search}` : window.location.pathname,
    );
  }, [activeKey, ready]);

  const activeCategory = activeKey
    ? categories.find((category) => category.key === activeKey) ?? null
    : null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((article) => {
      const inCategory =
        !activeCategory ||
        activeCategory.tags.some((tag) => article.tags.includes(tag));
      if (!inCategory) return false;
      if (!q) return true;
      return [article.title, article.excerpt ?? "", article.tags.join(" ")]
        .join("\n")
        .toLowerCase()
        .includes(q);
    });
  }, [articles, activeCategory, query]);

  const byYear = useMemo(() => {
    const map = new Map<string, ArticleMeta[]>();
    for (const article of filtered) {
      const year = article.date.slice(0, 4);
      if (!map.has(year)) map.set(year, []);
      map.get(year)!.push(article);
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  const hasFilter = Boolean(activeCategory) || query.trim().length > 0;

  return (
    <div className="mt-10">
      {/* ── 检索与筛选 ── */}
      <div className="sticky top-16 z-30 -mx-6 border-b border-border/50 bg-ink-950/95 px-6 py-4 backdrop-blur-md">
        <div className="relative sm:max-w-xl">
          <Search
            size={16}
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-parchment/70"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="搜索文存"
            placeholder="搜索标题、摘要或标签…"
            className="w-full rounded-sm border border-border/70 bg-ink-900/70 py-3 pl-11 pr-11 text-sm text-parchment placeholder:text-parchment/70 focus:border-brass/70 focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="清除搜索"
              className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-sm text-parchment/70 transition-colors hover:text-brass"
            >
              <X size={16} aria-hidden />
            </button>
          ) : null}
        </div>

        {/* 手机端单行横滑，避免七个分类占掉半屏；桌面端自然换行 */}
        <div className="no-scrollbar -mx-6 mt-3 flex gap-2 overflow-x-auto px-6 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          <button
            type="button"
            data-tap
            onClick={() => setActiveKey(null)}
            aria-pressed={!activeCategory}
            className={cn(
              "inline-flex shrink-0 items-center rounded-full border px-3.5 py-2 font-sans text-xs tracking-wide transition-colors",
              !activeCategory
                ? "border-brass/70 bg-brass/15 text-brass"
                : "border-border text-parchment/70 hover:border-brass/40 hover:text-brass",
            )}
          >
            全部 · {articles.length}
          </button>
          {categories.map((category) => {
            const active = activeCategory?.key === category.key;
            return (
              <button
                key={category.key}
                type="button"
                data-tap
                onClick={() => setActiveKey(active ? null : category.key)}
                aria-pressed={active}
                className={cn(
                  "inline-flex shrink-0 items-center rounded-full border px-3.5 py-2 font-sans text-xs tracking-wide transition-colors",
                  active
                    ? "border-brass/70 bg-brass/15 text-brass"
                    : "border-border text-parchment/70 hover:border-brass/40 hover:text-brass",
                )}
              >
                {category.label} · {category.count}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="font-sans text-xs tracking-wide text-parchment/70">
            共 {filtered.length} 篇
            {activeCategory ? ` · ${activeCategory.label}` : ""}
            {query.trim() ? ` · 含「${query.trim()}」` : ""}
          </p>
          {hasFilter ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveKey(null);
              }}
              className="font-sans text-xs tracking-wide text-brass transition-colors hover:text-brass-300"
            >
              清除筛选
            </button>
          ) : null}
        </div>
      </div>

      {/* ── 结果 ── */}
      {byYear.length === 0 ? (
        <div className="card-academia mt-10 p-10 text-center">
          <p className="font-serif text-lg italic text-parchment/80">
            没有找到相符的篇目。
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setActiveKey(null);
            }}
            className="btn-academia mt-6"
          >
            清除筛选
          </button>
        </div>
      ) : (
        byYear.map(([year, list]) => (
          <section key={year} className="mt-12">
            <div className="flex items-baseline gap-4">
              <h2 className="font-display text-3xl font-medium tracking-widest text-parchment">
                {toRoman(Number(year))}
              </h2>
              <p className="font-sans text-xs uppercase tracking-widest3 text-brass/85">
                {year} · {list.length} 篇
              </p>
            </div>
            <div className="hairline mt-5 w-full" aria-hidden />

            <div className="divide-y divide-border/50 border-b border-border/50">
              {list.map((article) => (
                <Link
                  key={article.slug}
                  href={`/archive/${article.slug}`}
                  className="group grid gap-2 py-7 transition-colors duration-300 hover:bg-parchment/[0.04] sm:grid-cols-[7rem_1fr] sm:gap-8"
                >
                  <time
                    dateTime={article.date}
                    className="pt-1 font-sans text-xs uppercase tracking-widest2 text-brass/85"
                  >
                    {article.date.slice(5)}
                  </time>
                  <div>
                    <h3 className="font-display text-xl font-medium leading-snug tracking-wide text-parchment transition-colors group-hover:text-brass-100 sm:text-2xl">
                      {article.title}
                    </h3>
                    {article.excerpt ? (
                      <p className="mt-2.5 text-sm leading-relaxed text-parchment/70">
                        {article.excerpt}
                      </p>
                    ) : null}
                    {article.tags.length > 0 ? (
                      <span className="mt-3.5 flex flex-wrap gap-2">
                        {article.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="tag-chip">
                            {tag}
                          </span>
                        ))}
                      </span>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
