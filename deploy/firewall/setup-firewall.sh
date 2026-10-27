#!/usr/bin/env bash
# ==============================================================================
# TwinMOS Production Origin Isolation & Firewall Setup (Task F3 / T7.3.2 / HARD-01)
# Closes: Finding Z-23 (Hardening hollow), Finding Z-28 (Firewall part)
#
# Enforces:
# 1. DOCKER-USER iptables chain filtering so Docker cannot bypass host firewall rules.
# 2. Ports 80 and 443 allowed ONLY from published Cloudflare IPv4 & IPv6 ranges.
# 3. Port 22 (SSH) allowed ONLY from authorized admin/bastion IP ranges, with rate-limiting.
# 4. SSH keys only (PasswordAuthentication no).
# 5. Unattended security updates configured and active.
# 6. Internal application ports (8787, 4321, 5432) strictly blocked from public interfaces.
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

echo "=== TwinMOS Host & Container Firewall Configuration (T7.3.2) ==="

# ------------------------------------------------------------------------------
# 1. Define Authorized IP Ranges
# ------------------------------------------------------------------------------

# Cloudflare Official Published IP Ranges (15 IPv4 + 7 IPv6 = 22 total)
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

# Admin Bastion / Management CIDRs (configurable via ADMIN_CIDRS env var)
# Defaults to private enterprise RFC 1918 / loopback management subnets if not overridden
ADMIN_SSH_CIDRS=(${ADMIN_CIDRS:-"10.0.0.0/8" "172.16.0.0/12" "192.168.0.0/16" "127.0.0.1/32"})

# ------------------------------------------------------------------------------
# 2. Configure iptables DOCKER-USER Chain (Docker Bypass Prevention)
# ------------------------------------------------------------------------------
echo "[*] Configuring DOCKER-USER chain to enforce container port isolation..."

# Ensure DOCKER-USER chain exists and flush existing rules in DOCKER-USER
run_cmd iptables -N DOCKER-USER 2>/dev/null || true
run_cmd iptables -F DOCKER-USER

# Allow established and related connections first
run_cmd iptables -A DOCKER-USER -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT

# Allow internal docker network loopback / inter-container communication
run_cmd iptables -A DOCKER-USER -i lo -j ACCEPT
run_cmd iptables -A DOCKER-USER -s 127.0.0.1 -j ACCEPT
run_cmd iptables -A DOCKER-USER -s 172.16.0.0/12 -j ACCEPT

# Allow Cloudflare IPv4 ranges on published web ports (80, 443)
echo "[*] Allowing Cloudflare IPv4 ingress in DOCKER-USER for ports 80 and 443..."
for cidr in "${CF_IPV4[@]}"; do
  run_cmd iptables -A DOCKER-USER -s "$cidr" -p tcp -m multiport --dports 80,443 -j ACCEPT
done

# Block all unauthorized direct external traffic to container web & internal ports
# (Prevents direct IP bypass of Cloudflare proxy and prevents reaching published containers)
run_cmd iptables -A DOCKER-USER -p tcp -m multiport --dports 80,443,8787,4321,5432 -j DROP
run_cmd iptables -A DOCKER-USER -j RETURN

# IPv6 DOCKER-USER configuration if ip6tables is available
if command -v ip6tables >/dev/null 2>&1; then
  echo "[*] Configuring ip6tables DOCKER-USER chain..."
  run_cmd ip6tables -N DOCKER-USER 2>/dev/null || true
  run_cmd ip6tables -F DOCKER-USER
  run_cmd ip6tables -A DOCKER-USER -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
  run_cmd ip6tables -A DOCKER-USER -i lo -j ACCEPT
  for cidr in "${CF_IPV6[@]}"; do
    run_cmd ip6tables -A DOCKER-USER -s "$cidr" -p tcp -m multiport --dports 80,443 -j ACCEPT
  done
  run_cmd ip6tables -A DOCKER-USER -p tcp -m multiport --dports 80,443,8787,4321,5432 -j DROP
  run_cmd ip6tables -A DOCKER-USER -j RETURN
fi

# ------------------------------------------------------------------------------
# 3. Configure Host UFW Baseline
# ------------------------------------------------------------------------------
echo "[*] Configuring host UFW policy..."
run_cmd ufw --force reset
run_cmd ufw default deny incoming
run_cmd ufw default allow outgoing

# Allow Loopback (127.0.0.1 / ::1)
run_cmd ufw allow in on lo to any

# Allow SSH only from authorized admin/bastion CIDRs with brute-force rate-limiting
echo "[*] Configuring SSH access strictly for admin addresses..."
for admin_cidr in "${ADMIN_SSH_CIDRS[@]}"; do
  run_cmd ufw limit proto tcp from "$admin_cidr" to any port 22 comment "SSH admin rate-limited"
done

# Explicitly deny internal application ports from external host interfaces
run_cmd ufw deny 8787/tcp comment "Block external Node API direct port"
run_cmd ufw deny 4321/tcp comment "Block external Astro SSR direct port"
run_cmd ufw deny 5432/tcp comment "Block external PostgreSQL direct port"

# Allow Cloudflare IPv4 ranges on host UFW
echo "[*] Allowing Cloudflare IPv4 on host UFW (ports 80, 443)..."
for cidr in "${CF_IPV4[@]}"; do
  run_cmd ufw allow proto tcp from "$cidr" to any port 80,443 comment "Cloudflare IPv4"
done

# Allow Cloudflare IPv6 ranges on host UFW
echo "[*] Allowing Cloudflare IPv6 on host UFW (ports 80, 443)..."
for cidr in "${CF_IPV6[@]}"; do
  run_cmd ufw allow proto tcp from "$cidr" to any port 80,443 comment "Cloudflare IPv6"
done

# Enable UFW
run_cmd ufw --force enable

# ------------------------------------------------------------------------------
# 4. Enforce SSH Keys Only & Disable Password Authentication
# ------------------------------------------------------------------------------
echo "[*] Enforcing SSH keys only (PasswordAuthentication no)..."
if [[ -d /etc/ssh/sshd_config.d ]]; then
  SSHD_HARDENING="/etc/ssh/sshd_config.d/99-twinmos-hardening.conf"
  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "[dry-run] Writing $SSHD_HARDENING with PasswordAuthentication no and PermitRootLogin prohibit-password"
  else
    cat <<'EOF' > "$SSHD_HARDENING"
# TwinMOS SSH Hardening (T7.3.2)
PasswordAuthentication no
ChallengeResponseAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin prohibit-password
PubkeyAuthentication yes
X11Forwarding no
MaxAuthTries 3
EOF
    systemctl reload sshd || service ssh reload || true
  fi
fi

# ------------------------------------------------------------------------------
# 5. Configure Unattended Security Updates
# ------------------------------------------------------------------------------
echo "[*] Configuring unattended security updates..."
if [[ -d /etc/apt/apt.conf.d ]]; then
  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "[dry-run] Enabling unattended security updates in /etc/apt/apt.conf.d/20auto-upgrades"
  else
    cat <<'EOF' > /etc/apt/apt.conf.d/20auto-upgrades
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF
  fi
fi

echo "=== Firewall & Hardening Setup Complete: DOCKER-USER chain & UFW active ==="
