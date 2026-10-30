#!/bin/sh
# refresh-cf-ranges.sh
# Roadmap MS2.5 · Task T2.5.1 (Source A6 / EDGE-01 / EDGE-RIP)
#
# Fetches official published Cloudflare IP ranges from:
# - https://www.cloudflare.com/ips-v4
# - https://www.cloudflare.com/ips-v6
# Formats into set_real_ip_from directives in deploy/nginx/realip_cloudflare.conf

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
TARGET_CONF="${REPO_ROOT}/deploy/nginx/realip_cloudflare.conf"

echo "[refresh-cf-ranges] Updating Cloudflare IP ranges in ${TARGET_CONF}..."

if command -v node >/dev/null 2>&1; then
  node "${REPO_ROOT}/tooling/refresh-cf-ranges.mjs"
  exit $?
fi

TMP_FILE=$(mktemp)
cat << 'EOF' > "${TMP_FILE}"
# Cloudflare official published IP ranges (EDGE-01, EDGE-RIP, T2.5.1)
# Source: https://www.cloudflare.com/ips-v4 and https://www.cloudflare.com/ips-v6
# Trust ONLY these ranges to restore real client IP via CF-Connecting-IP.

# IPv4 ranges
EOF

curl -fsSL https://www.cloudflare.com/ips-v4 | sed -e 's/^/set_real_ip_from /' -e 's/$/;/' >> "${TMP_FILE}"

cat << 'EOF' >> "${TMP_FILE}"

# IPv6 ranges
EOF

curl -fsSL https://www.cloudflare.com/ips-v6 | sed -e 's/^/set_real_ip_from /' -e 's/$/;/' >> "${TMP_FILE}"

cat << 'EOF' >> "${TMP_FILE}"

real_ip_header CF-Connecting-IP;
EOF

mv "${TMP_FILE}" "${TARGET_CONF}"
echo "[refresh-cf-ranges] Completed updating ${TARGET_CONF}"
