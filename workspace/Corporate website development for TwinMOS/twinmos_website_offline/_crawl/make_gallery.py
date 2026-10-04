#!/usr/bin/env python3
"""Generate a browsable HTML gallery of all product images from products.json."""
import html
import json
import urllib.parse
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
products = json.loads((ROOT / "product_data" / "products.json").read_text(encoding="utf-8"))

def to_rel(url):
    p = urllib.parse.urlparse(url)
    rel = p.path.lstrip("/")
    return "../website/" + rel

cards = []
for pr in products:
    imgs = []
    for g in pr.get("image_groups", []):
        orig = to_rel(g["original"])
        # prefer a mid-size variant as the displayed thumb (faster), fall back to original
        thumb = orig
        for v in g["variants"]:
            if "-600x600" in v:
                thumb = to_rel(v)
                break
        imgs.append((thumb, orig, g["base_name"], len(g["variants"])))
    specs = "; ".join(f"{s['label']}: {s['value']}" for s in pr.get("specifications", [])[:4])
    figs = "".join(
        f'<figure><a href="{html.escape(o)}" target="_blank"><img src="{html.escape(t)}" loading="lazy" '
        f'alt="{html.escape(html.escape(n))}"></a><figcaption>{html.escape(n)} '
        f"<small>({v} sizes)</small></figcaption></figure>"
        for t, o, n, v in imgs
    )
    cards.append(
        "<section class='card'><h2>" + html.escape(pr.get("name") or pr["slug"]) + "</h2>"
        + f"<p class='meta'>SKU: {html.escape(pr.get('sku','') or '—')} | "
        + html.escape(", ".join(c["name"] for c in pr.get("categories", [])) or "—")
        + "</p>"
        + (f"<p class='specs'>{html.escape(specs)}</p>" if specs else "")
        + f"<div class='grid'>{figs}</div></section>"
    )

page = f"""<!doctype html><html><head><meta charset="utf-8">
<title>TwinMOS Product Image Gallery (offline)</title>
<style>
body{{font-family:Segoe UI,Arial,sans-serif;margin:24px;background:#f5f6f8;color:#222}}
h1{{font-size:22px}} .note{{color:#666;margin-bottom:24px}}
.card{{background:#fff;border-radius:10px;padding:18px 20px;margin-bottom:28px;box-shadow:0 1px 4px rgba(0,0,0,.08)}}
.card h2{{font-size:17px;margin:0 0 4px}} .meta{{color:#555;font-size:12.5px;margin:0 0 2px}}
.specs{{color:#777;font-size:12px;margin:0 0 12px}}
.grid{{display:flex;flex-wrap:wrap;gap:10px}}
figure{{margin:0;width:180px;text-align:center}}
img{{width:180px;height:180px;object-fit:contain;background:#fafafa;border:1px solid #e6e6e6;border-radius:6px}}
figcaption{{font-size:10.5px;color:#666;margin-top:4px;word-break:break-all}}
</style></head><body>
<h1>TwinMOS Product Image Gallery</h1>
<p class="note">{len(products)} products — click any image to view the full-size original.
Files live under <code>twinmos_website_offline/website/wp-content/uploads/</code> (year/month folders).</p>
{''.join(cards)}
</body></html>"""

out = ROOT / "product_data" / "image_gallery.html"
out.write_text(page, encoding="utf-8")
print("gallery written:", out, "| products:", len(products),
      "| total image sets:", sum(len(p.get('image_groups', [])) for p in products))
