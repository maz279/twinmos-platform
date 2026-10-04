#!/usr/bin/env python3
"""
Stage 3: structured product data extraction from the mirrored TwinMOS site.

Reads website/product/*/index.html + product-category pages (local files only,
no network) and produces:
  product_data/products.json    - full structured product records
  product_data/categories.json  - product category tree with product lists
  product_data/catalog.md       - human-readable catalog
  product_data/missing_assets.txt - referenced images not found locally
"""
import base64
import html as htmllib
import json
import posixpath
import re
import urllib.parse
from pathlib import Path

ROOT = Path("\\\\?\\" + str(Path(__file__).resolve().parent.parent))
WEB = ROOT / "website"
OUT = ROOT / "product_data"
OUT.mkdir(parents=True, exist_ok=True)
ORIGIN = "https://www.twinmos.com"

TAG_RE = re.compile(r"<[^>]+>")
WS_RE = re.compile(r"\s+")


def clean_text(s):
    if not s:
        return ""
    s = TAG_RE.sub(" ", s)
    s = htmllib.unescape(s)
    return WS_RE.sub(" ", s).strip()


def to_local(url):
    """Map a twinmos URL to its local mirror path (or None)."""
    p = urllib.parse.urlparse(url)
    rel = posixpath.normpath(p.path or "/").lstrip("/")
    rel = re.sub(r'[<>:"|?*\x00-\x1f]', "_", rel)
    if rel == "":
        rel = "index.html"
    elif rel.endswith("/"):
        rel += "index.html"
    lp = WEB / rel
    return lp if lp.exists() else None


def strip_proto(url):
    p = urllib.parse.urlparse(url)
    return p.path


def parse_jsonld(html):
    out = []
    for m in re.finditer(
        r'<script type="application/ld\+json"[^>]*>(.*?)</script>', html, re.S
    ):
        raw = m.group(1).strip()
        # Rank Math sometimes embeds base64 payloads
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            try:
                data = json.loads(base64.b64decode(raw).decode("utf-8", "replace"))
            except Exception:
                continue
        out.append(data)
    return out


def find_nodes(data, type_name):
    """Yield nodes of given @type from arbitrary JSON-LD structure."""
    if isinstance(data, dict):
        types = data.get("@type", [])
        if isinstance(types, str):
            types = [types]
        if type_name in types:
            yield data
        for v in data.values():
            yield from find_nodes(v, type_name)
    elif isinstance(data, list):
        for item in data:
            yield from find_nodes(item, type_name)


def meta_content(html, name):
    for pattern in (
        rf'<meta property="{name}" content="([^"]*)"',
        rf'<meta name="{name}" content="([^"]*)"',
        rf'<meta content="([^"]*)" property="{name}"',
    ):
        m = re.search(pattern, html)
        if m:
            return htmllib.unescape(m.group(1))
    return ""


def extract_gallery(html, page_url):
    """All gallery image URLs (srcset originals + data-large_image)."""
    urls = set()
    for m in re.finditer(
        r'class="[^"]*woocommerce-product-gallery__image[^"]*".*?</figure>', html, re.S
    ):
        block = m.group(0)
        for a in re.finditer(
            r'data-large_image="([^"]+)"|srcset="([^"]+)"|src="([^"]+)"', block
        ):
            val = a.group(1) or a.group(2) or a.group(3)
            if not val:
                continue
            for cand in val.split(","):
                u = cand.strip().split()
                if not u:
                    continue
                n = urllib.parse.urljoin(page_url, u[0])
                if "/wp-content/uploads/" in n:
                    urls.add(n)
    # also og:image and JSON-LD images handled elsewhere
    return sorted(urls)


def extract_spec_table(html):
    """WooCommerce product attributes table -> [{label, value}]."""
    rows = []
    for tm in re.finditer(r"<th[^>]*>(.*?)</th>\s*<td[^>]*>(.*?)</td>", html, re.S):
        label = clean_text(tm.group(1))
        value = clean_text(tm.group(2))
        if label and value and len(label) < 60:
            rows.append({"label": label, "value": value})
    # de-dup preserving order
    seen = set()
    out = []
    for r in rows:
        key = (r["label"], r["value"])
        if key in seen:
            continue
        # drop rows that are actually CSS/JS fragments caught in the table markup
        if "{" in r["value"] or r["value"].startswith(".") or "important" in r["value"]:
            continue
        seen.add(key)
        out.append(r)
    return out


