import Link from "next/link";

import { assetUrl } from "@/lib/asset";
import { ARTICLE_CATEGORIES, articlesInCategory, getAllArticles } from "@/lib/articles";

export default function HomePage() {
  const articles = getAllArticles();
  const latest = articles.slice(0, 3);

  const years = articles
    .map((article) => article.date.slice(0, 4))
    .filter(Boolean)
    .sort();
  const span = years.length > 0 ? `${years[0]} — ${years[years.length - 1]}` : "—";

  const stats = [
    { value: String(articles.length), label: "已归档篇目" },
    { value: String(ARTICLE_CATEGORIES.length), label: "归档分类" },
    { value: span, label: "记录年份" },
  ];

  return (
    <div>
      {/* ── 卷首 ── */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="bg-vignette absolute inset-0" aria-hidden />
        <div className="container relative flex flex-col items-center py-20 text-center sm:py-28">
          <div
            className="mb-8 flex w-48 items-center justify-center gap-4 text-brass/85"
            aria-hidden
          >
            <span className="hairline" />
            <span className="text-sm">✦</span>
            <span className="hairline" />
          </div>

          <h1 className="max-w-3xl font-display text-[2.125rem] font-medium leading-[1.25] tracking-wide text-parchment sm:text-5xl md:text-6xl">
            在混沌中，
            <br />
            <span className="text-brass">我们研读秩序。</span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-base leading-loose text-parchment/80">
            混沌赤潮是微信公众号《混沌赤潮》的公开档案。这里记录西方仪式魔法的实际操作——
            召灵过程、行星与月宿魔法、魔典译介与灵体名录。
            <br className="hidden sm:block" />
            写法是第一人称实录：成功、失败与忘买蜡烛，都照实写下。
          </p>

          <div className="mt-11 flex flex-wrap items-center justify-center gap-4">
            <Link href="/archive" data-tap className="btn-academia-solid">
              翻阅文存
            </Link>
            <Link href="/about" data-tap className="btn-academia">
              关于本档案
            </Link>
          </div>
        </div>
      </section>

      {/* ── 档案概览：全部取自真实内容 ── */}
      <section className="border-b border-border/60 bg-ink-900/40">
        <div className="container grid grid-cols-1 divide-y divide-border/50 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {stats.map((item) => (
            <div key={item.label} className="px-2 py-7 text-center sm:px-6">
              <p className="font-display text-2xl font-medium tracking-wide text-brass sm:text-3xl">
                {item.value}
              </p>
              <p className="mt-2 font-sans text-[11px] uppercase tracking-widest3 text-parchment/70">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 最近手记 ── */}
      <section className="container py-16 sm:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Records · 最近手记</p>
            <h2 className="mt-4 font-display text-3xl font-medium tracking-wide text-parchment sm:text-4xl">
              最近的手记
            </h2>
          </div>
          <Link
            href="/archive"
            className="font-sans text-xs uppercase tracking-widest2 text-brass transition-colors hover:text-brass-300"
          >
            全部手记 →
          </Link>
        </div>

        {latest.length > 0 ? (
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {latest.map((item, index) => (
              <Link
                key={item.slug}
                href={`/archive/${item.slug}`}
                className="card-academia group flex flex-col p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-brass/40"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-sans text-xs tracking-widest2 text-brass/85">
                    {item.date}
                  </p>
                  <span
                    className="font-display text-sm text-parchment/70"
                    aria-hidden
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="hairline mt-4" />
                <h3 className="mt-5 flex-1 font-display text-xl font-medium leading-snug text-parchment transition-colors group-hover:text-brass-100">
                  {item.title}
                </h3>
                {item.tags.length > 0 ? (
                  <p className="mt-5 flex flex-wrap gap-2">
                    {item.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="tag-chip">
                        {tag}
                      </span>
                    ))}
                  </p>
                ) : null}
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-10 text-sm text-parchment/70">文存尚空。</p>
        )}
      </section>

      {/* ── 归档分类 ── */}
      <section className="border-y border-border/60 bg-ink-900/40">
        <div className="container py-16 sm:py-24">
          <p className="eyebrow">Archive · 归档分类</p>
          <h2 className="mt-4 font-display text-3xl font-medium tracking-wide text-parchment sm:text-4xl">
            按方向翻阅
          </h2>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ARTICLE_CATEGORIES.map((category) => (
              <Link
                key={category.key}
                href={`/archive?cat=${category.key}`}
                className="card-academia group flex items-baseline justify-between gap-4 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brass/40"
              >
                <span>
                  <span className="block font-display text-lg font-semibold tracking-wide text-brass transition-colors group-hover:text-brass-300">
                    {category.label}
                  </span>
                  <span className="mt-1.5 block text-sm leading-relaxed text-parchment/70">
                    {category.description}
                  </span>
                </span>
                <span className="shrink-0 font-sans text-xs tracking-widest text-parchment/70">
                  {articlesInCategory(articles, category).length} 篇
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 订阅：指向真实公众号 ── */}
      <section className="container py-16 sm:py-24">
        <div className="card-academia relative overflow-hidden border-brass/30 px-6 py-12 sm:px-12 sm:py-16">
          <div className="grid items-center gap-10 md:grid-cols-[1fr_auto]">
            <div>
              <p className="eyebrow">Subscribe · 订阅</p>
              <h2 className="mt-5 max-w-xl font-display text-2xl font-medium leading-tight tracking-wide text-parchment sm:text-3xl">
                新记录会先出现在公众号
                <span className="italic text-brass">《混沌赤潮》</span>
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-loose text-parchment/80">
                本站是已发布内容的归档处，方便按主题回查；公众号则是连载的第一现场。
                扫码关注即可第一时间读到新的实验日志与译介。
              </p>
            </div>
            <div className="flex flex-col items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={assetUrl("/images/qrcode/qrcode-1.webp")}
                alt="公众号「混沌赤潮」二维码"
                width={148}
                height={148}
                loading="lazy"
                decoding="async"
                className="h-[148px] w-[148px] rounded-sm border border-border/70 bg-parchment/5 p-1.5"
              />
              <p className="font-sans text-[11px] uppercase tracking-widest3 text-parchment/70">
                扫码关注
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
