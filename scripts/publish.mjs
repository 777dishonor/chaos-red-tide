/**
 * 一键发布：把网站更新同步到线上。
 *
 * 依次做四件事：
 *   1. 构建「GitHub 版」网站（资源路径带 /chaos-red-tide 前缀）
 *   2. 把源码提交并推送到 GitHub 的 main 分支
 *   3. 把构建产物推送到 GitHub 的 gh-pages 分支（线上网站的真正内容）
 *   4. 再构建一份「国内版」（根路径），复制到国内镜像目录，等待发布
 *
 * 两种用法都一样：
 *   双击项目根目录的「一键发布.bat」
 *   或在项目目录执行  npm run publish
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(projectRoot, "out");

// ─── 可调参数 ────────────────────────────────────────────────
const REMOTE = "git@github.com:777dishonor/chaos-red-tide.git";
const SSH_KEY = "C:/Users/WH/.ssh/chaos_red_tide";
const SITE_URL = "https://777dishonor.github.io/chaos-red-tide/";
const MIRROR_DIR = "D:\\work Buddy space\\2026-10-13-19-14-32\\混沌赤潮-国内镜像";
const GIT_NAME = "777dishonor";
const GIT_EMAIL = "1072033329@qq.com";
// ─────────────────────────────────────────────────────────────

const env = {
  ...process.env,
  // 这台机器上有好几把 GitHub 密钥，必须显式指定本仓库专用的那一把，
  // 否则 git 会拿错钥匙，推送被拒。
  GIT_SSH_COMMAND: `ssh -i ${SSH_KEY} -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new`,
};

const TOTAL = 4;

function step(n, text) {
  console.log("");
  console.log(`[${n}/${TOTAL}] ${text}`);
  console.log("");
}

function run(cmd, args, options = {}) {
  const r = spawnSync(cmd, args, { stdio: "inherit", env, ...options });
  if (r.error) {
    console.log(`  执行 ${cmd} 出错：${r.error.message}`);
    return 1;
  }
  return r.status ?? 1;
}

function fail(message) {
  console.log("");
  console.log("==========================================");
  console.log("  [失败] " + message);
  console.log("  请把上面窗口里的文字截图发给助手。");
  console.log("==========================================");
  process.exit(1);
}

function countFiles(dir) {
  let n = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) n += countFiles(path.join(dir, entry.name));
    else n += 1;
  }
  return n;
}

const buildScript = path.join(projectRoot, "scripts", "build-pages.mjs");

console.log("==========================================");
console.log("   混沌赤潮 · 发布网站");
console.log("==========================================");

// ── 1. 构建 GitHub 版 ────────────────────────────────────────
step(1, "构建网站（约 1~3 分钟，窗口没动静是正常的，请耐心等）...");
if (run(process.execPath, [buildScript]) !== 0) {
  fail("构建出错。最常见的原因：本地预览窗口（start-site.bat）还开着，请关掉它再试一次。");
}
if (!fs.existsSync(path.join(outDir, "index.html"))) {
  fail("构建结束了，但没有生成 out/index.html。");
}

// ── 2. 提交并推送源码 ────────────────────────────────────────
step(2, "保存源码到 GitHub ...");
run("git", ["add", "-A"], { cwd: projectRoot });
const diff = spawnSync("git", ["diff", "--cached", "--quiet"], { cwd: projectRoot, env });
if (diff.status === 0) {
  console.log("（源码没有变化，跳过）");
} else {
  if (run("git", ["commit", "-m", "update content"], { cwd: projectRoot }) !== 0) {
    fail("提交源码失败。");
  }
  if (run("git", ["push", "origin", "main"], { cwd: projectRoot }) !== 0) {
    fail("推送源码到 GitHub 失败，通常是网络不通，过一会儿再双击一次即可。");
  }
}

// ── 3. 推送网站内容到 gh-pages 分支 ──────────────────────────
step(3, "上传网站到线上 ...");
const outGit = path.join(outDir, ".git");
if (fs.existsSync(outGit)) fs.rmSync(outGit, { recursive: true, force: true });

run("git", ["init", "-b", "gh-pages", "-q"], { cwd: outDir });
run("git", ["add", "-A"], { cwd: outDir });
if (
  run(
    "git",
    ["-c", `user.name=${GIT_NAME}`, "-c", `user.email=${GIT_EMAIL}`, "commit", "-q", "-m", "deploy"],
    { cwd: outDir },
  ) !== 0
) {
  fail("打包网站内容失败。");
}
run("git", ["remote", "add", "origin", REMOTE], { cwd: outDir });
if (run("git", ["push", "-f", "origin", "gh-pages"], { cwd: outDir }) !== 0) {
  fail("上传网站失败，通常是网络不通，过一会儿再双击一次即可。");
}

// ── 4. 准备国内版文件 ────────────────────────────────────────
step(4, "准备国内版文件 ...");
if (run(process.execPath, [buildScript, "--standalone"]) !== 0) {
  console.log("（国内版构建失败，不影响 GitHub 入口，可以稍后单独重试）");
} else {
  try {
    if (fs.existsSync(MIRROR_DIR)) fs.rmSync(MIRROR_DIR, { recursive: true, force: true });
    fs.mkdirSync(MIRROR_DIR, { recursive: true });
    fs.cpSync(outDir, MIRROR_DIR, {
      recursive: true,
      filter: (src) => path.basename(src) !== ".git",
    });
    console.log(`国内版文件已准备好：${countFiles(MIRROR_DIR)} 个文件。`);
  } catch (err) {
    console.log(`（复制国内版文件失败：${err.message}）`);
  }
}

// ── 完成 ─────────────────────────────────────────────────────
console.log("");
console.log("==========================================");
console.log("  [完成] GitHub 入口 1~2 分钟后自动更新：");
console.log(`      ${SITE_URL}`);
console.log("");
console.log("  国内入口还需要助手点一次「发布」才生效，");
console.log("  请跟助手说一句：网站更新好了，麻烦同步国内入口。");
console.log("==========================================");
console.log("");
console.log("  提示：手机上能看到更新前，浏览器可能要刷新一下");
console.log("        （或者把页面往下拉一拉强制刷新）。");
