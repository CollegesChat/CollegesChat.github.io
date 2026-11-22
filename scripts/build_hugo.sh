#!/usr/bin/env bash
# 拉问卷定义、编译到 public/，并删掉用不到的静态资源
set -euo pipefail

scripts/fetch_questionnaires.sh

# 安装 PostCSS 依赖，供 Hugo css.PostCSS 转译现代 CSS（嵌套、color-mix 等）
if [ ! -d node_modules ]; then
  echo "Installing npm dependencies..."
  npm ci
fi
export PATH="$(pwd)/node_modules/.bin:${PATH}"

# Cloudflare 会给 CF_PAGES_URL，用它覆盖 baseURL；GitHub Pages 没有，走配置里的默认值
hugo_args=(build --gc --minify -d public)
if [[ -n "${CF_PAGES_URL:-}" ]]; then
  echo "Found CF_PAGES_URL: ${CF_PAGES_URL}, overriding Hugo baseURL."
  hugo_args+=(-b "${CF_PAGES_URL}")
else
  echo "CF_PAGES_URL not set, using default baseURL from config file."
fi

# 页脚 copyright 用 Hugo 原生环境变量覆盖，不用 sed 改 hugo.yaml
HUGO_COPYRIGHT="$(scripts/copyright_line.sh)" hugo "${hugo_args[@]}"

echo "Cleaning up output folder..."
rm -rf public/asciinema public/katex
rm -f public/mermaid.min.js
