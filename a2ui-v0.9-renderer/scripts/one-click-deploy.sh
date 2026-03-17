#!/usr/bin/env bash
set -euo pipefail

# 一键部署到 GitHub（创建远程仓库 + 推送 main）
# 用法：
#   ./scripts/one-click-deploy.sh <owner/repo> [private|public]
# 示例：
#   ./scripts/one-click-deploy.sh my-org/a2ui-v0.9-renderer public

REPO_SLUG="${1:-}"
VISIBILITY="${2:-public}"

if [[ -z "$REPO_SLUG" ]]; then
  echo "[ERROR] 请提供仓库名，例如: my-org/a2ui-v0.9-renderer"
  exit 1
fi

if [[ "$VISIBILITY" != "public" && "$VISIBILITY" != "private" ]]; then
  echo "[ERROR] 可见性只能是 public 或 private"
  exit 1
fi

if ! command -v git >/dev/null 2>&1; then
  echo "[ERROR] git 未安装"
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "[ERROR] GitHub CLI(gh) 未安装，请先安装并登录：gh auth login"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "[INFO] 运行测试..."
npm test

echo "[INFO] 检查代码语法..."
npm run lint

if [[ -n "$(git status --porcelain)" ]]; then
  echo "[INFO] 检测到未提交改动，自动提交中..."
  git add .
  git commit -m "chore: prepare one-click deployment"
fi

if ! git rev-parse --verify main >/dev/null 2>&1; then
  CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
  if [[ "$CURRENT_BRANCH" != "main" ]]; then
    git branch -M main
  fi
fi

REMOTE_URL="git@github.com:${REPO_SLUG}.git"

if git remote get-url origin >/dev/null 2>&1; then
  echo "[INFO] origin 已存在，更新为 ${REMOTE_URL}"
  git remote set-url origin "$REMOTE_URL"
else
  echo "[INFO] 创建 GitHub 仓库: ${REPO_SLUG} (${VISIBILITY})"
  gh repo create "$REPO_SLUG" "--${VISIBILITY}" --source=. --remote=origin --confirm
fi

echo "[INFO] 推送代码到 origin/main"
git push -u origin main

echo "[DONE] 部署完成: https://github.com/${REPO_SLUG}"
