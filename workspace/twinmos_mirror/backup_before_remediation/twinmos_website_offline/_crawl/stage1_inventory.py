#!/usr/bin/env python3
"""
TwinMOS website mirror - Stage 1: URL inventory from sitemaps.
Reads all sitemap XMLs, extracts every <loc> URL, dedupes, classifies,
and writes _crawl/url_inventory.json.
"""
import json
import re
import urllib.parse
from pathlib import Path

from safehttp import fetch, CONFIG

CRAWL_DIR = Path(__file__).parent
BASE = CONFIG["base"]


def main():
    urls = {}  # url -> {"source": sitemap}

    index_xml, status, _ = fetch(f"{BASE}/sitemap_index.xml")
    child_sitemaps = []
    if index_xml and status == 200:
        child_sitemaps = [u for u in re.findall(r"<loc>([^<]+)</loc>", index_xml)]
    print(f"sitemap index lists {len(child_sitemaps)} child sitemaps")

    # Rank Math pagination: also try numbered pages (product-sitemap1.xml, ...)
    to_fetch = list(child_sitemaps)
    for child in child_sitemaps:
        stem = child.rsplit(".", 1)[0]  # strip .xml
        for i in range(1, 10):
            to_fetch.append(f"{stem}{i}.xml")

    for sm_url in to_fetch:
        name = sm_url.replace(BASE + "/", "").replace("/", "_")
        xml, st, _ = fetch(sm_url)
        if not xml or st != 200 or "<loc>" not in xml:
            continue
        locs = re.findall(r"<loc>([^<]+)</loc>", xml)
        new = 0
        for u in locs:
            if u.endswith(".xml"):
                continue
            if u not in urls:
                urls[u] = {"source": name}
                new += 1
        (CRAWL_DIR / name).write_text(xml, encoding="utf-8")
        print(f"{name}: {len(locs)} locs ({new} new)")

    # classify
    inventory = []
    for u, meta in urls.items():
        path = urllib.parse.urlparse(u).path
        if path.startswith("/product/"):
            kind = "product"
        elif "/product-category/" in path:
            kind = "product_category"
        elif re.search(r"/\d{4}/\d{2}/", path):
            kind = "post"
        elif path.startswith("/category/"):
            kind = "category"
        else:
            kind = "page"
        inventory.append({"url": u, "kind": kind, "source": meta["source"]})

    counts = {}
    for item in inventory:
        counts[item["kind"]] = counts.get(item["kind"], 0) + 1
    print("\nURL inventory:", counts)
    (CRAWL_DIR / "url_inventory.json").write_text(
        json.dumps(inventory, indent=2), encoding="utf-8"
    )
    print(f"total: {len(inventory)} URLs -> url_inventory.json")


if __name__ == "__main__":
    main()
