import Link from "next/link";

/** 404 的正文：被 (marketing) 布局与根级兜底页共用 */
export function NotFoundContent() {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-vignette absolute inset-0" aria-hidden />
      <div className="container relative flex min-h-[68vh] max-w-2xl flex-col items-center justify-center py-20 text-center">
        <div className="flex w-40 items-center justify-center gap-4 text-brass/85" aria-hidden>
          <span className="hairline" />
          <span className="text-sm">✦</span>
          <span className="hairline" />
        </div>
        <p className="eyebrow mt-8">404 · 未收录</p>
        <h1 className="mt-5 font-display text-3xl font-medium leading-tight tracking-wide text-parchment sm:text-4xl">
          这一页不在档案之中
        </h1>
        <p className="mt-6 max-w-lg text-sm leading-loose text-parchment/80">
          它可能已被移动、改名，或者从未被写下。
          文存里的篇目都是照实归档的，不妨从那里重新找起。
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/archive" data-tap className="btn-academia-solid">
            翻阅文存
          </Link>
          <Link href="/" data-tap className="btn-academia">
            回到首页
          </Link>
        </div>
      </div>
    </section>
  );
}
