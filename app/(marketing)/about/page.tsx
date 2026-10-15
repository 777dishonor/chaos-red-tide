import Link from "next/link";

import { assetUrl } from "@/lib/asset";
import { getAllArticles } from "@/lib/articles";

const directions = [
  {
    title: "仪式实录",
    body: "召灵桌前的过程记录：起坛、显形、问权柄、献贡、复盘。写得像流水账，是因为它本来就是流水账。",
  },
  {
    title: "魔典译介",
    body: "行星魔法、月宿与 jinn、德国浮士德系魔典——译文、教学笔记与考据。",
  },
  {
    title: "灵体名录",
    body: "天使与恶魔的职能、对应与使用注意，逐条整理成可检索的档案。",
  },
];

export default function AboutPage() {
  const articles = getAllArticles();
  const years = articles
    .map((article) => article.date.slice(0, 4))
    .filter(Boolean)
    .sort();
  const span = years.length > 0 ? `${years[0]} — ${years[years.length - 1]}` : "—";

  const facts = [
    { label: "已归档", value: `${articles.length} 篇` },
    { label: "记录年份", value: span },
    { label: "原始出处", value: "微信公众号《混沌赤潮》" },
  ];

  return (
    <section className="container max-w-4xl py-14 sm:py-20">
      <p className="eyebrow">About · 关于</p>
      <h1 className="mt-5 font-display text-4xl font-medium tracking-wide text-parchment sm:text-5xl">
        混沌赤潮
      </h1>
      <p className="mt-4 font-serif text-sm italic text-parchment/80">
        一部仍在书写的实践档案
      </p>

      <div className="mt-12 max-w-2xl space-y-6 text-base leading-loose text-parchment/80">
        <p>
          《混沌赤潮》是一个微信公众号，写的是西方仪式魔法的实际操作——
          不是转述别人的传说，而是我们自己在桌前做了什么、发生了什么。
        </p>
        <p>
          文字由两个人共同完成：一位主笔，一位负责动手与拆台的搭档。
          第一人称、带时间与场景、连忘买蜡烛的部分也照实写下，是这份档案唯一的写法。
        </p>
        <p>
          本站是这些文章的归档处。公众号按时间推送，翻找旧文很费力；
          这里按方向与年代重新组织了一遍，方便回头查某一篇。
        </p>
      </div>

      {/* ── 硬事实 ── */}
      <dl className="mt-14 grid gap-4 sm:grid-cols-3">
        {facts.map((fact) => (
          <div key={fact.label} className="card-academia p-5">
            <dt className="font-sans text-[11px] uppercase tracking-widest3 text-brass/85">
              {fact.label}
            </dt>
            <dd className="mt-3 font-display text-lg font-medium leading-snug text-parchment">
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>

      {/* ── 收录方向 ── */}
      <div className="mt-16">
        <p className="eyebrow">Scope · 收录方向</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {directions.map((item) => (
            <article key={item.title} className="card-academia p-6">
              <h2 className="font-display text-lg font-semibold tracking-wide text-brass">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-parchment/80">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </div>

      {/* ── 边界 ── */}
      <div className="mt-16">
        <p className="eyebrow">Boundaries · 这里的边界</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div className="card-academia p-6">
            <h2 className="font-display text-lg font-semibold tracking-wide text-parchment">
              本站有的
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-parchment/80">
              <li>已发布文章的完整归档，按方向与年代整理</li>
              <li>标题、摘要与标签的站内检索</li>
              <li>每篇末尾的原文出处链接</li>
            </ul>
          </div>
          <div className="card-academia p-6">
            <h2 className="font-display text-lg font-semibold tracking-wide text-parchment">
              本站没有的
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-parchment/80">
              <li>没有注册与登录，不收集读者账号</li>
              <li>站内不出售任何内容，不设支付</li>
              <li>不设会员、社群与折扣承诺</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── 订阅 ── */}
      <div className="card-academia mt-16 border-brass/30 p-8 sm:p-10">
        <div className="grid items-center gap-8 sm:grid-cols-[1fr_auto]">
          <div>
            <p className="eyebrow">Subscribe · 订阅</p>
            <h2 className="mt-5 font-display text-2xl font-medium leading-tight tracking-wide text-parchment">
              想第一时间读到新的记录
            </h2>
            <p className="mt-4 max-w-md text-sm leading-loose text-parchment/80">
              关注公众号《混沌赤潮》。新的实验日志与译介会先发在那里，之后再归档到这里。
            </p>
            <Link
              href="/archive"
              className="mt-6 inline-flex font-sans text-xs uppercase tracking-widest2 text-brass transition-colors hover:text-brass-300"
            >
              或先翻阅文存 →
            </Link>
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
  );
}
