#!/usr/bin/env bash
# 输出页脚 title 文案：v1/v2 答卷 CSV 各自的最后一次提交时间（UTC+8）
set -euo pipefail

API=https://api.github.com/repos/CollegesChat/university-information/commits

last_commit() {
  local ts
  # 取 commit.committer.date（等同 git log -1 --format=%ci），作者时间会被 rebase 改掉
  ts=$(curl -fsS "${API}?path=datas/$1&sha=v2&per_page=1" |
    sed -n '/"committer": {/,/}/s/.*"date": *"\([^"]*\)".*/\1/p' | head -1)
  TZ=Asia/Shanghai date -d "${ts}" +'%Y-%m-%d %H:%M:%S'
}

printf '数据最后提交 v1: %s / v2: %s (UTC+8)\n' \
  "$(last_commit v1.csv)" "$(last_commit v2.csv)"
