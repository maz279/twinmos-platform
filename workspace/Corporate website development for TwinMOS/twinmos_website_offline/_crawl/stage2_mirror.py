#!/usr/bin/env python3
"""
TwinMOS website mirror - Stage 2: full mirror.

- Downloads every sitemap page + discovered internal pages (robots.txt honored).
- Saves HTML under website/<url-path>/index.html.
- Discovers and downloads all site assets: css, js, images (incl. srcset and
  lazy-loaded variants), fonts, pdf/zip attachments, inline CSS url() targets.
- Parses downloaded CSS for url() references (fonts, background images).
- Resumable: skips files already present. Writes _crawl/manifest.json.
"""
import concurrent.futures
import json
import posixpath
import re
import threading
import time
import urllib.parse
from pathlib import Path

from safehttp import fetch, CONFIG

CRAWL_DIR = Path(__file__).resolve().parent
# Windows MAX_PATH (260) workaround: the target folder is deep and post slugs
# are long, so switch to extended-length path form for everything we create.
ROOT = Path("\\\\?\\" + str(CRAWL_DIR.parent))
WEB = ROOT / "website"
BASE = CONFIG["base"]
HOSTS = ("www.twinmos.com", "twinmos.com")

MAX_FILE_BYTES = 150 * 1024 * 1024  # skip gigantic files, log them

# robots.txt disallow + utility pages that make no sense offline
PAGE_EXCLUDE = [
    "/wp-admin/", "/wp-login.php", "/cart/", "/checkout/", "/my-account/",
    "/wp-content/uploads/wc-logs/", "/wp-content/uploads/woocommerce_transient_files/",
    "/wp-content/uploads/woocommerce_uploads/",
]
PAGE_EXCLUDE_QUERY = ("add-to-cart", "replytocom", "share=", "remove_item", "s=")

manifest_lock = threading.Lock()
manifest = []          # [{url, path, kind, status, bytes, note}]
stats = {"pages": 0, "assets": 0, "skipped": 0, "failed": 0}


def log(msg):
    print(msg, flush=True)


def normalize(url: str, base: str = BASE) -> tuple[str, str] | None:
    """Return (absolute_url, url_path) for twinmos URLs, else None.
    Drops fragment; keeps query (assets: query stripped at save time)."""
    url = url.strip()
    if not url or url.startswith(("#", "mailto:", "tel:", "javascript:", "data:", "blob:")):
        return None
    if url.startswith("//"):
        url = "https:" + url
    p = urllib.parse.urlparse(url)
    if not p.scheme:
        p = urllib.parse.urlparse(urllib.parse.urljoin(base, url))
    if p.scheme not in ("http", "https") or p.netloc not in HOSTS:
        return None
    if p.scheme == "http":
        url = "https://" + url[len("http://"):]
        p = urllib.parse.urlparse(url)
    path = p.path or "/"
    return f"https://www.twinmos.com{path}{'?' + p.query if p.query else ''}", path


def page_allowed(path: str, query: str) -> bool:
    if any(x in path for x in PAGE_EXCLUDE):
        return False
    if query and any(k in query for k in PAGE_EXCLUDE_QUERY):
        return False
    if path.endswith((".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".css", ".js",
                      ".pdf", ".zip", ".mp4", ".webm", ".ico", ".woff", ".woff2", ".ttf",
                      ".eot", ".otf", ".xml", ".txt", ".json", ".rar", ".7z", ".doc",
                      ".docx", ".xls", ".xlsx")):
        return False
    return True


