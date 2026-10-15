import fs from "node:fs";
import path from "node:path";
import { cache } from "react";

export interface ArticleMeta {
  title: string;
  slug: string;
  date: string;
  tags: string[];
  cover?: string;
  source?: string;
  sourceUrl?: string;
  excerpt?: string;
}

export interface Article extends ArticleMeta {
  content: string;
}

export interface ArticleCategory {
  key: string;
  label: string;
  description: string;
  tags: string[];
}

/** 文存归档分类：把细粒度标签归入大栏目 */
export const ARTICLE_CATEGORIES: ArticleCategory[] = [
  {
    key: "ritual-records",
    label: "仪式记录",
    description: "召灵桌前的一切现场：成功、失败与忘买蜡烛。",
    tags: ["仪式记录"],
  },
  {
    key: "translations",
    label: "技法翻译与教学",
    description: "魔典、钥匙与技法资料的译介与教学。",
    tags: ["技法翻译与教学"],
  },
  {
    key: "essays",
    label: "随笔杂谈",
    description: "关于魔法、灵体与世界观的闲聊与思辨。",
    tags: ["随笔杂谈"],
  },
  {
    key: "grimoire",
    label: "灵体名录",
    description: "恶魔与天使的档案：能力、对应与使用注意。",
    tags: ["灵体名录"],
  },
  {
    key: "saints",
    label: "圣徒与天使",
    description: "守护天使、圣徒与灵性守护的专题。",
    tags: ["圣徒与天使"],
  },
  {
    key: "misc",
    label: "杂项与其他",
    description: "难以归类的散章：AI 玩梗、跨文化科普与档案体实验。",
    tags: ["杂项与其他"],
  },
];

export function articlesInCategory(
  articles: ArticleMeta[],
  category: ArticleCategory,
): ArticleMeta[] {
  return articles.filter((article) =>
    article.tags.some((tag) => category.tags.includes(tag)),
  );
}

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

function parseFrontmatter(raw: string): { meta: ArticleMeta; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    throw new Error("文章缺少 frontmatter（--- 开头）");
  }

  const fm = match[1];
  const body = match[2].trimStart();
  const fields: Record<string, string | string[]> = {};

  for (const line of fm.split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (key === "tags") {
      fields[key] = value
        .replace(/^\[|\]$/g, "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else {
      fields[key] = value.replace(/^["']|["']$/g, "");
    }
  }

  return {
    meta: {
      title: String(fields.title ?? ""),
      slug: String(fields.slug ?? ""),
      date: String(fields.date ?? ""),
      tags: (fields.tags as string[]) ?? [],
      cover: fields.cover ? String(fields.cover) : undefined,
      source: fields.source ? String(fields.source) : undefined,
      sourceUrl: fields.sourceUrl ? String(fields.sourceUrl) : undefined,
      excerpt: fields.excerpt ? String(fields.excerpt) : undefined,
    },
    body,
  };
}

function excerptOf(body: string): string {
  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    if (/^!\[.*?\]\(.*?\)$/.test(line)) continue; // 纯图片行
    const plain = line
      .replace(/<[^>]+>/g, "")
      .replace(/!\[.*?\]\(.*?\)/g, "")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/[*_`#>]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!plain) continue;
    return plain.length > 120 ? `${plain.slice(0, 120)}…` : plain;
  }
  return "";
}

/**
 * 读取全部文章元信息（带请求内缓存，同一页渲染只读一次磁盘）。
 * 遇到格式异常的 md 会跳过并打印文件名——避免文章无声消失。
 */
export const getAllArticles = cache((): ArticleMeta[] => {
  if (!fs.existsSync(ARTICLES_DIR)) return [];

  const articles: ArticleMeta[] = [];
  const files = fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith(".md") && !f.startsWith("README"));

  for (const f of files) {
    try {
      const raw = fs.readFileSync(path.join(ARTICLES_DIR, f), "utf-8");
      const { meta, body } = parseFrontmatter(raw);
      if (!meta.title || !meta.slug) {
        console.warn(`[articles] 已跳过 ${f}：frontmatter 缺少 title 或 slug`);
        continue;
      }
      articles.push({ ...meta, excerpt: meta.excerpt || excerptOf(body) });
    } catch (error) {
      console.warn(`[articles] 已跳过 ${f}：${(error as Error).message}`);
    }
  }

  return articles.sort((a, b) => (a.date < b.date ? 1 : -1));
});

export const getArticle = cache((slug: string): Article | null => {
  const filePath = path.join(ARTICLES_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { meta, body } = parseFrontmatter(raw);
    return { ...meta, excerpt: meta.excerpt || excerptOf(body), content: body };
  } catch (error) {
    console.warn(`[articles] 无法读取 ${slug}.md：${(error as Error).message}`);
    return null;
  }
});
