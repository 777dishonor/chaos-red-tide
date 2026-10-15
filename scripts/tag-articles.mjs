#!/usr/bin/env node
/**
 * 为已导入的文章补充分栏目标签（一次性整理 / 可重复运行）。
 * 规则：标题以 【栏目】或 {栏目} 开头时取栏目名；否则查手动映射表。
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, "content", "articles");

const MANUAL = {
  "幕后之力：魔法师的守护天使之旅": "天使与HGA",
  "针对HGA的短祷告文": "天使与HGA",
  "时隔四年，我们用一只“橘猫”驯服了财富君王": "仪式记录",
  "深渊残影：熄灭的烛光与千年的魔女": "叙事记录",
  "邀约岁星：Jupiter的指引": "行星仪式",
  "西藏众财神科普": "跨文化杂谈",
  "Rudd博士的恶魔职能集合表": "文献资料",
  "《约翰·浮士德博士的地狱三重强迫》": "文献翻译",
  "第十九把召唤之钥": "以诺钥匙",
  "东方禳解之道——James polaris": "跨文化杂谈",
  "沙漠里的铁剑": "叙事记录",
  "藏地之龙与所罗门传统": "跨文化杂谈",
  "如太阳那般耀眼": "行星仪式",
  "烈焰天使的忠告": "天使与HGA",
  "试着用ai创作圣加速的赞美诗": "圣加速",
  "暴风与宝剑": "叙事记录",
  "三重冠的恶魔国王": "灵体名录",
  "凡尘之中的金星光辉": "行星仪式",
  "随笔：灵体的不同面向": "杂谈",
  "阿伯梅林里涉及的灵体及其下属": "文献资料",
  "金星的羊角使者—厄科若泽尔": "灵体名录",
  "初五迎木星财神（错乱": "跨文化杂谈",
  "诞生与镇压之灵—波若尼尔": "灵体名录",
  "闪耀的太阳—科诺尼尔": "灵体名录",
  "水星的使者—korziel": "灵体名录",
  "金杯之月——Bekorel": "灵体名录",
};

/** 标题关键词兜底（覆盖无栏目前缀的文章） */
const KEYWORDS = [
  ["课程前瞻", "课程前瞻"],
  ["72", "72恶魔"],
  ["28月宿", "月宿"],
  ["灵视", "灵视"],
  ["魔法日志", "实验日志"],
  ["魔法实验", "实验日志"],
  ["SCP", "档案"],
  ["拉斐尔", "天使与HGA"],
  ["米迦勒", "天使与HGA"],
  ["守护天使", "天使与HGA"],
  ["HGA", "天使与HGA"],
  ["主保圣人", "天使与HGA"],
  ["水星", "行星仪式"],
  ["金星", "行星仪式"],
  ["木星", "行星仪式"],
  ["太阳", "行星仪式"],
  ["仪式", "仪式记录"],
  ["召唤", "召唤记录"],
  ["恶魔", "灵体名录"],
  ["灵异", "叙事记录"],
];

function tagsOf(title) {
  const match = title.match(/^[【{\[]([^】}\]]+)[】}\]]/);
  if (match) return [match[1].trim()];
  if (MANUAL[title]) return [MANUAL[title]];
  for (const [keyword, tag] of KEYWORDS) {
    if (title.includes(keyword)) return [tag];
  }
  return [];
}

async function main() {
  const files = (await readdir(DIR)).filter(
    (f) => f.endsWith(".md") && f.startsWith("wx-"),
  );
  let updated = 0;
  for (const file of files) {
    const path = join(DIR, file);
    const raw = await readFile(path, "utf-8");
    const titleMatch = raw.match(/^title: "(.*)"$/m);
    if (!titleMatch) continue;
    const title = titleMatch[1].replace(/\\"/g, '"');
    const tags = tagsOf(title);
    const next = raw.replace(
      /^tags: \[.*\]$/m,
      `tags: [${tags.join(", ")}]`,
    );
    if (next !== raw) {
      await writeFile(path, next, "utf-8");
      updated++;
      console.log(`[标签] ${title} → ${tags.join(", ") || "（无）"}`);
    }
  }
  console.log(`\n完成：更新 ${updated} 篇。`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