def extract_pdfs(html, page_url):
    urls = set()
    for m in re.finditer(r'href="([^"]+\.pdf[^"#?]*)"', html, re.I):
        n = urllib.parse.urljoin(page_url, m.group(1))
        p = urllib.parse.urlparse(n)
        if p.netloc.endswith("twinmos.com"):
            urls.add(f"https://www.twinmos.com{p.path}")
    return sorted(urls)


def image_group(image_urls):
    """Group srcset variants; identify primary (original, no -WxH suffix)."""
    by_base = {}
    for u in image_urls:
        path = urllib.parse.urlparse(u).path
        name = posixpath.basename(path)
        base = re.sub(r"-\d+x\d+(?=\.[a-zA-Z]+$)", "", name)
        by_base.setdefault(base, []).append(u)
    groups = []
    for base, urls in sorted(by_base.items()):
        original = next(
            (u for u in urls
             if not re.search(r"-\d+x\d+(\.[a-zA-Z]+)$", urllib.parse.urlparse(u).path)),
            urls[-1],
        )
        groups.append({
            "base_name": base,
            "original": original,
            "variants": sorted(urls),
        })
    return groups


def process_product(path: Path, slug: str):
    url = f"{ORIGIN}/product/{slug}/"
    html = path.read_text(encoding="utf-8", errors="replace")

    product = {
        "slug": slug,
        "source_url": url,
        "local_page": str(Path(str(path).replace("\\\\?\\", "")).relative_to(
            Path(str(path).replace("\\\\?\\", "")).parent.parent)),
    }

    # --- JSON-LD Product ---
    for chunk in parse_jsonld(html):
        for node in find_nodes(chunk, "Product"):
            product["name"] = clean_text(node.get("name", ""))
            desc = node.get("description", "")
            product["jsonld_description"] = clean_text(desc) if isinstance(desc, str) else ""
            product["sku"] = node.get("sku", "") or ""
            imgs = node.get("image", [])
            if isinstance(imgs, str):
                imgs = [imgs]
            product["jsonld_images"] = [u for u in imgs if isinstance(u, str)]
            offers = node.get("offers", {})
            if isinstance(offers, list):
                offers = offers[0] if offers else {}
            if isinstance(offers, dict):
                product["price"] = offers.get("price", "") or offers.get("lowPrice", "")
                product["currency"] = offers.get("priceCurrency", "")
                product["availability"] = offers.get("availability", "")
            brand = node.get("brand", "")
            if isinstance(brand, dict):
                brand = brand.get("name", "")
            product["brand"] = brand if isinstance(brand, str) else ""

    # --- breadcrumb via JSON-LD BreadcrumbList (accurate) ---
    cats = []
    for chunk in parse_jsonld(html):
        for node in find_nodes(chunk, "BreadcrumbList"):
            for item in node.get("itemListElement", []):
                item_obj = item.get("item", item) if isinstance(item, dict) else {}
                url_i = item_obj.get("@id", "") or item_obj.get("item", "")
                name_i = item_obj.get("name", "")
                if isinstance(url_i, str) and "/product-category/" in url_i:
                    slug_c = re.search(r'/product-category/([^/"]+)/', url_i + "/")
                    cats.append({"slug": slug_c.group(1) if slug_c else "", "name": clean_text(name_i)})
    if not cats:  # fallback: WooCommerce posted_in block
        m = re.search(r'class="[^"]*posted_in[^"]*"[^>]*>(.*?)</div>', html, re.S)
        if m:
            for a in re.finditer(r'href="https://www\.twinmos\.com/product-category/([^"/]+)/[^"]*"[^>]*>([^<]+)<', m.group(0)):
                cats.append({"slug": a.group(1), "name": clean_text(a.group(2))})
    dedup = []
    for c in cats:
        if c not in dedup:
            dedup.append(c)
    product["categories"] = dedup

    # --- meta ---
    product["meta_title"] = meta_content(html, "og:title")
    product["meta_description"] = meta_content(html, "og:description") or meta_content(
        html, "description"
    )
    product["og_image"] = meta_content(html, "og:image")

    # --- gallery + spec + pdf ---
    gallery = extract_gallery(html, url)
    all_imgs = sorted(set(gallery) | set(product.get("jsonld_images", [])) | {product["og_image"]} - {""})
    product["image_groups"] = image_group([u for u in all_imgs if u])

    specs = extract_spec_table(html)
    product["specifications"] = specs
    product["datasheets"] = extract_pdfs(html, url)

    # --- local existence check ---
    missing = []
    for grp in product["image_groups"]:
        if to_local(grp["original"]) is None:
            missing.append(grp["original"])
    product["missing_images"] = missing

    # short description block (Elementor/Woo DOM)
    m = re.search(
        r'class="[^"]*woocommerce-product-details__short-description[^"]*"[^>]*>(.*?)</div>',
        html, re.S,
    )
    if m:
        product["short_description"] = clean_text(m.group(1))
    return product


