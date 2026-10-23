#!/usr/bin/env bash
# Branch protection for main (T1.2.7 / MS2.1) — requires a repo-admin token
# with admin:repo_hook + repo scope, e.g. from `gh auth token`.
# Usage: GH_TOKEN=<token> ./tooling/verify/configure-branch-protection.sh
set -euo pipefail
REPO="${GH_REPO:-maz279/twinmos-platform}"
TOKEN="${GH_TOKEN:?Set GH_TOKEN to a repo-admin PAT}"
curl -sS -X PUT \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/${REPO}/branches/main/protection" \
  -d '{
    "required_status_checks": {
      "strict": true,
      "contexts": ["build-and-verify", "test-postgres-integration", "test-edge-config"]
    },
    "required_pull_request_reviews": {
      "required_approving_review_count": 1,
      "dismiss_stale_reviews": true
    },
    "enforce_admins": false,
    "restrictions": null,
    "allow_force_pushes": false,
    "allow_deletions": false
  }' | tee /tmp/branch-protection.json
python - <<'PY'
import json,sys
d=json.load(open('/tmp/branch-protection.json'))
ok = 'required_pull_request_reviews' in d
print('\n[branch-protection] ' + ('CONFIGURED' if ok else 'FAILED: ' + str(d.get('message'))))
sys.exit(0 if ok else 1)
PY
