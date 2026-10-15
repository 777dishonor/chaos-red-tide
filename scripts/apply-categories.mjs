#!/usr/bin/env node
/**
 * 按 content/article-categories.json 的内容分类，覆盖各文章 tags。
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, "content", "articles");
const mapping = JSON.parse(
  await readFile(join(ROOT, "content", "article-categories.json"), "utf-8"),
);

const files = (await readdir(DIR)).filter(
  (f) => f.endsWith(".md") && f.startsWith("wx-"),
);

let updated = 0;
const missing = [];
for (const file of files) {
  const slug = file.replace(/\.md$/, "");
  const label = mapping[slug];
  if (!label) {
    missing.push(slug);
    continue;
  }
  const path = join(DIR, file);
  const raw = await readFile(path, "utf-8");
  const next = raw.replace(/^tags: \[.*\]$/m, `tags: [${label}]`);
  if (next !== raw) {
    await writeFile(path, next, "utf-8");
    updated++;
  }
}

console.log(`已更新 ${updated} 篇；缺少映射：${missing.length}`);
if (missing.length > 0) console.log(missing.join("\n"));
