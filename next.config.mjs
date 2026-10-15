/**
 * 站点实际发布地址：https://777dishonor.github.io/chaos-red-tide/
 *
 * 两个独立开关（分开的原因见下）：
 *   GITHUB_PAGES=1  → 启用 /chaos-red-tide 子路径（dev 和 build 都可以用）
 *   NEXT_EXPORT=1   → 启用 output: 'export' 静态导出（只有正式构建才用）
 *
 * 为什么静态导出要单独做成开关：
 *   Next 的 output: 'export' 与 dev 模式在动态路由（[slug]）上不兼容 ——
 *   开着它执行 npm run dev，文章页会直接报 500。
 *   所以本地开发要能单独验证子路径，又不受静态导出干扰。
 *
 * 为什么用布尔开关而不是直接读路径值：
 *   Windows 的 Git Bash 会把以 / 开头的环境变量值当成 Unix 路径，
 *   自动改写成 D:/... ，导致构建失败。
 *
 * 本地预览（带子路径、不带静态导出）：
 *   GITHUB_PAGES=1 npm run dev
 */
const GH_PAGES_BASE_PATH = "/chaos-red-tide";
const useBasePath = process.env.GITHUB_PAGES === "1";
const useExport = process.env.NEXT_EXPORT === "1";

const basePath = useBasePath ? GH_PAGES_BASE_PATH : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 正式构建时静态导出，产出 out/ 目录（GitHub Pages 用）
  ...(useExport ? { output: "export" } : {}),

  // 部署在子路径时必须设置，否则 CSS/JS/图片会全部 404
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,

  // 注入给代码使用（lib/asset.ts 用它给图片拼前缀）。
  // 值可能是空字符串，不能依赖 `??` 兜底，所以单独走 env 字段。
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },

  // 导出为目录式路由（/archive/xxx/index.html），保证直接输入网址也能命中
  trailingSlash: true,

  // 静态导出没有图片优化服务，图片按原样输出
  images: { unoptimized: true },
};

export default nextConfig;
