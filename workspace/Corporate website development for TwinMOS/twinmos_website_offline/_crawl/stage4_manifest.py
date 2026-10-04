#!/usr/bin/env python3
"""Stage 4: build a manifest of every mirrored file (relative path, size, kind)."""
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WEB = ROOT / "website"
# pathlib rglob cannot descend into paths beyond MAX_PATH; bash find can.
res = subprocess.run(
    ["bash", "-c", f'find "{WEB}" -type f -printf "%P\\t%s\\n"'],
    capture_output=True, text=True, check=True,
)
entries = []
for line in res.stdout.splitlines():
    rel, _, size = line.rpartition("\t")
    if not rel:
        continue
    kind = "page" if rel.endswith("index.html") and not rel.startswith("wp-content") else "asset"
    entries.append({"path": rel, "bytes": int(size or 0), "kind": kind})
entries.sort(key=lambda e: e["path"])

total_bytes = sum(e["bytes"] for e in entries)
out = {
    "site": "https://www.twinmos.com",
    "mirrored_at": "2026-09-23",
    "file_count": len(entries),
    "total_bytes": total_bytes,
    "total_mb": round(total_bytes / 1024 / 1024, 1),
    "files": entries,
}
(ROOT / "_crawl" / "file_manifest.json").write_text(
    json.dumps(out, indent=1), encoding="utf-8"
)
print(f"manifest: {len(entries)} files, {out['total_mb']} MB")
