#!/usr/bin/env node
/**
 * 删除文章 Markdown 中所有 ASCII 星号（*），包括正文与 frontmatter。
 * 用于清理导入时残留的加粗标记。
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, "content", "articles");

const files = (await readdir(DIR)).filter((f) => f.endsWith(".md"));

let changed = 0;
for (const file of files) {
  const path = join(DIR, file);
  const raw = await readFile(path, "utf-8");
  const next = raw.replace(/\*/g, "");
  if (next !== raw) {
    await writeFile(path, next, "utf-8");
    changed++;
  }
}

console.log(`已清理 ${changed} 个文件中的星号。`);
