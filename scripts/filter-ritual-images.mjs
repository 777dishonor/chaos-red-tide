#!/usr/bin/env node
/**
 * 仪式记录分类排版整理：
 *  - 仅保留封面（标题图，由文章页展示）；
 *  - 正文图片全部移除（底部二维码由文章页模板统一展示）。
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, "content", "articles");
const PUBLIC = join(ROOT, "public");
const mapping = JSON.parse(
  await readFile(join(ROOT, "content", "article-categories.json"), "utf-8"),
);

const IMG_RE = /!\[[^\]]*\]\([^)]+\)/g;

async function main() {
  const files = (await readdir(DIR)).filter(
    (f) => f.endsWith(".md") && f.startsWith("wx-"),
  );
  let filtered = 0;
  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    if (mapping[slug] !== "仪式记录") continue;

    const path = join(DIR, file);
    const raw = await readFile(path, "utf-8");
    const split = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!split) continue;
    const fm = split[1];
    let body = split[2];

    const refs = [...body.matchAll(IMG_RE)];
    if (refs.length === 0) continue;

    body = body.replace(IMG_RE, "");
    body = body
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    body += "\n";

    await writeFile(path, `---\n${fm}\n---\n\n${body}\n`, "utf-8");
    filtered++;
    console.log(`[过滤] ${slug} · 移除正文图 ${refs.length} 张`);
  }

  console.log(`\n完成：处理 ${filtered} 篇仪式记录文章。`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
