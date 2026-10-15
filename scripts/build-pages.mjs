/**
 * 发布构建：以 GitHub Pages 模式执行 next build，产出 out/ 静态目录。
 *
 * 用 Node 脚本来设环境变量，是为了在 Windows / macOS / Linux 上都一致
 * —— bat 和 sh 设环境变量的语法不同，容易踩坑。
 *
 * 用法：npm run build:pages
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nextBin = path.join(projectRoot, "node_modules", "next", "dist", "bin", "next");

const result = spawnSync(process.execPath, [nextBin, "build"], {
  stdio: "inherit",
  cwd: projectRoot,
  env: {
    ...process.env,
    GITHUB_PAGES: "1", // 启用 /chaos-red-tide 子路径
    NEXT_EXPORT: "1", // 启用静态导出
    NEXT_PUBLIC_SITE_URL: "https://777dishonor.github.io/chaos-red-tide/",
  },
});

process.exit(result.status ?? 1);
