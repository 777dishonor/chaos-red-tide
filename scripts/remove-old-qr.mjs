#!/usr/bin/env node
/**
 * 移除仪式记录文章中之前自动识别（可能错误）的二维码行，
 * 统一改由文章页模板展示用户指定的两张二维码。
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

let removed = 0;
for (const file of files) {
  const slug = file.replace(/\.md$/, "");
  if (mapping[slug] !== "仪式记录") continue;
  const path = join(DIR, file);
  const raw = await readFile(path, "utf-8");
  const next = raw
    .replace(/<p class="article-qr-row">[\s\S]*?<\/p>\s*/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  const final = `${next}\n`;
  if (final !== raw) {
    await writeFile(path, final, "utf-8");
    removed++;
    console.log(`[清理] ${slug}`);
  }
}

console.log(`已清理 ${removed} 篇文章中的旧二维码行。`);
