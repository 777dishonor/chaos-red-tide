/**
 * 发布构建：产出 out/ 静态目录。
 *
 * 用法：
 *   npm run build:pages              发布到 GitHub Pages 用，资源路径带 /chaos-red-tide 前缀
 *   npm run build:standalone         独立域名/子域用，资源路径为根路径 /
 *
 * 用 Node 脚本来设环境变量，是为了在 Windows / macOS / Linux 上都一致
 * —— bat 和 sh 设环境变量的语法不同，容易踩坑。
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nextBin = path.join(projectRoot, "node_modules", "next", "dist", "bin", "next");

// 默认走 GitHub Pages 模式；传 --standalone 则构建根路径版本
const standalone = process.argv.includes("--standalone");
const basePath = standalone ? "" : "/chaos-red-tide";

const result = spawnSync(process.execPath, [nextBin, "build"], {
  stdio: "inherit",
  cwd: projectRoot,
  env: {
    ...process.env,
    GITHUB_PAGES: standalone ? "0" : "1", // 控制资源路径前缀
    NEXT_EXPORT: "1", // 启用静态导出
    NEXT_PUBLIC_SITE_URL: `https://777dishonor.github.io${basePath}/`,
  },
});

process.exit(result.status ?? 1);
