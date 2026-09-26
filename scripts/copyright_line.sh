#!/usr/bin/env bash
# 输出页脚 copyright 文案：显示构建时间，title 提示 v1/v2 答卷 CSV 的最后提交时间
# 只输出、不改任何文件；CI 用 sed 写进 hugo.yaml，本地预览用 HUGO_COPYRIGHT 覆盖
set -euo pipefail

here=$(cd -- "$(dirname -- "$0")" && pwd)
build_time=$(TZ='Asia/Shanghai' date +'%Y-%m-%d %H:%M:%S')
data_title=$("${here}/csv_last_commits.sh")

printf "<a href='https://creativecommons.org/licenses/by-nc-sa/4.0/' target='_blank' rel='noopener'>CC BY-NC-SA 4.0</a> | <span title='%s'>Generated on %s (UTC+8)</span>\n" \
  "${data_title}" "${build_time}"
