#!/usr/bin/env bash
# Run on the VPS (invoked by GitHub Actions over SSH).
# Prerequisites: full (non-shallow) git clone, Node 20+, PostgreSQL (local or remote),
# PM2, backend/.env on the server. For production API URL in the SPA, add repo-root
# .env.production (e.g. VITE_API_URL=/api) — Vite reads it for `npm run build`.
#
# Fast path (GitHub Actions): set DEPLOY_RELEASE_TGZ to a tarball containing dist/ and backend/dist/
# produced on the runner — skips frontend install/build and backend tsc on the VPS.
set -euo pipefail

: "${DEPLOY_PATH:?Set DEPLOY_PATH to the absolute app directory on the server (e.g. /var/www/autodetaailing)}"

cd "$DEPLOY_PATH"

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Error: $DEPLOY_PATH is not a git repository. Clone the repo once on the VPS, then re-run."
  exit 1
fi

git fetch origin

if [[ -n "${GITHUB_SHA:-}" ]]; then
  git checkout -f "${GITHUB_SHA}"
else
  BRANCH="${DEPLOY_BRANCH:-main}"
  git checkout "${BRANCH}"
  git reset --hard "origin/${BRANCH}"
fi

pm2_restart() {
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
}

# --- Fast deploy: extract pre-built artifacts from CI (no root npm, backend prod deps only) ---
if [[ -n "${DEPLOY_RELEASE_TGZ:-}" ]]; then
  if [[ ! -f "${DEPLOY_RELEASE_TGZ}" ]]; then
    echo "Error: DEPLOY_RELEASE_TGZ set but file missing: ${DEPLOY_RELEASE_TGZ}"
    exit 1
  fi
  rm -rf "${DEPLOY_PATH}/dist" "${DEPLOY_PATH}/backend/dist"
  tar -xzf "${DEPLOY_RELEASE_TGZ}" -C "${DEPLOY_PATH}"
  (
    cd backend
    npm ci --omit=dev
    npm run migrate:prod
  )
  pm2_restart
  rm -f "${DEPLOY_RELEASE_TGZ}"
  echo "Deploy (artifact) finished at commit $(git rev-parse --short HEAD)"
  exit 0
fi

# --- Full deploy (manual or no tarball): install devDependencies for Vite + tsc ---
npm ci &
( cd backend && npm ci ) &
wait

NODE_ENV=production npm run build &
( cd backend && npm run build ) &
wait

( cd backend && npm run migrate:prod )

pm2_restart

echo "Deploy finished at commit $(git rev-parse --short HEAD)"
