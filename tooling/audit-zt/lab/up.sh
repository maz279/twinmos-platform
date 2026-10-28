#!/usr/bin/env bash
# Bring the zero-trust lab up from the CURRENT working tree and export lab certs.
set -euo pipefail
cd "$(dirname "$0")/../../.."
L=tooling/audit-zt/lab
C=(docker compose -p twinmos-lab --env-file $L/lab.vars -f deploy/compose/docker-compose.yml -f deploy/compose/docker-compose.prod.yml -f $L/docker-compose.lab.yml)
[ "${1:-}" = "--reset" ] && "${C[@]}" down -v
# lab PKI on the host first: file bind mounts must exist before compose creates the edge
mkdir -p $L/.certs
MSYS_NO_PATHCONV=1 docker run --rm -e CERT_OUT=/out -v "$(pwd)/$L:/lab:ro" -v "$(pwd)/$L/.certs:/out"   mirror.gcr.io/library/nginx:alpine sh /lab/gen-certs.sh
"${C[@]}" up -d --build
"${C[@]}" ps --format '{{.Service}}\t{{.Status}}'
