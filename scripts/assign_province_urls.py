#!/usr/bin/env python3
"""给每个省 section 写入独立 url 与 title。

content/docs/universities/_index.md 的 cascade `url: /universities/:slug/` 会压平层级，
省目录没有 slug，于是 36 个省全部输出到 /universities/index.html 互相覆盖。
各省需要一个独立网址来放同省学校列表的 index.json。

不能用 hugo.yaml 解决：content 的 cascade 是较近的祖先，优先于站点级 cascade 和 permalinks。
要去掉这一步得改上游 website-generator，让它生成省 _index.md 时就带上 url。

    python3 scripts/assign_province_urls.py [站点根目录]
"""

import pathlib
import re
import sys

TARGETS = (
    ("content/docs/universities", "/universities"),
    ("content/docs/archived/universities", "/archived/universities"),
)


def split_front_matter(text):
    if not text.startswith("---"):
        return "", text
    end = text.find("\n---", 3)
    return ("", text) if end == -1 else (text[3 : end + 1], text[end + 4 :])


def build_front_matter(url, title, front_matter):
    # 压掉首尾空行，保证重复执行不会越跑越多空行
    kept = re.sub(r"(?m)^[ \t]*(url|title):.*\n", "", front_matter).strip("\n")
    return f"url: {url}\ntitle: {title}\n{kept}\n" if kept else f"url: {url}\ntitle: {title}\n"


def assign(root):
    total = 0
    for rel, prefix in TARGETS:
        base = root / rel
        if not base.is_dir():
            continue
        for province in sorted(p for p in base.iterdir() if p.is_dir()):
            index = province / "_index.md"
            text = index.read_text(encoding="utf-8") if index.exists() else ""
            front_matter, rest = split_front_matter(text)
            fm = build_front_matter(f"{prefix}/{province.name}/", province.name, front_matter)
            index.write_text(f"---\n{fm}---{rest}", encoding="utf-8")
            total += 1
    return total


def main():
    here = pathlib.Path(__file__).resolve().parent
    root = pathlib.Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else here.parent
    print(f"Assigned urls for {assign(root)} province sections under {root}")


if __name__ == "__main__":
    main()
