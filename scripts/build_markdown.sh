#!/usr/bin/env bash
# 拉远程问卷数据并跑 website-generator 生成 Markdown；generator/ 由调用方准备好
set -euo pipefail

export SITE_DIR="${SITE_DIR:-$(pwd)}"
export LOGURU_LEVEL="${LOGURU_LEVEL:-WARNING}"
export LOGURU_COLORIZE=False
here=$(cd -- "$(dirname -- "$0")" && pwd)

pushd generator > /dev/null
# -O: wget 默认另存为 *.1 而非覆盖
wget https://github.com/CollegesChat/china-university-list/releases/latest/download/output.csv
"${here}/fetch_home_readme.sh"
cat output.csv >> ./required/colleges.csv
uv sync
uv run python main.py
popd > /dev/null
