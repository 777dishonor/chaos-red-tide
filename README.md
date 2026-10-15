# 混沌赤潮 · 官网

Dark Academia / Minimal Esoteric 风格的社团官网：课程售卖（LMS）+ 物品与数字产品电商。

- 框架：Next.js 14（App Router、TypeScript）
- 样式：Tailwind CSS + shadcn/ui
- 数据库：Prisma（草案见 `prisma/schema.prisma`，Phase 1 启用）
- 认证：NextAuth（v4，Credentials，预留 Prisma Adapter 接入点）
- 支付：Stripe Checkout + Webhook

## 快速开始

```bash
npm install
cp .env.example .env   # 按需填写环境变量
npm run dev            # http://localhost:3000
```

> 当前阶段为“可运行的骨架”：页面可浏览、主题已生效；数据库、真实登录与支付在 Phase 1–3 接入。

## 公众号文章导入（文存）

个人订阅号没有官方批量接口，推荐用“链接清单”方式：

1. 在微信里打开历史文章，复制链接，逐行粘贴到 `content/wechat-links.txt`（一次性操作）；
2. 运行 `npm run import:wechat`；
3. 脚本自动抓取正文、清洗公众号样式、下载图片，并生成 `content/articles/<slug>.md`；
4. 刷新 http://localhost:3000/archive 即可看到文章。

也支持导入 HTML 文件：`npm run import:wechat -- --html <文件夹路径>`。
详见 `content/articles/README.md`。

## 目录结构

```
混沌赤潮官网/
├── app/                                    # App Router 路由层
│   ├── (marketing)/                        # 营销内容区（共享 Header/Footer 外壳）
│   │   ├── layout.tsx                      # ✅ 站点外壳
│   │   ├── page.tsx                        # ✅ 首页：宣言 / 最新研讨 / 精选器物 / 会员入口
│   │   ├── about/page.tsx                  # ✅ 社团介绍与研究方向
│   │   ├── archive/page.tsx                # ✅ 文存（文章专栏列表）
│   │   ├── archive/[slug]/page.tsx         # ✅ 文章详情（Markdown 渲染）
│   │   ├── courses/page.tsx                # ✅ 课程中心（列表占位）
│   │   ├── courses/[slug]/page.tsx         # 课程详情：大纲 / 试读 / 购买（待建）
│   │   ├── shop/page.tsx                   # ✅ 工坊商店（列表占位）
│   │   ├── shop/[slug]/page.tsx            # 商品详情（待建）
│   │   └── login/page.tsx                  # ✅ 登录页（表单占位）
│   ├── learn/                              # 已购学习界面（会员专区，待建）
│   │   └── [course]/[lesson]/page.tsx
│   ├── checkout/                           # 结算页 / 支付结果页（待建）
│   │   ├── page.tsx
│   │   └── success/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts     # ✅ NextAuth 认证入口
│   │   ├── checkout/route.ts               # ✅ 创建 Stripe Checkout 会话
│   │   └── webhooks/stripe/route.ts        # ✅ 支付成功后的订单履约入口
│   ├── layout.tsx                          # ✅ 根布局：字体 / 元数据 / 主题
│   └── globals.css                         # ✅ 全局样式与设计令牌
├── components/
│   ├── layout/                             # ✅ Header / Footer
│   ├── ui/                                 # shadcn/ui 组件（npx shadcn@latest add ...）
│   ├── courses/                            # 课程卡片 / 大纲 / 播放器（待建）
│   └── shop/                               # 商品卡片 / 购物车抽屉（待建）
├── content/
│   ├── articles/                           # ✅ 文章 Markdown（frontmatter + 正文）
│   └── wechat-links.txt                    # ✅ 公众号文章链接清单（每行一个）
├── lib/
│   ├── utils.ts                            # ✅ cn() 类名合并
│   ├── auth.ts                             # ✅ NextAuth 配置
│   ├── stripe.ts                           # ✅ Stripe 客户端（惰性单例）
│   ├── articles.ts                         # ✅ 文章读取层（列表 / 详情）
│   ├── prisma.ts                           # Prisma 单例（Phase 1 启用）
│   └── pricing.ts                          # 会员折扣计算（待建）
├── prisma/
│   └── schema.prisma                       # ✅ v1 数据模型草案
├── scripts/
│   ├── import-wechat.mjs                   # ✅ 公众号文章导入脚本
│   └── fixtures/                           # ✅ 导入管线测试样例
├── public/
│   └── images/articles/                    # 导入文章时下载的图片
│   └── fonts/                              # 本地字体（New Roma 等，授权字体不入库）
├── types/
│   └── next-auth.d.ts                      # ✅ Session 会员字段类型扩展
├── .env.example                            # ✅ 环境变量模板
├── components.json                         # ✅ shadcn/ui 配置
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.js                      # ✅ 主题：颜色 / 字体 / 动效
└── tsconfig.json
```

## 设计令牌

| 令牌 | 色值 | 用途 |
| --- | --- | --- |
| `ink-950` | `#0D0D0F` | 页面底色，深邃墨黑 |
| `ink-800/700` | `#1A1A20` / `#23232B` | 卡片、滚动条等次级表面 |
| `brass` | `#D4AF37` | 主点缀：标题强调、按钮、边框 |
| `brass-500` | `#C5A059` | 次级黄铜：正文内的小强调 |
| `parchment` | `#EAE4D5` | 正文主文字，暖纸白 |
| `oxblood` | `#6B1F2A` | 极少量使用的深酒红（特惠 / 专属标识） |

字体体系：

- 标题：`font-display` → Cormorant Garamond（斜体用于强调），中文回退宋体系（Noto Serif SC / 思源宋体 / 宋体）。
- 正文：`font-sans` → Inter，中文回退黑体系（Noto Sans SC / 思源黑体 / 苹方）。
- 替换为 New Roma：将字体放入 `public/fonts/`，用 `next/font/local` 加载并保持 `variable: "--font-display"`，全站自动切换，无需改动样式。

## 路线图

- **Phase 0（当前）**：脚手架 + 主题系统 + 首页骨架，可 `npm run dev` 预览。
- **Phase 1**：启用 Prisma（`npm i @prisma/client` → `prisma migrate dev`），接入邮箱 + 密码登录与会员等级。
- **Phase 2**：课程与商品的数据驱动页面（列表 / 详情 / 购物车），接入 shadcn 组件库。
- **Phase 3**：Stripe Checkout 与 Webhook 履约（订单 → 课程权限 / 库存），实现会员折扣。
- **Phase 4**：已购用户的视频 / 文档学习界面与发货状态管理。
