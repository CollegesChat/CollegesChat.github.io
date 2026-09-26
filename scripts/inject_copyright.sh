#!/usr/bin/env bash
# CI 用：把 copyright 文案写进 hugo.yaml
# 本地预览别跑这个，改用 HUGO_COPYRIGHT 环境变量（见 local_preview.sh），免得改脏 hugo.yaml
set -euo pipefail

here=$(cd -- "$(dirname -- "$0")" && pwd)
copyright=$("${here}/copyright_line.sh")

sed -i "s#copyright: \"\$copyright\"#copyright: \"${copyright}\"#g" hugo.yaml
