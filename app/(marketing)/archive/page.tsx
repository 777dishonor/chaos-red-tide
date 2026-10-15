import type { Metadata } from "next";

import { ArchiveBrowser } from "@/components/archive-browser";
import {
  ARTICLE_CATEGORIES,
  articlesInCategory,
  getAllArticles,
} from "@/lib/articles";

export const metadata: Metadata = {
  title: "文存",
  description:
    "混沌赤潮的全部归档篇目：可按方向筛选，或直接检索标题、摘要与标签。",
};

export default function ArchivePage() {
  const articles = getAllArticles();
  const categories = ARTICLE_CATEGORIES.map((category) => ({
    key: category.key,
    label: category.label,
    description: category.description,
    tags: category.tags,
    count: articlesInCategory(articles, category).length,
  }));

  return (
    <section className="container max-w-5xl py-14 sm:py-20">
      <p className="eyebrow">Archive · 文存</p>
      <h1 className="mt-5 font-display text-4xl font-medium tracking-wide text-parchment sm:text-5xl">
        文存
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-loose text-parchment/80">
        全部归档篇目，按年代倒序排列。可以按方向筛选，也可以直接检索标题、摘要与标签。
      </p>

      <ArchiveBrowser articles={articles} categories={categories} />
    </section>
  );
}
