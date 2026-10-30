#!/usr/bin/env bash
# TwinMOS Virtual Machine Bootstrap Script (DEPLOY-01)
# Configures a clean Ubuntu VM for production container topology with host firewalling (S-11).
set -euo pipefail

echo "================================================================"
echo "          TwinMOS VM Host Bootstrap & Hardening (S-11)"
echo "================================================================"

if [ "$(id -u)" -ne 0 ]; then
  echo "[bootstrap] FATAL: This script must be executed as root (sudo)." >&2
  exit 1
fi

# 1. Update OS packages
apt-get update -y && apt-get upgrade -y
apt-get install -y ca-certificates curl gnupg lsb-release ufw fail2ban

# 2. Host firewall configuration (S-11 / SEC-C1)
echo "[bootstrap] Configuring UFW host firewall rules..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP (Let's Encrypt / Cloudflare Edge)
ufw allow 443/tcp   # HTTPS (TLS Edge)
# Deny direct access to internal container ports
ufw deny 8787/tcp   # API (Internal only)
ufw deny 5432/tcp   # PostgreSQL (Internal only)
ufw deny 4321/tcp   # Astro SSR (Internal only)
ufw --force enable

# 3. Create persistent directories with appropriate permissions
mkdir -p /var/cache/nginx/ssr
mkdir -p /etc/letsencrypt
mkdir -p /var/log/twinmos
chmod 755 /var/cache/nginx/ssr

echo "[bootstrap] VM provisioning complete. UFW active with S-11 port isolation."