def process_category(path: Path, parts):
    url = ORIGIN + "/product-category/" + "/".join(parts) + "/"
    html = path.read_text(encoding="utf-8", errors="replace")
    title = re.search(r"<title>(.*?)</title>", html, re.S)
    desc = re.search(
        r'<div class="[^"]*term-description[^"]*"[^>]*>(.*?)</div>', html, re.S
    )
    prods = []
    for m in re.finditer(r'href="(https://www\.twinmos\.com/product/([^"/]+)/)"', html):
        if m.group(2) not in [p[0] for p in prods]:
            prods.append((m.group(2), m.group(1)))
    return {
        "path": "/".join(parts),
        "name": clean_text(title.group(1)).replace(" - TwinMOS Technologies", "")
        if title
        else parts[-1],
        "description": clean_text(desc.group(1)) if desc else "",
        "source_url": url,
        "product_slugs": [p[0] for p in prods],
    }


def main():
    products = []
    prod_dir = WEB / "product"
    for d in sorted(prod_dir.iterdir()):
        idx = d / "index.html"
        if idx.is_file():
            products.append(process_product(idx, d.name))
    print(f"products: {len(products)}")

    categories = []
    cat_root = WEB / "product-category"
    if cat_root.exists():
        for idx in sorted(cat_root.rglob("index.html")):
            rel = idx.parent.relative_to(cat_root)
            parts = rel.parts
            if parts and all(p for p in parts):
                categories.append(process_category(idx, parts))
    print(f"categories: {len(categories)}")

    (OUT / "products.json").write_text(
        json.dumps(products, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    (OUT / "categories.json").write_text(
        json.dumps(categories, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    # missing assets report
    missing = sorted({m for p in products for m in p["missing_images"]})
    (OUT / "missing_assets.txt").write_text("\n".join(missing), encoding="utf-8")
    print(f"missing images referenced by products: {len(missing)}")

    # catalog.md
    lines = [
        "# TwinMOS Product Catalog (extracted from www.twinmos.com)",
        "",
        f"Extracted: 2026-09-23 | Products: {len(products)} | Categories: {len(categories)}",
        "",
        "## Categories",
        "",
    ]
    for c in categories:
        lines.append(f"- **{c['name']}** (`{c['path']}`) — {len(c['product_slugs'])} products")
    lines += ["", "---", ""]
    for p in products:
        lines.append(f"## {p.get('name') or p['slug']}")
        lines.append(f"- Slug: `{p['slug']}`")
        lines.append(f"- Source: {p['source_url']}")
        if p.get("sku"):
            lines.append(f"- SKU: {p['sku']}")
        if p.get("price"):
            lines.append(f"- Price: {p['price']} {p.get('currency','')}")
        if p.get("availability"):
            lines.append(f"- Availability: {p['availability'].split('/')[-1]}")
        if p.get("categories"):
            lines.append(
                "- Categories: " + ", ".join(c["name"] for c in p["categories"])
            )
        if p.get("short_description"):
            lines.append(f"- Summary: {p['short_description']}")
        imgs = p.get("image_groups", [])
        if imgs:
            lines.append(f"- Images ({len(imgs)} sets):")
            for g in imgs[:10]:
                flag = "OK" if not p["missing_images"] or g["original"] not in p["missing_images"] else "MISSING"
                lines.append(f"  - `{g['original']}` [{flag}, {len(g['variants'])} size variants]")
        if p.get("specifications"):
            lines.append("- Specifications:")
            for s in p["specifications"]:
                lines.append(f"  - {s['label']}: {s['value']}")
        if p.get("datasheets"):
            lines.append("- Datasheets: " + ", ".join(f"`{d}`" for d in p["datasheets"]))
        if p.get("jsonld_description"):
            lines.append("- Description: " + p["jsonld_description"][:500])
        lines.append("")
    (OUT / "catalog.md").write_text("\n".join(lines), encoding="utf-8")
    print("wrote products.json, categories.json, catalog.md, missing_assets.txt")


if __name__ == "__main__":
    main()
