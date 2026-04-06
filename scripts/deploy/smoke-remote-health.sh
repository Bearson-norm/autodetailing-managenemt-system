#!/usr/bin/env bash
# Run on the VPS. Args: (1) DEPLOY_PATH (2) optional PORT override (from CI secret VPS_API_PORT).
# If override empty, reads PORT from backend/.env; default 5001.
set -euo pipefail

DEPLOY_PATH="${1:?usage: smoke-remote-health.sh DEPLOY_PATH [PORT_OVERRIDE]}"
OVERRIDE="${2:-}"

if [[ -n "$OVERRIDE" ]]; then
  API_PORT="$OVERRIDE"
else
  ENV_FILE="${DEPLOY_PATH}/backend/.env"
  PORT_FROM=""
  if [[ -f "$ENV_FILE" ]]; then
    PORT_FROM="$(grep -E '^[[:space:]]*PORT=' "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '\r' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
  fi
  API_PORT="${PORT_FROM:-5001}"
fi

exec curl -fsS --max-time 15 "http://127.0.0.1:${API_PORT}/health"
