#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""图片引用双向校验：被引用的必须存在，public 下的必须都被引用。

用法（项目根目录）：
    python scripts/images/verify-image-refs.py

退出码：0 = 通过；1 = 有问题。
"""
import os
import re
import sys
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
PUBLIC = os.path.join(ROOT, "public")
IMG_ROOT = os.path.join(PUBLIC, "images")

# 严格正则：ASCII 路径段 + 必须以图片扩展名结尾。
# 注意不要用 [\w...] —— Python 的 \w 包含中文，会把后面的正文一起吞掉。
PAT = re.compile(
    r"(?:https?://[^\s\"'<>()]+)?(?:/)?images/[A-Za-z0-9_\-./%]+\.(?:png|jpe?g|gif|webp|bmp|avif|svg)",
    re.IGNORECASE,
)
SRC_DIRS = ["content", "app", "components", "lib", "scripts", "types"]
TEXT_EXT = {".md", ".mdx", ".tsx", ".ts", ".js", ".jsx", ".mjs", ".cjs", ".json", ".css"}
# 文档里的占位示例，不算断链
ALLOW_MISSING = {"images/articles/article-slug/cover.jpg"}


def main():
    actual = {}
    for dirpath, _d, filenames in os.walk(IMG_ROOT):
        for fn in filenames:
            p = os.path.join(dirpath, fn)
            actual[os.path.relpath(p, PUBLIC).replace("\\", "/")] = os.path.getsize(p)

    refs = defaultdict(list)
    for sd in SRC_DIRS:
        base = os.path.join(ROOT, sd)
        if not os.path.isdir(base):
            continue
        for dirpath, dirnames, filenames in os.walk(base):
            dirnames[:] = [d for d in dirnames if d not in ("node_modules", ".next")]
            for fn in filenames:
                if os.path.splitext(fn)[1].lower() not in TEXT_EXT:
                    continue
                tf = os.path.join(dirpath, fn)
                src = os.path.relpath(tf, ROOT).replace("\\", "/")
                try:
                    with open(tf, "r", encoding="utf-8", errors="ignore") as f:
                        for lineno, line in enumerate(f, 1):
                            for m in PAT.finditer(line):
                                raw = m.group(0)
                                k = raw.find("images/")
                                from urllib.parse import unquote
                                refs[unquote(raw[k:])].append(f"{src}:{lineno}")
                except OSError:
                    pass

    broken = {r: v for r, v in refs.items() if r not in actual and r not in ALLOW_MISSING}
    orphan = {}
    for r, s in actual.items():
        if r in refs:
            continue
        if any(c.lower() == r.lower() for c in refs):
            continue
        orphan[r] = s

    used_bytes = sum(actual[r] for r in refs if r in actual)
    print(f"public/images: {len(actual)} 个文件, {sum(actual.values())/1024/1024:.2f} MB")
    print(f"引用: {len(refs)} 条  其中存在于磁盘 {len([r for r in refs if r in actual])} 条")
    print()

    code = 0
    if broken:
        code = 1
        print(f"❌ 断链 {len(broken)} 条（被引用但磁盘上没有）")
        for r, v in sorted(broken.items()):
            print(f"   {r}")
            for s in v[:3]:
                print(f"      ← {s}")
    else:
        print("✅ 无断链")

    if orphan:
        code = 1
        print()
        print(f"❌ 孤儿图 {len(orphan)} 个（在 public 里但没人引用，会白白被打包上传）")
        for r, s in sorted(orphan.items(), key=lambda x: -x[1])[:40]:
            print(f"   {r}  {s/1024:.0f}KB")
        print("   处理：移出 public（用 mv，不要直接删）")
    else:
        print("✅ 无孤儿图")

    print()
    print(f"当前体积: {sum(actual.values())/1024/1024:.2f} MB")
    return code


if __name__ == "__main__":
    sys.exit(main())
