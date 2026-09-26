#!/usr/bin/env bash
# 把构建时间与数据最后提交时间写进 hugo.yaml 的 copyright
# 页脚显示构建时间，title 提示 v1/v2 答卷 CSV 各自的最后提交时间
set -euo pipefail

here=$(cd -- "$(dirname -- "$0")" && pwd)
build_time=$(TZ='Asia/Shanghai' date +'%Y-%m-%d %H:%M:%S')
data_title=$("${here}/csv_last_commits.sh")
copyright="<a href='https://creativecommons.org/licenses/by-nc-sa/4.0/' target='_blank' rel='noopener'>CC BY-NC-SA 4.0</a> | <span title='${data_title}'>Generated on ${build_time} (UTC+8)</span>"

sed -i "s#copyright: \"\$copyright\"#copyright: \"${copyright}\"#g" hugo.yaml
