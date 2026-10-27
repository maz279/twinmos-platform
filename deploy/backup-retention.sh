#!/usr/bin/env bash
# ==============================================================================
# TwinMOS Backup Retention & Lifecycle Enforcement (T7.1.3)
# Enforces the tiered retention schedule:
#   - Daily Fulls: 35 days (local and off-site)
#   - Weekly Fulls: 12 weeks
#   - Monthly Archives: 12 months (off-site encrypted long-term storage)
# ==============================================================================
set -euo pipefail

BACKUP_ROOT="${BACKUP_ROOT:-/var/backups/twinmos}"
DAILY_RETAIN_DAYS=35
WEEKLY_RETAIN_DAYS=84    # 12 weeks
MONTHLY_RETAIN_DAYS=365  # 12 months

echo "[retention] Auditing backup retention under $BACKUP_ROOT..."

if [ ! -d "$BACKUP_ROOT" ]; then
  echo "[retention] Directory $BACKUP_ROOT does not exist; skipping."
  exit 0
fi

# 1. Prune expired daily fulls (> 35 days) that are not flagged as weekly or monthly
find "$BACKUP_ROOT" -maxdepth 1 -type d -name '20*' -mtime "+$DAILY_RETAIN_DAYS" | while read -r dir; do
  day_of_month="$(date -d "$(basename "$dir" | cut -c1-8)" +%d 2>/dev/null || echo "15")"
  day_of_week="$(date -d "$(basename "$dir" | cut -c1-8)" +%u 2>/dev/null || echo "1")"

  if [ "$day_of_month" -eq 1 ]; then
    # Keep monthly backup up to 365 days
    mtime_days=$(( ($(date +%s) - $(stat -c %Y "$dir" 2>/dev/null || stat -f %m "$dir")) / 86400 ))
    if [ "$mtime_days" -gt "$MONTHLY_RETAIN_DAYS" ]; then
      echo "[retention] Expiring monthly archive older than 1 year: $dir"
      rm -rf "$dir"
    fi
  elif [ "$day_of_week" -eq 7 ]; then
    # Keep weekly backup up to 12 weeks (84 days)
    mtime_days=$(( ($(date +%s) - $(stat -c %Y "$dir" 2>/dev/null || stat -f %m "$dir")) / 86400 ))
    if [ "$mtime_days" -gt "$WEEKLY_RETAIN_DAYS" ]; then
      echo "[retention] Expiring weekly archive older than 12 weeks: $dir"
      rm -rf "$dir"
    fi
  else
    echo "[retention] Expiring daily backup older than $DAILY_RETAIN_DAYS days: $dir"
    rm -rf "$dir"
  fi
done

echo "[retention] Retention cycle completed successfully."
