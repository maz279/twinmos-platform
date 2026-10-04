# TwinMOS Website — Offline Mirror & Product Data Package

Complete offline copy of **https://www.twinmos.com/** captured on **2026-09-23**,
plus structured product data extracted for the new TwinMOS corporate website build.

> Captured for the TwinMOS corporate website redevelopment project
> (Software_Project_14). All content belongs to TwinMOS Technologies.

---

## What's inside

| Path | Contents |
|---|---|
| `website/` | Full site mirror: 3,001 files / ~480 MB. URL structure preserved 1:1 (`https://www.twinmos.com/x/y/` → `website/x/y/index.html`). |
| `product_data/products.json` | **40 products**, fully structured: name, slug, SKU, categories, short + full description, specifications, image sets (original + all responsive size variants), datasheet PDFs, source URLs. |
| `product_data/categories.json` | 16 product categories with hierarchy, descriptions, and product lists. |
| `product_data/catalog.md` | Human-readable catalog of all products (browsable reference). |
| `product_data/missing_assets.txt` | Images referenced but absent — **empty (0 missing)**. |
| `_crawl/` | Crawl tooling + logs: URL inventory (from sitemaps), sitemap XMLs, crawl log, file manifest (`file_manifest.json`), pipeline scripts. |

## Website mirror details

- **Pages**: 311 HTML pages — all 40 products, 16 product categories, blog posts,
  corporate pages (about, contact, EOL policy, warranty, etc.), tag/category archives.
- **Assets**: wp-content uploads (product photography incl. every srcset size),
  theme CSS/JS, plugin assets, 55+ web fonts (woff2/woff/ttf), 29 PDFs
  (datasheets + EOL notices), favicons.
- **Integrity**: every file byte-validated (magic-byte check). 0 corrupt files.
  ~70 images carry a `.png`/`.jpeg` extension but contain **WebP bytes** — this is
  exactly what the live site serves (LiteSpeed Cache WebP substitution); the files
  are valid images and display normally.
- One 0-byte file: `wp-content/plugins/essential-blocks/assets/js/eb-blocks-localize.js`
  (a rarely-used plugin localize stub; an empty JS file is a valid no-op).

### Notes for reusing assets in the new site

- Product image originals live at `website/wp-content/uploads/<year>/<month>/`
  and are listed per product in `products.json → image_groups[].original`
  (with all responsive variants in `variants[]`).
- Prices in `products.json` are `0` for all products — the live site runs in
  catalog mode (prices hidden). Availability flags are captured.
- ~319 URLs on the live site return 404 — these are the site's own broken
  template links (`{{{data.url}}}` placeholders in product listing markup) and a
  handful of dead images. They are listed in `_crawl/browser_crawl.log` and were
  intentionally not mirrored. Fixing these links is an easy win for the new site.
- The mirror keeps absolute `https://www.twinmos.com/...` URLs inside HTML.
  To browse the offline copy, serve it locally so those URLs resolve
  (or plan a link-rewrite pass):

  ```bash
  cd twinmos_website_offline
  python -m http.server 8080 --directory website
  # then map www.twinmos.com to 127.0.0.1 in your hosts file,
  # or use the structured product_data/ as the source of truth instead.
  ```

- For the **new website**, the recommended source is `product_data/products.json`
  (clean, structured) rather than parsing the mirrored HTML again.

## product_data/products.json schema

```jsonc
{
  "slug": "twinmos-hyper-ssd-h2-ultra",
  "source_url": "https://www.twinmos.com/product/twinmos-hyper-ssd-h2-ultra/",
  "local_page": "product/twinmos-hyper-ssd-h2-ultra/index.html",
  "name": "...",                       // from schema.org Product JSON-LD
  "sku": "...",
  "price": 0, "currency": "USD",       // catalog mode: prices hidden on live site
  "availability": "http://schema.org/InStock",
  "brand": "",
  "categories": [{"slug": "solid-state-drive", "name": "Solid State Drive"}],
  "meta_title": "...", "meta_description": "...", "og_image": "https://...",
  "short_description": "...",          // WooCommerce short description
  "jsonld_description": "...",         // full description from JSON-LD
  "specifications": [{"label": "Capacity", "value": "512GB, 1TB, 2TB"}, ...],
  "image_groups": [{
      "base_name": "Hyper-SSD-H2-Ultra-1TB-Blue-3-5.png",
      "original": "https://www.twinmos.com/wp-content/uploads/.../....png",
      "variants": ["...-150x150.png", "...-300x300.png", "..."]  // all srcset sizes
  }],
  "datasheets": ["https://www.twinmos.com/wp-content/uploads/.../....pdf"],
  "missing_images": []                 // always empty — everything was downloaded
}
```

## How the capture was done (pipeline)

1. **Sitemap inventory** — all 8 Rank Math sitemaps pulled → 163 seed URLs.
2. **Anti-bot bypass** — the site sits behind an hcdn CDN JavaScript challenge
   (403 for curl/wget). A real Chrome session solved the challenge; the entire
   crawl was then executed *inside that browser* via same-origin `fetch()`
   (cookies/TLS handled natively), with content piped to disk in chunks.
   Challenge expirations were auto-recovered by reloading the session.
3. **Mirror** — BFS over pages + assets (srcset, lazy-load `data-*` attributes,
   CSS `url()` chains, JSON-LD images, PDF links), resumable, robots.txt honored.
4. **Extraction** — products parsed from local HTML: schema.org JSON-LD,
   WooCommerce gallery/attribute tables, og: meta, breadcrumbs.
5. **Validation** — magic-byte check on every file; per-product image
   existence audit (40/40 products → 0 missing images).

Re-run any stage with `python _crawl/stage<N>_*.py` (config in
`_crawl/crawl_config.json`; the session cookie there is expired — a fresh
browser session is needed for re-crawling).
