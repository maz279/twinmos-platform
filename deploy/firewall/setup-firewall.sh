#!/usr/bin/env bash
# ==============================================================================
# TwinMOS Production Origin Isolation & Firewall Setup (Task F3 / HARD-01)
# Enforces that all inbound HTTP/HTTPS traffic to the origin arrives ONLY via
# Cloudflare reverse proxy edge network, blocking direct origin IP scraping,
# bypass attempts, and internal port exposures (8787, 4321, 5432).
# ==============================================================================
set -euo pipefail

DRY_RUN=0
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=1
  echo "[firewall] Running in DRY-RUN mode (rules will be validated but not applied)."
fi

run_cmd() {
  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "[dry-run] $*"
  else
    "$@"
  fi
}

echo "=== TwinMOS Host Firewall Configuration ==="

# 1. Reset UFW to clean baseline
run_cmd ufw --force reset
run_cmd ufw default deny incoming
run_cmd ufw default allow outgoing

# 2. Allow Loopback (Inter-process communication 127.0.0.1 / ::1)
run_cmd ufw allow in on lo to any

# 3. Secure SSH access with brute-force rate limiting
run_cmd ufw limit 22/tcp comment "SSH rate-limited"

# 4. Deny internal application ports from external access explicitly
run_cmd ufw deny 8787/tcp comment "Block external Node API direct port"
run_cmd ufw deny 4321/tcp comment "Block external Astro SSR direct port"
run_cmd ufw deny 5432/tcp comment "Block external PostgreSQL direct port"

# 5. Cloudflare Official Published IP Ranges (15 IPv4 + 7 IPv6 = 22 total)
CF_IPV4=(
  "173.245.48.0/20"
  "103.21.244.0/22"
  "103.22.200.0/22"
  "103.31.4.0/22"
  "141.101.64.0/18"
  "108.162.192.0/18"
  "190.93.240.0/20"
  "188.114.96.0/20"
  "197.234.240.0/22"
  "198.41.128.0/17"
  "162.158.0.0/15"
  "104.16.0.0/13"
  "104.24.0.0/14"
  "172.64.0.0/13"
  "131.0.72.0/22"
)

CF_IPV6=(
  "2400:cb00::/32"
  "2606:4700::/32"
  "2803:f800::/32"
  "2405:b500::/32"
  "2405:8100::/32"
  "2a06:98c0::/29"
  "2c0f:f248::/32"
)

echo "Allowing Cloudflare IPv4 ranges on 80/tcp and 443/tcp..."
for cidr in "${CF_IPV4[@]}"; do
  run_cmd ufw allow proto tcp from "$cidr" to any port 80,443 comment "Cloudflare IPv4"
done

echo "Allowing Cloudflare IPv6 ranges on 80/tcp and 443/tcp..."
for cidr in "${CF_IPV6[@]}"; do
  run_cmd ufw allow proto tcp from "$cidr" to any port 80,443 comment "Cloudflare IPv6"
done

# 6. Enable UFW
run_cmd ufw --force enable
echo "=== Firewall setup complete: Origin isolated to Cloudflare ingress only ==="
