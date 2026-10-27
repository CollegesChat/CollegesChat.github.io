#!/usr/bin/env bash
# 首页正文来自 upstream README：CI 里由 build_markdown.sh cat 进 content/_index.md，
# 本地预览不跑 generator，得自己拉。先截回 front matter 再追加，重复跑不会堆内容
set -euo pipefail

here=$(cd -- "$(dirname -- "$0")" && pwd)
index="${here}/../content/_index.md"

readme=$(mktemp)
merged=$(mktemp)
trap 'rm -f "${readme}" "${merged}"' EXIT

curl -fsSL -o "${readme}" \
  https://github.com/CollegesChat/university-information/raw/refs/heads/v2/docs/README.md

# 保留 front matter（首行到第二个 "---"），丢掉之前追加过的正文
awk 'NR == 1 { print; if ($0 == "---") in_fm = 1; next } in_fm { print; if ($0 == "---") exit }' \
  "${index}" > "${merged}"
cat "${readme}" >> "${merged}"
cat "${merged}" > "${index}"
