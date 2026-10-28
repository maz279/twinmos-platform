#!/usr/bin/env bash
# Runs a harness script inside the Playwright image ON THE LAB NETWORK, with
# www.twinmos.com resolving to the lab edge (the browser reaches it exactly as
# Cloudflare would: TLS on 443 with the origin-pull client certificate).
# Usage: tooling/audit-zt/run-in-browser.sh <script.mjs> [args...]
set -euo pipefail
cd "$(dirname "$0")/../.."
EDGE_IP=$(docker inspect twinmos-lab-edge-1 --format '{{(index .NetworkSettings.Networks "twinmos-lab_twinmos_internal").IPAddress}}')
MSYS_NO_PATHCONV=1 docker run --rm --ipc=host --network twinmos-lab_twinmos_internal \
  --add-host "www.twinmos.com:${EDGE_IP}" --add-host "twinmos.com:${EDGE_IP}" \
  -e ZT_MAX_PAGES="${ZT_MAX_PAGES:-700}" \
  -v "$(pwd):/repo" -w /repo mcr.microsoft.com/playwright:v1.63.0-noble \
  node "$@"
