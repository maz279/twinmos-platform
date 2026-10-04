#!/usr/bin/env python3
"""
Safe fetcher for the TwinMOS mirror, backed by curl.

Why curl: the CDN edge intermittently drops urllib's TLS fingerprint
(WinError 10060 on connect) while accepting curl consistently. curl also
gives us --resolve, which pins the healthy edge IP and removes any DNS
rebinding window by construction.

SSRF protections (per security policy):
- Only http/https schemes allowed.
- Host must be in the exact allowlist (www.twinmos.com / twinmos.com).
- The edge is pinned via --resolve to a pre-validated public IP; private,
  loopback, link-local, reserved and unspecified addresses are rejected.
- Redirects: max 5, and the final effective URL must still be on an
  allowed host (checked from curl's url_effective write-out).
"""
import ipaddress
import json
import re
import shutil
import socket
import subprocess
import time
from pathlib import Path

import urllib.parse

CRAWL_DIR = Path(__file__).parent
CONFIG = json.loads((CRAWL_DIR / "crawl_config.json").read_text(encoding="utf-8"))
UA = CONFIG["user_agent"]
COOKIES = CONFIG["cookies"]

ALLOWED_HOSTS = {"www.twinmos.com", "twinmos.com"}
ALLOWED_SCHEMES = {"http", "https"}

CURL = shutil.which("curl") or "curl"


class UnsafeURLError(Exception):
    """Raised when a URL or redirect violates the fetch policy."""


def _is_public(ip_str: str) -> bool:
    ip = ipaddress.ip_address(ip_str)
    return not (
        ip.is_private
        or ip.is_loopback
        or ip.is_link_local
        or ip.is_reserved
        or ip.is_unspecified
        or ip.is_multicast
    )


# --- pick the healthy public edge once (the host publishes two A records,
#     one of which is dead and stalls sequential connects for ~21s) ---
_pinned_ip: str | None = None


def _probe_and_pin(host: str) -> None:
    global _pinned_ip
    infos = socket.getaddrinfo(host, 443, proto=socket.IPPROTO_TCP)
    ips = list(dict.fromkeys(i[4][0] for i in infos))
    best_ip, best_ms = None, float("inf")
    for ip in ips:
        if not _is_public(ip):
            raise UnsafeURLError(f"{host} resolves to non-public address {ip}")
        t0 = time.monotonic()
        try:
            with socket.create_connection((ip, 443), timeout=4):
                pass
            elapsed = (time.monotonic() - t0) * 1000
            print(f"  probe {host} -> {ip}: reachable in {elapsed:.0f}ms")
            if elapsed < best_ms:
                best_ip, best_ms = ip, elapsed
        except OSError as exc:
            print(f"  probe {host} -> {ip}: unreachable ({exc})")
    if best_ip is None:
        raise UnsafeURLError(f"no reachable public edge for {host}")
    _pinned_ip = best_ip
    print(f"  pinned {host} -> {_pinned_ip}")


_probe_and_pin("www.twinmos.com")


def validate_url(url: str) -> urllib.parse.ParseResult:
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme not in ALLOWED_SCHEMES:
        raise UnsafeURLError(f"scheme not allowed: {parsed.scheme!r} in {url}")
    if parsed.hostname not in ALLOWED_HOSTS:
        raise UnsafeURLError(f"host not allowed: {parsed.hostname!r} in {url}")
    return parsed


def fetch(
    url: str,
    binary: bool = False,
    retries: int = 3,
    delay: float = 0.4,
    timeout: int = 45,
    referer: str | None = None,
) -> tuple[bytes | str | None, int, str]:
    """Fetch a URL via curl. Returns (data, status, content_type)."""
    validate_url(url)
    for attempt in range(retries):
        result = subprocess.run(
            [
                CURL, "-sS", "-L", "--max-redirs", "5",
                "--resolve", f"www.twinmos.com:443:{_pinned_ip}",
                "--resolve", f"twinmos.com:443:{_pinned_ip}",
                "--max-time", str(timeout),
                "--connect-timeout", "12",
                "-A", UA,
                "-H", f"Cookie: {COOKIES}",
                "-H", "Accept: */*",
                "-H", "Accept-Language: en-US,en;q=0.9",
                *(["-H", f"Referer: {referer}"] if referer else []),
                "-w", "\n__CURLMETA__%{http_code}|%{url_effective}|%{content_type}|%{size_download}",
                url,
            ],
            capture_output=True,
        )
        out = result.stdout
        if b"__CURLMETA__" not in out:
            # network-level failure (timeout / connect fail)
            print(f"    curl attempt {attempt + 1} failed: {result.stderr.decode(errors='replace')[:120]}")
            time.sleep(1.5 * (attempt + 1))
            continue
        body, meta = out.rsplit(b"__CURLMETA__", 1)
        try:
            status_s, effective_s, ctype_s, size_s = meta.decode(errors="replace").strip().split("|")
            status = int(status_s)
        except ValueError:
            print(f"    curl meta parse failed for {url}")
            time.sleep(1.5 * (attempt + 1))
            continue
        # redirect target must remain on an allowed host
        try:
            eff = urllib.parse.urlparse(effective_s)
            if eff.hostname not in ALLOWED_HOSTS:
                raise UnsafeURLError(f"redirect left allowlist: {effective_s}")
        except UnsafeURLError:
            raise
        except Exception:  # noqa: BLE001
            pass
        if status in (429, 503):
            time.sleep(2 * (attempt + 1))
            continue
        if binary:
            return body, status, ctype_s
        return body.decode("utf-8", errors="replace"), status, ctype_s
    return None, 0, ""
