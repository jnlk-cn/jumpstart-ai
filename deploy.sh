#!/bin/bash
# Deploy to GitHub Pages via gh-pages branch
set -e

echo "Building VitePress site..."
npm run docs:build

echo "Deploying to gh-pages branch..."
cd docs/.vitepress/dist
git init
git checkout -b gh-pages
git add -A
git config user.email "jnlk-cn@users.noreply.github.com"
git config user.name "jnlk-cn"
git commit -m "deploy: update gh-pages $(date +%Y-%m-%d)" --allow-empty
git remote add origin https://github.com/jnlk-cn/jumpstart-ai.git
GH_CONFIG_DIR=/app/data/所有对话/主对话/.gh git push -u origin gh-pages --force

# Trigger Pages rebuild
cd /tmp/jumpstart-ai
GH_CONFIG_DIR=/app/data/所有对话/主对话/.gh gh api --method POST repos/jnlk-cn/jumpstart-ai/pages/builds

echo "Deploy complete!"
