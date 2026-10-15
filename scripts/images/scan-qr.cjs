// 用 sharp + jsQR 实测 public/images 下哪些图含二维码，输出 qr-list.tsv。
//
// 依赖（装在项目外，只给这个脚本用）：
//   npm --prefix "C:/Users/WH/.workbuddy/binaries/node/workspace" install sharp jsqr
//
// 用法：
//   NODE_PATH="C:/Users/WH/.workbuddy/binaries/node/workspace/node_modules" \
//     node scripts/images/scan-qr.cjs
//
// 输出格式（TSV）：public 相对路径 \t OK|NONE|ERR \t 解码内容 \t 二维码位置x0,y0,x1,y1
// optimize-images.py 会读这份清单，把命中的图按 q95 且不缩放处理。

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const jsQR = require("jsqr");

const HERE = __dirname;
const ROOT = path.dirname(path.dirname(HERE));
const IMG_ROOT = path.join(ROOT, "public", "images");
const OUT = path.join(HERE, "qr-list.tsv");

function walk(d, acc) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.(png|jpe?g|webp|gif|bmp|tiff?)$/i.test(e.name)) acc.push(p);
  }
  return acc;
}

const list = walk(IMG_ROOT, []);
console.log("待扫描: " + list.length + " 张");

(async () => {
  const lines = [];
  let ok = 0, err = 0;
  for (let i = 0; i < list.length; i++) {
    const f = list[i];
    const rel = path.relative(path.join(ROOT, "public"), f).replace(/\\/g, "/");
    try {
      const { data, info } = await sharp(f, { animated: false })
        .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const r = jsQR(new Uint8ClampedArray(data), info.width, info.height, {
        inversionAttempts: "attemptBoth",
      });
      if (r && r.data) {
        ok++;
        const L = r.location || {};
        const pts = [L.topLeftCorner, L.topRightCorner, L.bottomLeftCorner, L.bottomRightCorner].filter(Boolean);
        const box = pts.length
          ? [
              Math.round(Math.min(...pts.map((p) => p.x))), Math.round(Math.min(...pts.map((p) => p.y))),
              Math.round(Math.max(...pts.map((p) => p.x))), Math.round(Math.max(...pts.map((p) => p.y))),
            ].join(",")
          : "";
        lines.push([rel, "OK", String(r.data).replace(/[\t\n]/g, " ").slice(0, 200), box].join("\t"));
      } else {
        lines.push([rel, "NONE", info.width + "x" + info.height, ""].join("\t"));
      }
    } catch (e) {
      err++;
      lines.push([rel, "ERR", e.message.replace(/[\t\n]/g, " "), ""].join("\t"));
    }
    if (i % 50 === 0) process.stdout.write(`\r  ${i}/${list.length}  QR=${ok}  ERR=${err}   `);
  }
  process.stdout.write("\n");
  fs.writeFileSync(OUT, lines.join("\n"), "utf8");
  console.log(`扫描完成：${list.length} 张，含二维码 ${ok} 张，失败 ${err} 张`);
  console.log("输出: " + OUT);
})();
