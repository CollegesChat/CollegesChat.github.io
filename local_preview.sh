#!/usr/bin/env bash
# 本地预览：--renderToMemory 只渲染到内存，不写盘
# 站点 8000+ 页，落盘的 I/O 比渲染本身还慢，开这个能省掉一大截
set -euo pipefail

cd -- "$(dirname -- "${BASH_SOURCE[0]}")"

# 省份页缺 url 时 36 个省会全压到 /universities/ 互相覆盖；脚本幂等，随手补一次
python3 scripts/assign_province_urls.py
scripts/fetch_questionnaires.sh
# 走环境变量而不是 sed，这样本地预览不会改动 hugo.yaml
export HUGO_COPYRIGHT="$(scripts/copyright_line.sh)"
exec hugo server --renderToMemory
