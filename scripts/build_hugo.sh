#!/usr/bin/env bash
# 拉问卷定义、编译到 public/，并删掉用不到的静态资源
set -euo pipefail

scripts/fetch_questionnaires.sh

# Cloudflare 会给 CF_PAGES_URL，用它覆盖 baseURL；GitHub Pages 没有，走配置里的默认值
if [[ -n "${CF_PAGES_URL:-}" ]]; then
  echo "Found CF_PAGES_URL: ${CF_PAGES_URL}, overriding Hugo baseURL."
  hugo build --gc --minify -d public -b "${CF_PAGES_URL}"
else
  echo "CF_PAGES_URL not set, using default baseURL from config file."
  hugo build --gc --minify -d public
fi

echo "Cleaning up output folder..."
pushd public > /dev/null
rm -rf asciinema katex
rm -f mermaid.min.js
popd > /dev/null
