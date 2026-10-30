# deploy.ps1 —— 在【有外网的 Windows 机器】上运行，将当前目录前端推送到新建的私有 GitHub 仓库
#
# 前置：
#   1) 安装 git      https://git-scm.com
#   2) 安装 gh CLI   https://cli.github.com
# 用法：
#   $env:GH_TOKEN = "你的GitHub令牌(PAT)"
#   然后在本文件所在目录执行：
#   powershell -ExecutionPolicy Bypass -File deploy.ps1
# （若不设置环境变量，脚本会交互式提示你粘贴令牌，令牌不会被写入任何文件）

$ErrorActionPreference = "Stop"
$repo = "java-enterprise-website"

$token = $env:GH_TOKEN
if (-not $token) { $token = Read-Host -Prompt "请输入 GitHub 令牌(PAT)" }

# 通过 gh 登录（令牌仅用于本次认证，不会写入 remote URL）
$token | gh auth login --with-token

Write-Host "正在创建私有仓库 $repo ..."
gh repo create $repo --private | Out-Null

$user = gh api user --jq .login
Write-Host "GitHub 账号: $user"

$root = $PSScriptRoot
Set-Location $root

if (-not (Test-Path .git)) { git init }
git add .
git commit -m "init: 企业官网前端" | Out-Null
git branch -M main
git remote remove origin 2>$null
git remote add origin "https://github.com/$user/$repo.git"
git push -u origin main

Write-Host "✅ 完成：https://github.com/$user/$repo"
