#!/usr/bin/env python3
"""给每个省 section 写入独立 url 与 title。

content/docs/universities/_index.md 的 cascade `url: /universities/:slug/` 会压平层级，
省目录没有 slug，于是 36 个省全部输出到 /universities/index.html 互相覆盖。
各省需要一个独立网址来放同省学校列表的 index.json。

不能用 hugo.yaml 解决：content 的 cascade 是较近的祖先，优先于站点级 cascade 和 permalinks。
要去掉这一步得改上游 website-generator，让它生成省 _index.md 时就带上 url。

    python3 scripts/assign_province_urls.py [站点根目录]
"""

import re
import sys
from pathlib import Path

TARGETS = (
    ('content/docs/universities', '/universities'),
    ('content/docs/archived/universities', '/archived/universities'),
)

FRONT_MATTER = re.compile(r'\A---\n(.*?)\n---', re.S)
OWNED = re.compile(r'(?m)^[ \t]*(?:url|title):.*\n')


def assign(index, url, title):
    text = index.read_text(encoding='utf-8') if index.exists() else ''
    m = FRONT_MATTER.match(text)
    fm, rest = (m[1], text[m.end():]) if m else ('', text)
    # 重写 url/title 而不是追加，保证重复执行不会越跑越长
    kept = OWNED.sub('', fm).strip('\n')
    head = f'url: {url}\ntitle: {title}\n' + (kept + '\n' if kept else '')
    # rest 自带换行，'---' 后有无尾随换行取决于上游生成器
    index.write_text(f'---\n{head}---{rest}', encoding='utf-8')


root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent

total = 0
for rel, prefix in TARGETS:
    base = root / rel
    if not base.is_dir():
        continue
    for province in sorted(p for p in base.iterdir() if p.is_dir()):
        assign(province / '_index.md', f'{prefix}/{province.name}/', province.name)
        total += 1

print(f'Assigned urls for {total} province sections under {root}')
