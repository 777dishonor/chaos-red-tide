#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""压缩 public/images 下的图片：统一转 WebP、长边限 1600、按内容选质量。

用法（在项目根目录下）：
    python scripts/images/optimize-images.py --dry-run    # 只看会做什么，不写文件
    python scripts/images/optimize-images.py              # 正式执行

设计要点：
  * 已经是 .webp 的文件默认跳过（避免反复压缩造成画质累积损失），加 --force 可强制。
  * 压缩后反而变大的文件保持原样（多为已压得很狠的小封面 JPEG）。
  * 动图（多帧 GIF）保持原样。
  * 含二维码的图片走 q95 且不缩放 —— 清单由 scan-qr.cjs 实测得出，见 qr-list.tsv。
  * 原图移动到备份目录（移动，不是删除），随时可还原。
"""
import argparse
import csv
import io
import os
import shutil
import sys
from PIL import Image, ImageOps, ImageStat

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
PUBLIC = os.path.join(ROOT, "public")
IMG_ROOT = os.path.join(PUBLIC, "images")
QR_LIST = os.path.join(HERE, "qr-list.tsv")
DEFAULT_BACKUP = os.path.join(os.path.dirname(ROOT), "_图片备份-混沌赤潮官网", "压缩前原图")

MAX_LONG = 1600
Q_PHOTO = 82       # 照片
Q_GRAPHIC = 92     # 图形 / 文字多的图
Q_QR = 95          # 含二维码
Q_POSTER = 95      # 竖长海报（高/宽 > 1.45）
POSTER_RATIO = 1.45
METHOD = 6
MIN_GAIN = 0.98    # 新文件必须至少小 2% 才替换
SKIP_DIRS = {os.path.join(IMG_ROOT, "qrcode")}

Image.MAX_IMAGE_PIXELS = None


def load_qr_set():
    s = set()
    if os.path.isfile(QR_LIST):
        with open(QR_LIST, "r", encoding="utf-8") as f:
            for line in f:
                p = line.rstrip("\n").split("\t")
                if len(p) >= 2 and p[1] == "OK":
                    rel = p[0]
                    if rel.startswith("public/"):
                        rel = rel[len("public/"):]
                    s.add(rel)
    return s


def classify(im):
    """graphic / photo —— 用缩放后的大面积同色比例与饱和度判断。"""
    try:
        small = im.convert("RGB").resize((64, 64))
        colors = small.getcolors(maxcolors=64 * 64) or []
        flat = sum(c for c, _ in colors if c >= 8) / (64 * 64)
        sat = ImageStat.Stat(small.convert("HSV")).mean[1]
    except Exception:  # noqa: BLE001
        return "photo", 0.0, 0.0
    return ("graphic" if (flat >= 0.30 or sat < 40) else "photo"), round(flat, 3), round(sat, 1)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="只报告，不写任何文件")
    ap.add_argument("--force", action="store_true", help="已是 webp 的也重新压")
    ap.add_argument("--backup-dir", default=DEFAULT_BACKUP, help="原图备份目录")
    ap.add_argument("--limit", type=int, default=0, help="只处理前 N 个（调试用）")
    args = ap.parse_args()

    qr_set = load_qr_set()
    print(f"含二维码图片清单: {len(qr_set)} 张（来自 {os.path.relpath(QR_LIST, ROOT)}）")

    targets = []
    for dirpath, dirnames, filenames in os.walk(IMG_ROOT):
        if dirpath in SKIP_DIRS:
            dirnames[:] = []
            continue
        for fn in sorted(filenames):
            p = os.path.join(dirpath, fn)
            targets.append(os.path.relpath(p, PUBLIC).replace("\\", "/"))
    targets.sort()
    if args.limit:
        targets = targets[:args.limit]

    print(f"待处理: {len(targets)} 个  {'（试运行，不会写文件）' if args.dry_run else ''}")
    print(f"参数: 长边上限 {MAX_LONG} / 照片 q{Q_PHOTO} / 图形 q{Q_GRAPHIC} / 二维码 q{Q_QR} / 海报 q{Q_POSTER}")

    results, skipped, errors = [], [], []
    for i, rel in enumerate(targets, 1):
        src = os.path.join(PUBLIC, rel.replace("/", os.sep))
        base_noext, ext = os.path.splitext(rel)
        ext_l = ext.lower()
        try:
            old_bytes = os.path.getsize(src)
        except OSError:
            errors.append((rel, "无法读取"))
            continue
        if ext_l == ".webp" and not args.force:
            skipped.append((rel, "已是 webp"))
            continue
        try:
            # 必须在 exif_transpose 之前读帧数 —— 它返回的新对象会丢掉多帧信息
            with Image.open(src) as probe:
                n_frames_probe = getattr(probe, "n_frames", 1)
            if n_frames_probe > 1:
                skipped.append((rel, f"动图 {n_frames_probe} 帧保持原样"))
                continue

            with Image.open(src) as im:
                im = ImageOps.exif_transpose(im)   # 先烘焙方向，之后可安全丢弃 EXIF
                if getattr(im, "n_frames", 1) > 1:  # 双保险
                    skipped.append((rel, "动图保持原样"))
                    continue
                if im.mode in ("P", "PA"):
                    im = im.convert("RGBA" if ("transparency" in im.info or im.mode == "PA") else "RGB")
                elif im.mode in ("CMYK", "YCbCr", "LAB", "I", "F", "1", "L", "LA"):
                    if im.mode not in ("L", "LA"):
                        im = im.convert("RGB")
                if im.mode not in ("RGB", "RGBA", "L", "LA"):
                    im = im.convert("RGB")

                kind, flat, sat = classify(im)
                is_qr = rel in qr_set
                w, h = im.size

                if is_qr:
                    q, kind = Q_QR, "qr"
                elif (not is_qr) and h / w > POSTER_RATIO and max(w, h) > 900:
                    q, kind = Q_POSTER, "poster"
                else:
                    q = Q_GRAPHIC if kind == "graphic" else Q_PHOTO

                resized = False
                if (not is_qr) and max(w, h) > MAX_LONG:
                    s = MAX_LONG / max(w, h)
                    im = im.resize((max(1, round(w * s)), max(1, round(h * s))), Image.LANCZOS)
                    resized = True

                buf = io.BytesIO()
                im.save(buf, format="WEBP", quality=q, method=METHOD)
                new_bytes, out_size = buf.tell(), im.size
        except Exception as e:  # noqa: BLE001
            errors.append((rel, f"{type(e).__name__}: {e}"))
            continue

        if new_bytes >= old_bytes * MIN_GAIN:
            skipped.append((rel, f"无收益 {old_bytes/1024:.0f}KB->{new_bytes/1024:.0f}KB"))
            continue

        new_rel = base_noext + ".webp"
        new_abs = os.path.join(PUBLIC, new_rel.replace("/", os.sep))
        if not args.dry_run:
            os.makedirs(os.path.dirname(new_abs), exist_ok=True)
            with open(new_abs, "wb") as f:
                f.write(buf.getvalue())
            if os.path.abspath(src) != os.path.abspath(new_abs):
                dest = os.path.join(args.backup_dir, rel.replace("/", os.sep))
                os.makedirs(os.path.dirname(dest), exist_ok=True)
                os.replace(src, dest)

        results.append(dict(old=rel, new=new_rel, old_bytes=old_bytes, new_bytes=new_bytes,
                            kind=kind, q=q, old_dim=f"{w}x{h}", new_dim=f"{out_size[0]}x{out_size[1]}",
                            resized=resized))
        if i % 50 == 0:
            print(f"  …{i}/{len(targets)}")

    o = sum(r["old_bytes"] for r in results)
    n = sum(r["new_bytes"] for r in results)
    print()
    print(f"已转换 {len(results)} 个：{o/1024/1024:.2f} MB → {n/1024/1024:.2f} MB"
          f"（{n/o*100:.1f}%，省 {(o-n)/1024/1024:.2f} MB）" if results else "没有任何文件需要转换")
    print(f"跳过 {len(skipped)} 个，失败 {len(errors)} 个")
    for rel, why in errors:
        print(f"   !! {rel}  {why}")

    if results and not args.dry_run:
        out_csv = os.path.join(args.backup_dir, "压缩对照清单.csv")
        os.makedirs(args.backup_dir, exist_ok=True)
        with open(out_csv, "w", encoding="utf-8-sig", newline="") as f:
            wtr = csv.writer(f)
            wtr.writerow(["原文件", "新文件", "原KB", "新KB", "占比", "类型", "质量", "原尺寸", "新尺寸", "缩放"])
            for r in results:
                wtr.writerow([r["old"], r["new"], f"{r['old_bytes']/1024:.1f}", f"{r['new_bytes']/1024:.1f}",
                              f"{r['new_bytes']/r['old_bytes']*100:.1f}%", r["kind"], r["q"],
                              r["old_dim"], r["new_dim"], "是" if r["resized"] else ""])
        print(f"清单: {out_csv}")

    if results:
        print()
        print("⚠️ 下一步必做：")
        print("   1) 把 .md/.tsx 里的图片扩展名同步改成 .webp")
        print("   2) python scripts/images/verify-image-refs.py")
        print("   3) 起本地服务实测图片 URL")


if __name__ == "__main__":
    main()
