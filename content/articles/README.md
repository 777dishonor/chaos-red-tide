# 文存（content/articles）

每篇文章一个 `<slug>.md` 文件，采用 Markdown + frontmatter 格式：

```markdown
---
title: "文章标题"
slug: "article-slug"
date: "2026-08-01"
tags: [标签一, 标签二]
cover: "/images/articles/article-slug/cover.jpg"   # 可选
source: "微信公众号「混沌赤潮」"                      # 可选
sourceUrl: "https://mp.weixin.qq.com/s/xxx"         # 可选
excerpt: "摘要，留空则自动取正文首行"                # 可选
---

正文 Markdown…
```

## 从微信公众号导入

### 方式一：链接清单（推荐）

把文章链接逐行粘贴到 `content/wechat-links.txt`，然后运行：

```bash
npm run import:wechat
```

脚本会抓取正文、清洗公众号样式、下载图片到 `public/images/articles/<slug>/`，
并自动生成文章文件。已存在的文章会自动跳过，可重复运行。

### 方式二：HTML 文件

如果有浏览器插件批量导出的 HTML 文件，放入一个文件夹后运行：

```bash
npm run import:wechat -- --html <文件夹路径>
```

### 手动编写

直接在此目录新建 Markdown 文件即可，刷新页面立刻生效。
