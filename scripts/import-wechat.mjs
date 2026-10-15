#!/usr/bin/env node
/**
 * 微信公众号文章导入脚本
 *
 * 用法：
 *   npm run import:wechat                          # 读取 content/wechat-links.txt
 *   npm run import:wechat -- --html <文件夹路径>     # 导入本地 HTML 文件
 *   npm run import:wechat -- --dry-run             # 试运行，不写文件
 *
 * 输入一：content/wechat-links.txt，每行一个文章链接；
 * 输入二：本地 HTML 文件（微信公众号文章另存 / 插件导出）。
 *
 * 输出：content/articles/<slug>.md（Markdown + frontmatter），
 *       图片下载到 public/images/articles/<slug>/。
 */
import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import * as cheerio from "cheerio";
import TurndownService from "turndown";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_LINKS = join(ROOT, "content", "wechat-links.txt");
const DEFAULT_OUT = join(ROOT, "content", "articles");
const DEFAULT_IMAGES = join(ROOT, "public", "images", "articles");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

function parseArgs(argv) {
  const args = {
    links: DEFAULT_LINKS,
    htmlDir: null,
    outDir: DEFAULT_OUT,
    imagesDir: DEFAULT_IMAGES,
    dryRun: false,
    force: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const eq = arg.indexOf("=");
    const key = eq === -1 ? arg : arg.slice(0, eq);
    let value = eq === -1 ? undefined : arg.slice(eq + 1);
    if (
      value === undefined &&
      ["--links", "--html", "--out", "--images"].includes(key) &&
      i + 1 < argv.length
    ) {
      value = argv[++i];
    }
    if (key === "--links") args.links = value;
    else if (key === "--html") args.htmlDir = value;
    else if (key === "--out") args.outDir = value;
    else if (key === "--images") args.imagesDir = value;
    else if (key === "--dry-run") args.dryRun = true;
    else if (key === "--force") args.force = true;
  }
  return args;
}

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function readLinkList(file) {
  if (!(await exists(file))) return [];
  const raw = await readFile(file, "utf-8");
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => /^https?:\/\//.test(l));
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, "Accept-Language": "zh-CN,zh;q=0.9" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Referer: "https://mp.weixin.qq.com/",
    },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 100) throw new Error("响应过短，疑似防盗链页面");
  return buf;
}

function imageExt(url) {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.toLowerCase();
    const m = path.match(/\.(jpe?g|png|gif|webp|bmp)$/);
    if (m) return m[1];
    // 微信图片常以 /0?wx_fmt=jpeg 之类的形式给出，扩展名藏在参数里
    const fmt = parsed.searchParams.get("wx_fmt")?.toLowerCase();
    if (fmt && ["jpeg", "jpg", "png", "gif", "webp", "bmp"].includes(fmt)) {
      return fmt === "jpeg" ? "jpg" : fmt;
    }
    // 无扩展名也无 wx_fmt 的微信域名图片，默认按 jpg 处理
    if (parsed.hostname.endsWith("qpic.cn")) return "jpg";
    return null;
  } catch {
    return null;
  }
}

