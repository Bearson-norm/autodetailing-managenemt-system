#!/usr/bin/env bash
# Run on the VPS (invoked by GitHub Actions over SSH).
# Prerequisites: full (non-shallow) git clone, Node 20+, PostgreSQL (local or remote),
# PM2, backend/.env on the server. For production API URL in the SPA, add repo-root
# .env.production (e.g. VITE_API_URL=/api) — Vite reads it for `npm run build`.
set -euo pipefail

: "${DEPLOY_PATH:?Set DEPLOY_PATH to the absolute app directory on the server (e.g. /var/www/autodetaailing)}"

cd "$DEPLOY_PATH"

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Error: $DEPLOY_PATH is not a git repository. Clone the repo once on the VPS, then re-run."
  exit 1
fi

# Full clone recommended on the VPS; shallow clones may fail to resolve arbitrary SHAs.
git fetch origin

if [[ -n "${GITHUB_SHA:-}" ]]; then
  git checkout -f "${GITHUB_SHA}"
else
  BRANCH="${DEPLOY_BRANCH:-main}"
  git checkout "${BRANCH}"
  git reset --hard "origin/${BRANCH}"
fi

export NODE_ENV=production

npm ci
npm run build

(
  cd backend
  npm ci
  npm run build
  npm run migrate
)

if command -v pm2 >/dev/null 2>&1; then
  if pm2 describe autodetaailing-api >/dev/null 2>&1; then
    pm2 restart autodetaailing-api --update-env
  else
    pm2 start ecosystem.config.cjs --only autodetaailing-api
  fi
  pm2 save
else
  echo "Error: pm2 is not installed. Example: sudo npm install -g pm2"
  exit 1
fi

echo "Deploy finished at commit $(git rev-parse --short HEAD)"
