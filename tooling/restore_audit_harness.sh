#!/bin/bash
# Reinstalls the preview-only audit harness (axe-core + negative control) into
# apps/web/public/__audit/ for gate re-runs. The directory is gitignored and
# MUST be removed before a production build (pagefind would index it).
# Usage: bash tooling/restore_audit_harness.sh
set -e
cd "$(dirname "$0")/.."
DEST=apps/web/public/__audit
mkdir -p "$DEST"
cp tooling/audit-harness/* "$DEST"/
echo "harness restored to $DEST — remove it (rm -rf $DEST) after auditing"
