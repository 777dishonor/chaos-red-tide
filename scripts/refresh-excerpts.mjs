#!/usr/bin/env node
/**
 * 重算所有文章的摘要（跳过正文开头的图片与标题，提取第一段真正的文字）。
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, "content", "articles");

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

const files = (await readdir(DIR)).filter(
  (f) => f.endsWith(".md") && f.startsWith("wx-"),
);

let updated = 0;
for (const file of files) {
  const path = join(DIR, file);
  const raw = await readFile(path, "utf-8");
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!fmMatch) continue;
  const excerpt = cleanExcerpt(fmMatch[2]).replace(/"/g, "'");
  const next = raw.replace(/^excerpt: .*$/m, `excerpt: "${excerpt}"`);
  if (next !== raw) {
    await writeFile(path, next, "utf-8");
    updated++;
  }
}

console.log(`已刷新 ${updated} 篇文章的摘要。`);