/** 从公众号文章 HTML 中提取标题、账号、日期与正文 */
function extractArticle(html) {
  const $ = cheerio.load(html);
  const title =
    $("#activity-name").text().trim() ||
    $('meta[property="og:title"]').attr("content")?.trim() ||
    $("title").text().trim() ||
    "未命名文章";
  const series =
    (title.match(/^[【{\[]([^】}\]]+)[】}\]]/) || [])[1]?.trim() || "";
  const account =
    $("#js_name").text().trim() ||
    $('meta[property="og:article:author"]').attr("content")?.trim() ||
    "";
  const cover = $('meta[property="og:image"]').attr("content")?.trim() || "";

  let date = "";
  const ctMatch = html.match(/var\s+ct\s*=\s*"(\d{10})"/);
  if (ctMatch) {
    date = new Date(Number(ctMatch[1]) * 1000).toISOString().slice(0, 10);
  } else {
    const timeText = $("#publish_time").text().trim();
    const timeMatch = timeText.match(/(\d{4}[-/]\d{1,2}[-/]\d{1,2})/);
    if (timeMatch) date = timeMatch[1].replace(/\//g, "-");
  }
  if (!date) date = new Date().toISOString().slice(0, 10);

  const $content = $("#js_content");
  if ($content.length === 0) return null;

  $content
    .find(
      [
        "script",
        "style",
        "iframe",
        "svg",
        "noscript",
        "form",
        ".rich_media_area_extra",
        ".js_pc_qr_code",
        ".qr_code",
        ".weui-msg__extra",
        ".rich_media_tool",
        ".ct_mpda_wrp",
        ".reward_area",
        ".recommend_area",
        ".related-reading",
      ].join(","),
    )
    .remove();

  return {
    title,
    series,
    account,
    date,
    cover,
    contentHtml: $content.html() ?? "",
  };
}

/** 下载正文图片并改写为本地路径，返回下载张数 */
async function downloadImages($, slug, imagesDir) {
  const dir = join(imagesDir, slug);
  await mkdir(dir, { recursive: true });
  let index = 0;
  const jobs = [];

  $("img").each((_, el) => {
    const $img = $(el);
    const src = ($img.attr("data-src") || $img.attr("src") || "").trim();
    if (!/^https?:\/\//.test(src)) return;
    const ext = imageExt(src);
    if (!ext) return;
    const name = `img-${String(index++).padStart(2, "0")}.${ext}`;
    jobs.push({
      $img,
      src,
      abs: join(dir, name),
      publicPath: `/images/articles/${slug}/${name}`,
    });
  });

  for (const job of jobs) {
    try {
      const buf = await fetchBuffer(job.src);
      await writeFile(job.abs, buf);
      job.$img.attr("src", job.publicPath);
      job.$img.removeAttr("data-src");
      job.$img.removeAttr("data-type");
      job.$img.removeAttr("data-ratio");
      job.$img.removeAttr("data-w");
      job.$img.removeAttr("width");
      job.$img.removeAttr("height");
    } catch (err) {
      console.warn(`  [图片跳过] ${job.src} → ${err.message}`);
      job.$img.attr("src", job.src);
      job.$img.removeAttr("data-src");
    }
  }
  return index;
}

async function downloadCover(coverUrl, slug, imagesDir) {
  const ext = imageExt(coverUrl) || "jpg";
  const dir = join(imagesDir, slug);
  await mkdir(dir, { recursive: true });
  const abs = join(dir, `cover.${ext}`);
  try {
    const buf = await fetchBuffer(coverUrl);
    await writeFile(abs, buf);
    return `/images/articles/${slug}/cover.${ext}`;
  } catch (err) {
    console.warn(`  [封面跳过] ${coverUrl} → ${err.message}`);
    return coverUrl;
  }
}

function toMarkdown(html) {
  const turndown = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
  });
  // 加粗/斜体保留为 HTML 标签，避免生成易出错的 ** 星号语法
  turndown.addRule("strong", {
    filter: ["strong", "b"],
    replacement: (content) => `<strong>${content}</strong>`,
  });
  turndown.addRule("emphasis", {
    filter: ["em", "i"],
    replacement: (content) => `<em>${content}</em>`,
  });
  return turndown
    .turndown(html)
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\*/g, "")
    .trim();
}

