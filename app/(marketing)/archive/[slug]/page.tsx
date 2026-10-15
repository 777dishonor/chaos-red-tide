import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { imageSize } from "image-size";
import rehypeRaw from "rehype-raw";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { assetUrl } from "@/lib/asset";
import { getAllArticles, getArticle } from "@/lib/articles";

/** 未知 slug 一律 404，不做按需渲染，保证整站可静态托管 */
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = getArticle(params.slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
  };
}

/** 正文图片处理：补真实尺寸 + 懒加载，避免版面跳动与一次性抢带宽 */
type HastNode = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

const PUBLIC_DIR = path.join(process.cwd(), "public");
const sizeCache = new Map<string, { width: number; height: number } | null>();

function intrinsicSize(src: string): { width: number; height: number } | null {
  if (!src.startsWith("/")) return null;
  const cached = sizeCache.get(src);
  if (cached !== undefined) return cached;

  let result: { width: number; height: number } | null = null;
  try {
    const file = path.join(
      PUBLIC_DIR,
      decodeURIComponent(src.split("?")[0].replace(/^\//, "")),
    );
    const { width, height } = imageSize(fs.readFileSync(file));
    if (width && height) result = { width, height };
  } catch {
    result = null;
  }
  sizeCache.set(src, result);
  return result;
}

function rehypeArticleImages() {
  return (tree: HastNode) => {
    const walk = (node: HastNode) => {
      if (node.type === "element" && node.tagName === "img") {
        const src =
          typeof node.properties?.src === "string" ? node.properties.src : null;
        // 先用原始路径（/images/...）读真实尺寸，再给 src 补部署子路径前缀
        const size = src ? intrinsicSize(src) : null;
        node.properties = {
          ...node.properties,
          ...(src ? { src: assetUrl(src) } : {}),
          loading: "lazy",
          decoding: "async",
          ...(size ? { width: size.width, height: size.height } : {}),
        };
      }
      for (const child of node.children ?? []) walk(child);
    };
    walk(tree);
  };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticle(params.slug);
  if (!article) notFound();

  const all = getAllArticles();
  const index = all.findIndex((item) => item.slug === article.slug);
  const newer = index > 0 ? all[index - 1] : null;
  const older = index >= 0 && index < all.length - 1 ? all[index + 1] : null;

  return (
    <article className="container max-w-3xl py-12 sm:py-20">
      <Link
        href="/archive"
        className="inline-flex items-center font-sans text-xs uppercase tracking-widest2 text-brass/85 transition-colors hover:text-brass"
      >
        ← 返回文存
      </Link>

      <header className="mt-8">
        <p className="eyebrow">
          {article.date}
          {article.source ? ` · ${article.source}` : ""}
        </p>
        <h1 className="mt-5 font-display text-3xl font-medium leading-tight tracking-wide text-parchment sm:text-4xl md:text-[2.75rem]">
          {article.title}
        </h1>
        {article.tags.length > 0 ? (
          <span className="mt-6 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span key={tag} className="tag-chip">
                {tag}
              </span>
            ))}
          </span>
        ) : null}
      </header>

      {article.cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={assetUrl(article.cover)}
          alt={article.title}
          decoding="async"
          className="mt-10 w-full rounded-sm border border-border/60"
        />
      ) : null}

      <div className="mt-10 sm:mt-12">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeArticleImages]}
          className="prose prose-invert max-w-none prose-headings:font-display prose-headings:font-medium prose-headings:tracking-wide prose-a:no-underline hover:prose-a:text-brass-300"
        >
          {article.content}
        </ReactMarkdown>
      </div>

      {article.tags.includes("仪式记录") ? (
        <div className="article-qr-row">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={assetUrl("/images/qrcode/qrcode-1.webp")}
            width={150}
            height={150}
            loading="lazy"
            decoding="async"
            className="article-qr"
            alt="公众号「混沌赤潮」二维码"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={assetUrl("/images/qrcode/qrcode-2.webp")}
            width={150}
            height={150}
            loading="lazy"
            decoding="async"
            className="article-qr"
            alt="微信二维码"
          />
        </div>
      ) : null}

      {/* ── 篇目导航 ── */}
      {newer || older ? (
        <nav aria-label="篇目导航" className="mt-16 grid gap-4 sm:grid-cols-2">
          {newer ? (
            <Link
              href={`/archive/${newer.slug}`}
              className="card-academia group flex flex-col gap-2 p-5 transition-colors duration-300 hover:border-brass/40"
            >
              <span className="font-sans text-[11px] uppercase tracking-widest3 text-brass/85">
                ← 较新一篇
              </span>
              <span className="font-display text-lg font-medium leading-snug text-parchment transition-colors group-hover:text-brass-100">
                {newer.title}
              </span>
            </Link>
          ) : null}
          {older ? (
            <Link
              href={`/archive/${older.slug}`}
              className="card-academia group flex flex-col gap-2 p-5 transition-colors duration-300 hover:border-brass/40 sm:items-end sm:text-right"
            >
              <span className="font-sans text-[11px] uppercase tracking-widest3 text-brass/85">
                较旧一篇 →
              </span>
              <span className="font-display text-lg font-medium leading-snug text-parchment transition-colors group-hover:text-brass-100">
                {older.title}
              </span>
            </Link>
          ) : null}
        </nav>
      ) : null}

      <div className="hairline mt-14" aria-hidden />
      <p className="mt-6 text-xs leading-relaxed text-parchment/70">
        {article.sourceUrl ? (
          <>
            原文发布于微信：
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-brass/85 transition-colors hover:text-brass"
            >
              {article.sourceUrl}
            </a>
          </>
        ) : (
          "本文为混沌赤潮原创内容。"
        )}
      </p>
    </article>
  );
}
