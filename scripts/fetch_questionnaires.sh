#!/usr/bin/env bash
# 拉问卷定义到 data/；v1/v2.yaml 不进版本控制，构建与本地预览都要现拉
set -euo pipefail

mkdir -p data
curl -L -o ./data/v1.yaml https://raw.githubusercontent.com/CollegesChat/questionnaire/refs/heads/main/v1.yaml
curl -L -o ./data/v2.yaml https://raw.githubusercontent.com/CollegesChat/questionnaire/refs/heads/main/v2.yaml
