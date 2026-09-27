#!/usr/bin/env python3
"""Generates public/sitemap.xml from the ported page list (P1 URL scheme: /page.html)."""
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
PAGES_DIR = REPO / 'apps' / 'web' / 'src' / 'pages'
SITE = 'https://www.twinmos.com/'
PRIORITY = {'index.html': ('1.0', 'daily'), 'shop.html': ('0.9', 'daily'), 'product.html': ('0.9', 'weekly'),
            'support.html': ('0.9', 'weekly'), 'learn.html': ('0.9', 'weekly'), '404.html': None}


def main() -> int:
    urls = []
    for f in sorted(PAGES_DIR.glob('*.astro')):
        page = f.stem + '.html'
        spec = PRIORITY.get(page, ('0.7', 'weekly'))
        if spec is None:
            continue  # 404 not listed
        # homepage is the site root, matching the canonical in Layout.astro
        loc = SITE if page == 'index.html' else SITE + page
        urls.append(f'  <url><loc>{loc}</loc><changefreq>{spec[1]}</changefreq><priority>{spec[0]}</priority></url>')
    # P4 locale landings (/{code}.html from the [locale] dynamic route) —
    # discoverable alternates of the homepage; lower priority than the EN root.
    for code in ('ar', 'hi', 'ru', 'zh-cn', 'fr', 'es', 'pt', 'de'):
        urls.append(f'  <url><loc>{SITE}{code}.html</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>')
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + '\n'.join(urls) + '\n</urlset>\n'
    out = REPO / 'apps' / 'web' / 'public' / 'sitemap.xml'
    out.write_text(xml, encoding='utf-8', newline='\n')
    print(f'[sitemap] {len(urls)} urls -> {out}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
