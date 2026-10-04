#!/usr/bin/env python
"""Fetch pages of www.twinmos.com through a local headless Edge (CDP).

Usage (run from this script's directory):
  python cdp_fetch.py <url>              fetch one page
  python cdp_fetch.py --batch            fetch every URL listed in urls.txt

Output files are derived internally from the URL slug and written only
into the pages/ subdirectory of this script's own directory; no external
path input is accepted anywhere.

Security invariants:
- Only http/https URLs on the twinmos.com domain are ever navigated to
  (host allowlist + DNS resolution checks rejecting IP literals, private,
  loopback, link-local and reserved addresses).
- The only HTTP endpoint this script calls is the fixed, literal CDP
  endpoint of the local automation browser.
- No output or input path is taken from user input; page filenames are
  generated from the URL and sanitised to alphanumerics, dashes,
  underscores and dots, and the batch list is always the fixed file
  urls.txt next to this script.
"""
import hashlib
import ipaddress
import json
import os
import re
import socket
import sys
import time
import urllib.request
import urllib.parse
import websocket

CDP_TARGETS_URL = "http://127.0.0.1:9223/json"  # fixed local automation endpoint
ALLOWED_HOSTS = {"twinmos.com", "www.twinmos.com"}
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0")


def assert_allowed_fetch_url(url):
    """Only plain http(s) twinmos.com URLs may be fetched."""
    p = urllib.parse.urlsplit(url)
    if p.scheme not in ("http", "https"):
        raise ValueError("scheme not allowed: %r" % p.scheme)
    if p.username or p.password:
        raise ValueError("credentials in URL not allowed")
    host = (p.hostname or "").lower()
    if host not in ALLOWED_HOSTS:
        raise ValueError("host not allowed: %r" % host)
    if p.port not in (None, 80, 443):
        raise ValueError("port not allowed")
    try:
        infos = socket.getaddrinfo(host, None)
        ips = {ipaddress.ip_address(i[4][0]) for i in infos}
    except OSError:
        raise ValueError("host does not resolve: %r" % host)
    for a in ips:
        if a.is_private or a.is_loopback or a.is_link_local or a.is_reserved or a.is_multicast:
            raise ValueError("resolved address not allowed: %s" % a)


def derive_output_name(url):
    """Deterministic, sanitised output filename — no external path input.

    The name is generated strictly from [A-Za-z0-9._-], so path traversal
    is impossible by construction.
    """
    p = urllib.parse.urlsplit(url)
    slug = re.sub(r"[^A-Za-z0-9._-]+", "-", p.path.strip("/")).strip("-") or "index"
    slug = slug[-120:]
    digest = hashlib.sha256(url.encode("utf-8")).hexdigest()[:10]
    name = f"{slug}-{digest}.html"
    assert re.fullmatch(r"[A-Za-z0-9._-]+", name) and ".." not in name
    return name


class Tab:
    def __init__(self):
        with urllib.request.urlopen(CDP_TARGETS_URL, timeout=15) as r:
            targets = json.loads(r.read().decode())
        pages = [t for t in targets if t.get("type") == "page"]
        if not pages:
            raise RuntimeError("no CDP page target available")
        self.ws = websocket.create_connection(pages[0]["webSocketDebuggerUrl"], timeout=60)
        self.mid = 0

    def call(self, method, params=None):
        self.mid += 1
        self.ws.send(json.dumps({"id": self.mid, "method": method, "params": params or {}}))
        while True:
            msg = json.loads(self.ws.recv())
            if msg.get("id") == self.mid:
                if "error" in msg:
                    raise RuntimeError(f"{method}: {msg['error']}")
                return msg.get("result", {})

    def close(self):
        try:
            self.ws.close()
        except Exception:
            pass


def fetch_html(url, wait_sec=8.0):
    assert_allowed_fetch_url(url)
    tab = Tab()
    try:
        tab.call("Page.enable")
        tab.call("Network.enable")
        tab.call("Emulation.setUserAgentOverride", {"userAgent": UA, "acceptLanguage": "en-US,en;q=0.9"})
        tab.call("Page.navigate", {"url": "about:blank"})
        time.sleep(0.5)
        tab.call("Page.navigate", {"url": url})
        time.sleep(wait_sec)
        for _ in range(12):
            info = json.loads(tab.call("Runtime.evaluate", {
                "expression": "JSON.stringify({t:document.title,r:document.readyState,"
                              "n:document.body?document.body.innerText.length:0})",
                "returnByValue": True})["result"]["value"])
            if "Checking your browser" not in info["t"] and info["r"] == "complete" and info["n"] > 200:
                break
            time.sleep(3)
        html = tab.call("Runtime.evaluate", {
            "expression": "document.documentElement.outerHTML",
            "returnByValue": True})["result"]["value"]
        return html
    finally:
        tab.close()


def get_cookies():
    tab = Tab()
    try:
        tab.call("Network.enable")
        return tab.call("Network.getAllCookies").get("cookies", [])
    finally:
        tab.close()


def save_page(url, wait_sec=8.0):
    page = fetch_html(url, wait_sec)
    name = derive_output_name(url)
    os.makedirs("pages", exist_ok=True)
    with open(os.path.join("pages", name), "w", encoding="utf-8") as f:
        f.write(page)
    print(f"saved {len(page)} chars -> pages/{name}")
    return name


def load_batch_urls():
    """Batch list is always the fixed file urls.txt beside this script."""
    with open("urls.txt", "r", encoding="utf-8") as f:
        return [line.strip() for line in f if line.strip() and not line.startswith("#")]


if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    if len(sys.argv) > 1 and sys.argv[1] == "--batch":
        urls = load_batch_urls()
        ok = fail = 0
        for i, u in enumerate(urls, 1):
            try:
                save_page(u)
                ok += 1
            except Exception as e:
                print(f"FAIL [{i}/{len(urls)}] {u}: {e}")
                fail += 1
        print(f"batch done: {ok} ok, {fail} failed")
    else:
        if len(sys.argv) < 2:
            print("usage: cdp_fetch.py <url> | cdp_fetch.py --batch")
            sys.exit(2)
        wait = float(sys.argv[2]) if len(sys.argv) > 2 else 8.0
        save_page(sys.argv[1], wait)
