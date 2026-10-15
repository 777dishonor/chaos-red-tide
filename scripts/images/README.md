# 图片处理工具

三个脚本，处理 `public/images/` 下的图片。**只在有新增文章或新增图片时才需要跑。**

按顺序使用：

## 1. `scan-qr.cjs` —— 找出哪些图含二维码

含二维码的图必须单独提高质量并禁止缩放，否则码扫不出来。**这一步不能靠肉眼判断**，要用程序扫。

```bash
npm --prefix "C:/Users/WH/.workbuddy/binaries/node/workspace" install sharp jsqr   # 只需装一次
NODE_PATH="C:/Users/WH/.workbuddy/binaries/node/workspace/node_modules" \
  node scripts/images/scan-qr.cjs
```

输出 `qr-list.tsv`，就是二维码清单。

## 2. `optimize-images.py` —— 压缩

```bash
python scripts/images/optimize-images.py --dry-run   # 先看会做什么，不写文件
python scripts/images/optimize-images.py             # 正式执行
```

做的事：

| 内容 | 处理 |
|---|---|
| 照片 | 转 WebP q82，长边超 1600 则缩小 |
| 图形 / 文字多的图 | 转 WebP q92 |
| 竖长海报（高/宽 > 1.45） | 转 WebP q95 —— 这类图常有密集小字 |
| 含二维码（按 `qr-list.tsv`） | 转 WebP q95，**且不缩放** |
| 动图 GIF | 保持原样 |
| 压缩后反而变大的 | 保持原样 |
| 已经是 `.webp` 的 | 跳过（加 `--force` 可强制重压） |

原图会**移动**到 `../_图片备份-混沌赤潮官网/压缩前原图/`（不是删除），随时能还原。
同时生成 `压缩对照清单.csv` 记录每一张的前后体积。

**压缩完必须做一件事**：把 `.md` / `.tsx` 里引用的扩展名从 `.png`/`.jpg` 改成 `.webp`。
（脚本不自动改引用，因为需要你确认改哪些文件。）

## 3. `verify-image-refs.py` —— 校验

```bash
python scripts/images/verify-image-refs.py
```

双向检查：

- **断链**：文章引用了但磁盘上没有 → 页面上会出现破图
- **孤儿图**：在 `public/` 里但没人引用 → 部署时会白白打包上传

两个都应该是 0。有孤儿图就用 `mv` 把它移出 `public/`（**不要删**）。

## 最后

起本地服务，实测图片 URL 都能返回 200：

```bash
npm run dev -- -p 3210
```

然后打开首页、随便点进一篇文章、再点开文存，确认图片正常显示、没有破图。
