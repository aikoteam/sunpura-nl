#!/bin/bash
# Deploy: commit all changes and push to GitHub Pages
# Usage: ./deploy.sh "опис змін"

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_DIR"

MSG="${1:-Update $(date '+%Y-%m-%d %H:%M')}"

git add index.html styles.css script.js favicon.svg images/ .gitignore CNAME 2>/dev/null
git commit -m "$MSG" && git push origin main && echo "✅ Задеплоєно: $MSG"
