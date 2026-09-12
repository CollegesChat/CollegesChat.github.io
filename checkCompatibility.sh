#!/bin/bash
# 設定：遇到錯誤立即停止，且管線錯誤會回傳到腳本層級
set -eo pipefail

# CSS 檢查
find public -type f -name '*.css' -print0 | \
xargs -0 npx doiuse \
--browsers "Chrome >= 112, Firefox >= 117, iOS >= 16.5" \
--quiet > /dev/null

# JS 檢查
find public -type f \( -name '*.js' -o -name '*.mjs' -o -name '*.cjs' \) \
-exec npx esbuild {} \
--target=chrome112,firefox117,safari16.5 \
--format=esm \
--bundle=false \
--log-level=error \
\; > /dev/null

echo "所有檢查皆已通過。"