function cleanExcerpt(markdown) {
  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    if (/^!\[.*?\]\(.*?\)$/.test(line)) continue;
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

function slugFromUrl(url) {
  try {
    const sn = new URL(url).searchParams.get("sn");
    if (sn) return `wx-${sn}`;
    const m = url.match(/\/s\/([A-Za-z0-9_-]+)/);
    if (m) return `wx-${m[1]}`;
  } catch {
    /* 忽略 */
  }
  return null;
}

function buildFrontmatter(meta) {
  const lines = ["---"];
  lines.push(`title: "${meta.title.replace(/"/g, '\\"')}"`);
  lines.push(`slug: "${meta.slug}"`);
  lines.push(`date: "${meta.date}"`);
  lines.push(`tags: [${meta.tags.join(", ")}]`);
  if (meta.cover) lines.push(`cover: "${meta.cover}"`);
  if (meta.source) lines.push(`source: "${meta.source}"`);
  if (meta.sourceUrl) lines.push(`sourceUrl: "${meta.sourceUrl}"`);
  if (meta.excerpt) lines.push(`excerpt: "${meta.excerpt}"`);
  lines.push("---");
  return lines.join("\n");
}

async function importOne(html, sourceUrl, index, args) {
  const article = extractArticle(html);
  if (!article) return { status: "unrecognized" };

  const slug =
    slugFromUrl(sourceUrl) || `article-${String(Date.now()).slice(-6)}${index}`;
  const target = join(args.outDir, `${slug}.md`);
  if (!args.force && (await exists(target))) {
    return { status: "exists", slug };
  }

  const $ = cheerio.load(article.contentHtml);
  const imgCount = await downloadImages($, slug, args.imagesDir);
  const markdown = toMarkdown($.html());
  const excerpt = cleanExcerpt(markdown);
  const cover = article.cover
    ? await downloadCover(article.cover, slug, args.imagesDir)
    : undefined;
  const source = article.account ? `微信公众号「${article.account}」` : undefined;

  const body = `${buildFrontmatter({
    title: article.title,
    slug,
    date: article.date,
    tags: article.series ? [article.series] : [],
    cover,
    source,
    sourceUrl: sourceUrl || undefined,
    excerpt,
  })}\n\n${markdown}\n`;

  if (args.dryRun) {
    return { status: "dry", slug, title: article.title };
  }
  await writeFile(target, body, "utf-8");
  return { status: "imported", slug, title: article.title, imgCount };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  await mkdir(args.outDir, { recursive: true });

  const sources = [];
  if (args.htmlDir) {
    const files = (await readdir(args.htmlDir)).filter((f) =>
      /\.html?$/i.test(f),
    );
    for (const file of files) {
      sources.push({ kind: "file", path: join(args.htmlDir, file), url: "" });
    }
  } else {
    const links = await readLinkList(args.links);
    for (const url of links) sources.push({ kind: "url", url, path: "" });
  }

  if (sources.length === 0) {
    console.log(
      "没有找到导入源：请在 content/wechat-links.txt 每行放一个文章链接，或用 --html 指定 HTML 文件目录。",
    );
    return;
  }

  let ok = 0;
  let skipped = 0;
  let failed = 0;
  for (const [i, source] of sources.entries()) {
    const label = source.url || source.path;
    try {
      const html =
        source.kind === "url"
          ? await fetchText(source.url)
          : await readFile(source.path, "utf-8");
      const result = await importOne(html, source.url, i, args);
      if (result.status === "imported") {
        console.log(
          `[导入] ${result.slug} · ${result.title}${
            result.imgCount ? ` · 图片 ${result.imgCount} 张` : ""
          }`,
        );
        ok++;
      } else if (result.status === "dry") {
        console.log(`[试运行] ${result.slug} · ${result.title}`);
        ok++;
      } else if (result.status === "exists") {
        console.log(`[已存在] ${result.slug}`);
        skipped++;
      } else {
        console.log(`[跳过] ${label} 无法识别为公众号文章页`);
        failed++;
      }
    } catch (err) {
      console.error(`[失败] ${label} → ${err.message}`);
      failed++;
    }
  }

  console.log(`\n完成：导入 ${ok}，跳过 ${skipped}，失败 ${failed}。`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
