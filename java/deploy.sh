#!/usr/bin/env bash
# deploy.sh —— 在【有外网的 macOS/Linux 机器】上运行，将当前目录前端推送到新建的私有 GitHub 仓库
#
# 前置：安装 git（https://git-scm.com）与 gh CLI（https://cli.github.com）
# 用法：
#   export GH_TOKEN="你的GitHub令牌(PAT)"
#   bash deploy.sh
# （若不设置环境变量，脚本会交互式提示你粘贴令牌）

set -e
REPO="java-enterprise-website"

if [ -z "${GH_TOKEN:-}" ]; then
  read -r -s -p "请输入 GitHub 令牌(PAT): " GH_TOKEN
  echo
fi

echo "$GH_TOKEN" | gh auth login --with-token

echo "正在创建私有仓库 $REPO ..."
gh repo create "$REPO" --private

USER=$(gh api user --jq .login)
echo "GitHub 账号: $USER"

cd "$(dirname "$0")"
[ -d .git ] || git init
git add .
git commit -m "init: 企业官网前端" || true
git branch -M main
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$USER/$REPO.git"
git push -u origin main

echo "完成：https://github.com/$USER/$REPO"