def asset_kind(path: str) -> str:
    ext = posixpath.splitext(path)[1].lower()
    if ext in (".css",):
        return "css"
    if ext in (".js", ".mjs"):
        return "js"
    if ext in (".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".bmp", ".ico", ".avif"):
        return "image"
    if ext in (".woff", ".woff2", ".ttf", ".eot", ".otf"):
        return "font"
    if ext in (".mp4", ".webm", ".mov"):
        return "video"
    if ext == ".pdf":
        return "pdf"
    return "asset"


def local_path_for(path: str, query: str, kind_hint: str | None = None) -> Path:
    """Map URL path (+query) to local file under website/."""
    # strip trailing query for cache-busted assets (css/js ?ver=...)
    rel = path.lstrip("/")
    if rel == "":
        rel = "index.html"
    elif rel.endswith("/"):
        rel += "index.html"
    # avoid windows-illegal chars
    rel = re.sub(r'[<>:"|?*]', "_", rel)
    return WEB / rel


def record(url, path, kind, status, size, note=""):
    with manifest_lock:
        manifest.append(
            {"url": url, "path": str(path.relative_to(ROOT)) if path else "",
             "kind": kind, "status": status, "bytes": size, "note": note}
        )


def download(url: str, target: Path, kind: str, referer: str) -> bool:
    if target.exists() and target.stat().st_size > 0:
        return True  # resumed run
    try:
        target.parent.mkdir(parents=True, exist_ok=True)
        data, status, ctype = fetch(url, binary=True, retries=3, referer=referer)
        if data is None or status != 200:
            stats["failed"] += 1
            record(url, target, kind, f"http_{status}", 0)
            return False
        if len(data) > MAX_FILE_BYTES:
            stats["skipped"] += 1
            record(url, target, kind, "too_large", len(data))
            return False
        target.write_bytes(data)
    except OSError as exc:
        stats["failed"] += 1
        record(url, target, kind, "io_error", 0, str(exc)[:200])
        return False
    stats["assets"] += 1
    record(url, target, kind, "ok", len(data))
    return True


# ---------------- HTML parsing ----------------

ATTR_RE = re.compile(
    r"""(?:src|href|data-src|data-href|data-bg|data-bg-src|data-large_image|poster|content)=["']([^"']+)["']""",
    re.IGNORECASE,
)
SRCSET_RE = re.compile(
    r"""(?:srcset|data-srcset|data-lazy-srcset|imagesrcset)=["']([^"']+)["']""",
    re.IGNORECASE,
)
CSS_URL_RE = re.compile(r"""url\(\s*(['"]?)([^'")]+)\1\s*\)""", re.IGNORECASE)
A_HREF_RE = re.compile(r"""<a\b[^>]*?href=["']([^"']+)["']""", re.IGNORECASE)
SCRIPT_SRC_RE = re.compile(r"""<script\b[^>]*?src=["']([^"']+)["']""", re.IGNORECASE)


def extract_assets(html: str, page_url: str) -> set[str]:
    """All asset URLs referenced by an HTML document."""
    found = set()
    for m in ATTR_RE.finditer(html):
        u = normalize(m.group(1), page_url)
        if u:
            found.add(u[0])
    for m in SRCSET_RE.finditer(html):
        for cand in m.group(1).split(","):
            parts = cand.strip().split()
            if parts:
                u = normalize(parts[0], page_url)
                if u:
                    found.add(u[0])
    for m in CSS_URL_RE.finditer(html):
        u = normalize(m.group(2), page_url)
        if u:
            found.add(u[0])
    # JSON-LD image strings
    for m in re.finditer(r'"https?://[^"]*?/wp-content/uploads/[^"]+"', html):
        u = normalize(m.group(0).strip('"'))
        if u:
            found.add(u[0])
    return found


def extract_links(html: str, page_url: str) -> set[str]:
    """Internal page links worth mirroring."""
    found = set()
    for m in A_HREF_RE.finditer(html):
        n = normalize(m.group(1), page_url)
        if not n:
            continue
        url, path = n
        p = urllib.parse.urlparse(url)
        if page_allowed(path, p.query):
            found.add(f"https://www.twinmos.com{path}")
    return found


def css_assets(css_text: str, css_url: str) -> set[str]:
    found = set()
    for m in CSS_URL_RE.finditer(css_text):
        u = normalize(m.group(2), css_url)
        if u:
            found.add(u[0])
    for m in re.finditer(r'@import\s+(?:url\()?["\']?([^"\')\s;]+)', css_text, re.IGNORECASE):
        u = normalize(m.group(1), css_url)
        if u:
            found.add(u[0])
    return found


# ---------------- main ----------------

def main():
    WEB.mkdir(parents=True, exist_ok=True)
    inventory = json.loads((CRAWL_DIR / "url_inventory.json").read_text(encoding="utf-8"))

    # ---- pass 1: pages (sitemap first, then discovered) ----
    page_queue = [item["url"] for item in inventory]
    seen_pages = set(u.rstrip("/") for u in page_queue)
    asset_queue = {}  # url -> referer
    seen_assets = set()
    pending_css = []  # (url, local path)

    def queue_assets(urls, referer):
        for u in urls:
            if u in seen_assets:
                continue
            p = urllib.parse.urlparse(u)
            if any(x in p.path for x in PAGE_EXCLUDE):
                continue
            seen_assets.add(u)
            asset_queue[u] = referer

    idx = 0
    while idx < len(page_queue):
        url = page_queue[idx]
        idx += 1
        path = urllib.parse.urlparse(url).path
        target = local_path_for(path, "", "page")
        if not (target.exists() and target.stat().st_size > 0):
            html, status, _ = fetch(url, retries=3)
            if html is None or status != 200:
                stats["failed"] += 1
                record(url, target, "page", f"http_{status}", 0)
                continue
            try:
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(html.encode("utf-8", errors="replace"))
            except OSError as exc:
                stats["failed"] += 1
                record(url, target, "page", "io_error", 0, str(exc)[:200])
                continue
            stats["pages"] += 1
            record(url, target, "page", "ok", len(html))
            log(f"[page {idx}/{len(page_queue)}] {path}")
        else:
            html = target.read_text(encoding="utf-8", errors="replace")

        queue_assets(extract_assets(html, url), url)
        for link in extract_links(html, url):
            key = link.rstrip("/")
            if key not in seen_pages:
                seen_pages.add(key)
                page_queue.append(link)
        time.sleep(0.15)

    log(f"\npages done: {stats['pages']} downloaded, queue total {len(page_queue)}")

    # ---- pass 2: assets ----
    asset_list = list(asset_queue.items())
    log(f"downloading {len(asset_list)} assets...")

    def worker(item):
        url, referer = item
        p = urllib.parse.urlparse(url)
        kind = asset_kind(p.path)
        # save without query (cache-busting only); keep it if path has no ext
        target = local_path_for(p.path, p.query, kind)
        ok = download(url, target, kind, referer)
        if ok and kind == "css":
            with manifest_lock:
                pending_css.append((url, target))
        time.sleep(0.12)

    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as ex:
        list(ex.map(worker, asset_list))

    # ---- pass 3: assets referenced inside CSS (fonts, bg images) ----
    log(f"parsing {len(pending_css)} css files for url() refs...")
    css_round2 = {}
    for url, target in pending_css:
        try:
            css = target.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        for u in css_assets(css, url):
            if u not in seen_assets:
                p = urllib.parse.urlparse(u)
                if any(x in p.path for x in PAGE_EXCLUDE):
                    continue
                seen_assets.add(u)
                css_round2[u] = url
    log(f"css round-2 assets: {len(css_round2)}")

    def worker2(item):
        url, referer = item
        p = urllib.parse.urlparse(url)
        target = local_path_for(p.path, p.query, asset_kind(p.path))
        download(url, target, asset_kind(p.path), referer)
        time.sleep(0.12)

    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as ex:
        list(ex.map(worker2, css_round2.items()))

    # ---- save manifest ----
    (CRAWL_DIR / "manifest.json").write_text(
        json.dumps({"stats": stats, "files": manifest}, indent=1), encoding="utf-8"
    )
    log(f"\nDONE stats={stats}")
    log(f"pages in final queue: {len(page_queue)}, assets seen: {len(seen_assets)}")


if __name__ == "__main__":
    main()
