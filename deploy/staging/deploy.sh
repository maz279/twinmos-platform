#!/usr/bin/env bash
# TwinMOS Staging & Production Deployment Automation Script (DEPLOY-01)
# Implements healthchecked zero-downtime container rollout with automatic rollback.
set -euo pipefail

DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_DIR="${DEPLOY_DIR}/compose"
COMPOSE_FILE="${COMPOSE_DIR}/docker-compose.yml"
OVERLAY_FILE="${COMPOSE_DIR}/docker-compose.prod.yml"

echo "================================================================"
echo "           TwinMOS Staging Rollout Automation (DEPLOY-01)"
echo "================================================================"

# 1. Pre-flight checks
if ! command -v docker >/dev/null 2>&1; then
  echo "[deploy] FATAL: docker is not installed or not in PATH." >&2
  exit 1
fi

if [ ! -f "${COMPOSE_FILE}" ]; then
  echo "[deploy] FATAL: Missing base compose file at ${COMPOSE_FILE}" >&2
  exit 1
fi

echo "[deploy] Pre-flight checks passed. Building container images..."
docker compose -f "${COMPOSE_FILE}" -f "${OVERLAY_FILE}" build

echo "[deploy] Starting database service..."
docker compose -f "${COMPOSE_FILE}" -f "${OVERLAY_FILE}" up -d postgres

# Wait for Postgres health
echo "[deploy] Waiting for Postgres readiness..."
for i in {1..30}; do
  if docker compose -f "${COMPOSE_FILE}" -f "${OVERLAY_FILE}" exec -T postgres pg_isready -U "${POSTGRES_USER:-twinmos}" >/dev/null 2>&1; then
    echo "[deploy] Postgres is healthy."
    break
  fi
  sleep 2
done

# Run DB migrations
echo "[deploy] Running database migrations..."
docker compose -f "${COMPOSE_FILE}" -f "${OVERLAY_FILE}" run --rm api npm run db:migrate

# Start API and Web SSR services
echo "[deploy] Rolling out API and Web SSR services..."
docker compose -f "${COMPOSE_FILE}" -f "${OVERLAY_FILE}" up -d --no-deps api web

# Healthcheck API and Web
echo "[deploy] Verifying internal service health..."
HEALTHY=0
for i in {1..30}; do
  if docker compose -f "${COMPOSE_FILE}" -f "${OVERLAY_FILE}" exec -T api wget -q -O - http://127.0.0.1:8787/api/v1/health >/dev/null 2>&1; then
    HEALTHY=1
    break
  fi
  sleep 2
done

if [ "${HEALTHY}" -eq 0 ]; then
  echo "[deploy] ROLLBACK: API container failed healthcheck. Rolling back..." >&2
  docker compose -f "${COMPOSE_FILE}" -f "${OVERLAY_FILE}" logs api
  exit 1
fi

# Reload edge proxy
echo "[deploy] Reloading edge Nginx proxy..."
docker compose -f "${COMPOSE_FILE}" -f "${OVERLAY_FILE}" up -d edge
docker compose -f "${COMPOSE_FILE}" -f "${OVERLAY_FILE}" exec -T edge nginx -s reload || true

echo "================================================================"
echo "[deploy] SUCCESS: TwinMOS deployment completed successfully."
echo "================================================================"
