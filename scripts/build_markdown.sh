#!/usr/bin/env bash
# 拉远程问卷数据并跑 website-generator 生成 Markdown；generator/ 由调用方准备好
set -euo pipefail

export SITE_DIR="${SITE_DIR:-$(pwd)}"
export LOGURU_LEVEL="${LOGURU_LEVEL:-WARNING}"
export LOGURU_COLORIZE=False

pushd generator > /dev/null
wget https://github.com/CollegesChat/china-university-list/releases/latest/download/output.csv
wget https://github.com/CollegesChat/university-information/raw/refs/heads/v2/docs/README.md
cat output.csv >> ./required/colleges.csv
cat README.md >> ../content/_index.md
uv sync
uv run python main.py
popd > /dev/null
