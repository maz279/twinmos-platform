#!/usr/bin/env python3
"""parity-score.py — correct implementation of the TwinMOS parity gate metric.

Protocol (docs + project memory "parity-screenshot-protocol"):
  headless Chrome, --force-prefers-reduced-motion --run-all-compositor-stages-before-draw
  --hide-scrollbars, fresh --user-data-dir per shot, virtual-time 25s,
  window W x 2400; PIL diff, per-channel tolerance <= 8, PASS >= 98%.

WHY THIS FILE EXISTS (P5 audit iteration, 2026-09-27): the previous ad-hoc
scorer read PIL's ImageChops.difference().histogram() as if bins were packed
RGB triples. For an RGB image that histogram is actually three concatenated
per-channel histograms (768 bins), so the old bin->color math was garbage —
it reported 94.44 for pairs whose true score was 97.93. It also never caught
that several P1 reference pairs (partners/support/shop -390-a/b) were the
SAME FILE (copy bug — md5-identical), making "100.0" a tautology.

This scorer:
  * computes the true per-pixel max-channel delta with numpy;
  * refuses to score a pair whose files are byte-identical (reference-copy
    tautology guard) unless --allow-identical is passed;
  * prints per-band mismatch rows for anything below the gate.

Usage:
  python tooling/parity-score.py A.png B.png [A2.png B2.png ...] [--gate 98]
"""
import sys
import hashlib
import argparse

from PIL import Image
import numpy as np


def digest(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 16), b""):
            h.update(chunk)
    return h.hexdigest()


def load(path: str) -> np.ndarray:
    return np.array(Image.open(path).convert("RGB"), dtype=np.int16)


def band_report(a: np.ndarray, b: np.ndarray, tol: int) -> list[tuple[int, float]]:
    d = np.abs(a - b).max(axis=2)
    H = a.shape[0]
    out = []
    for y0 in range(0, H, 200):
        band = d[y0:y0 + 200]
        out.append((y0, 100 * (band > tol).mean()))
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("pairs", nargs="+", help="A.png B.png [A2.png B2.png ...]")
    ap.add_argument("--gate", type=float, default=98.0)
    ap.add_argument("--tol", type=int, default=8)
    ap.add_argument("--allow-identical", action="store_true")
    args = ap.parse_args()
    if len(args.pairs) % 2 != 0:
        print("pairs must be A B [A B ...]", file=sys.stderr)
        return 2

    rc = 0
    for i in range(0, len(args.pairs), 2):
        pa, pb = args.pairs[i], args.pairs[i + 1]
        ha, hb = digest(pa), digest(pb)
        if ha == hb and not args.allow_identical:
            print(f"{pa} vs {pb}: IDENTICAL FILES (md5 {ha[:10]}) — reference-copy "
                  f"tautology, refusing to score. Recapture one side.")
            rc = max(rc, 2)
            continue
        a, b = load(pa), load(pb)
        if a.shape != b.shape:
            b = np.array(Image.open(pb).convert("RGB").resize((a.shape[1], a.shape[0])), dtype=np.int16)
        score = 100 * float((np.abs(a - b).max(axis=2) <= args.tol).mean())
        verdict = "PASS" if score >= args.gate else "FAIL"
        print(f"{pa} vs {pb}: {score:.2f} {verdict} (gate {args.gate}, tol {args.tol})")
        if score < args.gate:
            bands = band_report(a, b, args.tol)
            worst = ", ".join(f"y{y0}:{pct:.1f}%" for y0, pct in bands if pct > 3)
            print(f"  mismatch>3% bands: {worst}")
            rc = max(rc, 1)
    return rc


if __name__ == "__main__":
    sys.exit(main())
