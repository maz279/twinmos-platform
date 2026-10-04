# -*- coding: utf-8 -*-
"""Prototype builder — module 3: shared HTML chrome (head, header, footer, page shell).
No file I/O here: page() renders into PAGES_OUT; build.py flushes to disk."""
import html as H
import site_content as SC
import pb_images as PI

PAGES_OUT = {}

ASSET_V = '3'  # overwritten by build.py with a content hash on every rebuild

def logo_src():
    """Versioned logo URL — the logo is REGENERATED each build (transparent
    background), so it must cache-bust like CSS/JS or stale white-box copies
    survive in the browser. One helper feeds header, footer, drawer and every
    inline wordmark, so a logo change propagates to all 21 pages at once."""
    return PI.LOGO + '?v=' + ASSET_V

def brand(h=15, cls=''):
    """Inline TwinMOS wordmark logo (replaces the bare word in UI copy)."""
    return ('<img class="ilog%s" src="%s" alt="TwinMOS" style="height:%dpx;width:auto"'
            ' loading="lazy">' % ((' ' + cls) if cls else '', logo_src(), h))

def ilogo(txt, h=15):
    """Replace the first standalone 'TwinMOS' in a string with the logo mark."""
    return txt.replace('TwinMOS', brand(h), 1)

NAV_LINKS = [
    ('products', 'shop.html', 'Products', 'mega-products'),
    ('gaming',   'gaming.html', 'Gaming', 'mega-gaming'),
    ('solutions', 'solutions.html', 'Solutions', 'mega-solutions'),
    ('buy',      'where-to-buy.html', 'Where to Buy', 'mega-buy'),
    ('support',  'support.html', 'Support', 'mega-support'),
    ('company',  'about.html', 'Company', 'mega-company'),
]

MEGA_COLS = [
    ('Memories', [('dram-gaming', 'Gaming DRAM'), ('dram-desktop', 'Desktop DRAM'), ('dram-notebook', 'Notebook DRAM')]),
    ('Internal Storage', [('ssd-nvme', 'NVMe SSD'), ('ssd-sata', 'SATA SSD')]),
    ('Portable Storage', [('portable-ssd', 'Portable SSD'), ('portable-hdd', 'Portable HDD')]),
    ('Flash & More', [('flash', 'USB Flash Drive'), ('microsd', 'MicroSD Card'), ('psu', 'Power Supply'), ('hub', 'USB HUB')]),
]

ORG_LD = ('{"@context":"https://schema.org","@type":"Organization","name":"TwinMOS Technologies",'
          '"url":"https://www.twinmos.com/","logo":"https://www.twinmos.com/assets/img/logo.webp",'
          '"foundingDate":"1998","address":{"@type":"PostalAddress","addressLocality":"Taipei","addressCountry":"TW"},'
          '"sameAs":["https://www.facebook.com/twinmos.tech","https://www.instagram.com/twinmos.tech",'
          '"https://www.linkedin.com/company/twinmos-technologies","https://x.com/twinmos",'
          '"https://www.youtube.com/c/TwinMOStech","https://www.pinterest.com/twinmos"]}')
SITE_LD = ('{"@context":"https://schema.org","@type":"WebSite","name":"TwinMOS","url":"https://www.twinmos.com/",'
           '"potentialAction":{"@type":"SearchAction","target":"https://www.twinmos.com/search.html?q={q}",'
           '"query-input":"required name=q"}}')

def head(title, desc, dark=False):
    theme = '#0D0D0D' if dark else '#0A2540'
    bodycls = ' class="gaming"' if dark else ''
    swreg = ("if('serviceWorker' in navigator&&location.protocol.indexOf('http')===0){"
             "navigator.serviceWorker.register('sw.js').catch(function(){});}")
    return ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
            '<meta name="theme-color" content="' + theme + '">\n'
            '<meta name="description" content="' + H.escape(desc) + '">\n'
            '<link rel="icon" type="image/png" href="assets/img/favicon.png">\n'
            '<link rel="manifest" href="manifest.webmanifest">\n'
            '<title>' + H.escape(title) + '</title>\n'
            '<link rel="stylesheet" href="assets/css/main.css?v=' + ASSET_V + '">\n'
            '<script type="application/ld+json">' + ORG_LD + '</script>\n'
            '<script type="application/ld+json">' + SITE_LD + '</script>\n'
            '<script>' + swreg + '</script>\n</head>\n<body' + bodycls + '>\n'
            '<a class="skip-link" href="#main">Skip to main content</a>\n')

def mega_products():
    out = ['<div class="mega mega-wide" role="menu" aria-label="Products menu">']
    for h, items in MEGA_COLS:
        out.append('<div class="mega-col"><h4>%s</h4>' % h)
        for cid, label in items:
            out.append('<a role="menuitem" href="shop.html?cat=%s">%s</a>' % (cid, label))
        out.append('<a role="menuitem" href="shop.html" style="color:var(--accent-deep);font-weight:750">All products →</a></div>')
    out.append('<div class="mega-feature"><img src="' + PI.G5_IMG + '" alt="TwinMOS CoreX Pro PCIe Gen 5.0 NVMe SSD">'
               '<b>CoreX Pro — PCIe Gen 5.0</b>'
               '<span style="font-size:13px;color:var(--muted)">Up to 14,000 MB/s sequential read · 5-year warranty</span>'
               '<a class="link-arrow" href="product.html?id=corex-pro-m2-pcie-gen-5-0-nvme-ssd">View the flagship SSD</a></div>'
               '<div class="mega-all"><a role="menuitem" href="shop.html">Browse the full catalog — 39 products →</a>'
               '<span style="margin-left:auto;display:inline-flex;gap:16px;font-weight:650">'
               '<a role="menuitem" href="compare.html">Compare products</a>'
               '<a role="menuitem" href="compatibility.html">Compatibility finder</a></span></div></div>')
    return ''.join(out)

COMPANY_LINKS = [('about.html', 'About Us'), ('about.html#quality', 'Quality Assurance'),
                 ('technology.html', 'Technology &amp; R&amp;D'),
                 ('news.html', 'News &amp; Events'), ('careers.html', 'Careers'),
                 ('partners.html', 'Partners'), ('contact.html', 'Contact')]

def mega_company():
    groups = (
        ('Company', [('about.html', 'About Us'), ('technology.html', 'Technology &amp; R&amp;D'),
                     ('about.html#quality', 'Quality Assurance')]),
        ('People &amp; news', [('news.html', 'News &amp; Events'), ('careers.html', 'Careers'),
                     ('partners.html', 'Partners'), ('contact.html', 'Contact')]),
    )
    cols = ''.join(
        '<div class="mega-col"><h4>%s</h4>%s</div>' % (g, ''.join(
            '<a role="menuitem" href="%s">%s</a>' % (h, l) for h, l in links))
        for g, links in groups)
    return ('<div class="mega mega-co" role="menu" aria-label="Company menu">' + cols
            + '<div class="mega-feature"><b>Since 1998</b>'
            '<span>Taipei HQ &amp; R&amp;D, manufacturing in Dongguan — a memory brand trusted in 93+ countries.</span>'
            '<a class="link-arrow" href="about.html">Meet TwinMOS</a></div></div>')

def mega_support():
    """Support dropdown: self-service + Knowledge Hub (08-learn) + get-help routes."""
    groups = (
        ('Self-service', [('support.html', 'Support Center'), ('rma.html', 'Warranty &amp; RMA'),
                          ('support.html#faq', 'FAQ'), ('support.html#downloads', 'Firmware &amp; manuals')]),
        ('Knowledge hub', [('learn.html', 'Learn home'), ('learn-guides.html', 'Buying guides'),
                           ('learn-explained.html', 'Technology explainers'),
                           ('learn-benchmarks.html', 'Benchmarks'),
                           ('learn-glossary.html', 'Glossary A–Z'),
                           ('learn-blog.html', 'Tech insights &amp; blog')]),
        ('Get help', [('contact.html', 'Contact support'), ('compatibility.html', 'Compatibility finder'),
                      ('where-to-buy.html', 'Where to buy'), ('legal.html#warranty', 'Warranty policy')]),
    )
    cols = ''.join(
        '<div class="mega-col"><h4>%s</h4>%s</div>' % (g, ''.join(
            '<a role="menuitem" href="%s">%s</a>' % (h, l) for h, l in links))
        for g, links in groups)
    return ('<div class="mega mega-co" style="grid-template-columns:repeat(3,1fr)" role="menu" aria-label="Support menu">'
            + cols + '<div class="mega-feature" style="grid-column:1/-1;display:flex;align-items:center;gap:14px">'
            '<img src="assets/img/card/corex-pro.webp?v=' + ASSET_V + '" alt="" style="height:44px;width:auto" loading="lazy">'
            '<span style="font-size:13.5px;color:var(--body)">' + str(sum(1 for a in SC.ARTICLES if a['cat'] in ('Guide', 'Explainer', 'Benchmark', 'Blog') and a['id'] != 'glossary')) + ' buying guides, technology explainers and benchmarks — '
            'written by the ' + brand(14) + ' engineering team.</span>'
            '<a class="link-arrow" style="margin-left:auto;white-space:nowrap" href="learn.html">Open the Knowledge Hub</a></div></div>')

def _mega_cols(groups):
    """Shared column renderer for the 3-col mega variants."""
    return ''.join(
        '<div class="mega-col"><h4>%s</h4>%s</div>' % (g, ''.join(
            '<a role="menuitem" href="%s">%s</a>' % (h, l) for h, l in links))
        for g, links in groups)

def mega_gaming():
    """Gaming dropdown: hub sections, tuning guides and community — deep-links into gaming.html anchors."""
    cols = _mega_cols((
        ('Explore', [('gaming.html', 'Gaming home — VOLTX'),
                     ('gaming.html#arsenal', 'The arsenal &amp; specs'),
                     ('shop.html?cat=dram-gaming', 'Gaming DRAM catalog'),
                     ('gaming.html#sync', 'RGB sync ecosystems')]),
        ('Tune &amp; sync', [('gaming.html#rgb', 'RGB effects lab'),
                             ('gaming.html#tuning', 'XMP 3.0 &amp; EXPO tuning'),
                             ('article.html?id=what-is-xmp', 'What is XMP?'),
                             ('article.html?id=what-is-amd-expo', 'What is AMD EXPO?')]),
        ('Community', [('gaming.html#builds', 'Rigs from the scene'),
                       ('gaming.html#downloads', 'Wallpapers'),
                       ('gaming.html#stories', 'From the VOLTX desk'),
                       ('contact.html', 'Submit your build')]),
    ))
    return ('<div class="mega mega-edge" style="grid-template-columns:repeat(3,minmax(0,1fr)) minmax(190px,.65fr)" role="menu" aria-label="Gaming menu">'
            + cols + '<div class="mega-feature"><img src="assets/img/card/rgb-ram.webp?v=' + ASSET_V + '" alt="TwinMOS VOLTX DDR5 RGB module" loading="lazy">'
            '<b>VOLTX DDR5 RGB</b>'
            '<span style="font-size:12.5px;color:var(--muted)">Addressable RGB · XMP 3.0 / EXPO · lifetime warranty</span>'
            '<a class="link-arrow" href="shop.html?cat=dram-gaming">Shop the VOLTX line</a></div>'
            '<div class="mega-all"><a role="menuitem" href="gaming.html">Enter the gaming hub →</a>'
            '<span style="margin-left:auto;display:inline-flex;gap:16px;font-weight:650">'
            '<a role="menuitem" href="article.html?id=best-ram-for-gaming">Best RAM for gaming</a>'
            '<a role="menuitem" href="article.html?id=directstorage-gen5-gaming">DirectStorage &amp; Gen 5</a></span></div></div>')

def mega_solutions():
    """Solutions dropdown: business lines with per-card anchors, process/footprint, quote routes."""
    cols = _mega_cols((
        ('Business lines', [('solutions.html', 'Solutions home'),
                            ('solutions.html#dist', 'Regional distribution'),
                            ('solutions.html#oem', 'OEM manufacturing'),
                            ('solutions.html#fleet', 'Fleet &amp; workplace'),
                            ('solutions.html#workloads', 'Solutions by workload')]),
        ('Work with us', [('quote.html', 'Request a quote'),
                          ('partners.html', 'Become a distributor'),
                          ('solutions.html#process', 'How we work — 4 steps'),
                          ('solutions.html#footprint', 'Where we operate'),
                          ('contact.html', 'Contact an office')]),
    ))
    return ('<div class="mega mega-edge" style="grid-template-columns:repeat(2,minmax(0,1fr)) minmax(200px,.7fr)" role="menu" aria-label="Solutions menu">'
            + cols + '<div class="mega-feature"><b>From requirement to rollout</b>'
            '<span style="font-size:12.5px;color:var(--body)">Taipei R&amp;D and Dongguan manufacturing behind every custom-labeled module — JEDEC-compliant DDR3–DDR5, NVMe, SATA and flash lines.</span>'
            '<span style="font-size:12.5px;color:var(--muted)">TÜV SÜD ISO 9001 since 2002 · 93+ countries</span>'
            '<a class="link-arrow" href="quote.html">Start an OEM quote</a></div>'
            '<div class="mega-all"><a role="menuitem" href="solutions.html">Explore B2B &amp; OEM solutions →</a></div></div>')

def mega_buy():
    """Where-to-Buy dropdown: marketplaces, locator, offices — deep-links into the page's existing anchors."""
    cols = _mega_cols((
        ('Shop online', [('where-to-buy.html', 'Where to Buy home'),
                         ('where-to-buy.html#marketplaces', 'Verified marketplaces'),
                         ('where-to-buy.html#trust', 'Buy with confidence')]),
        ('Find a channel', [('where-to-buy.html#locator', 'Distributor locator'),
                            ('where-to-buy.html#offices', 'TwinMOS offices &amp; hubs'),
                            ('partners.html', 'Become a distributor'),
                            ('quote.html', 'Volume &amp; OEM supply')]),
    ))
    return ('<div class="mega mega-co" role="menu" aria-label="Where to buy menu">'
            + cols + '<div class="mega-feature"><b>Authorized only</b>'
            '<span style="font-size:12.5px;color:var(--body)">Marketplace and distributor listings are re-verified quarterly — 93+ countries across 6 regions.</span>'
            '<a class="link-arrow" href="where-to-buy.html#locator">Find your channel</a></div></div>')

LANG_OPTS = ('<option value="en">EN</option><option value="ar">AR (RTL)</option><option value="hi">HI</option>'
             '<option value="ru">RU</option><option value="zh-CN">ZH-CN</option><option value="fr">FR</option>'
             '<option value="es">ES</option><option value="pt">PT</option><option value="de">DE</option>')

def _icon(name, size=17):
    """Inline stroke SVG icons (crisp, theme-aware, no emoji fallback look)."""
    p = {
        'search': '<circle cx="8.2" cy="8.2" r="5.6"/><path d="M12.4 12.4 16 16"/>',
        'compare': '<path d="M2.5 5h11M13.5 5l-2.4-2.4M13.5 5l-2.4 2.4"/><path d="M13.5 11h-11M2.5 11l2.4-2.4M2.5 11l2.4 2.4"/>',
        'burger': '<path d="M2 4h12M2 8h12M2 12h12"/>',
        'close': '<path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/>',
    }[name]
    return ('<svg width="%d" height="%d" viewBox="0 0 16 16" fill="none" stroke="currentColor" '
            'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">%s</svg>'
            % (size, size, p))

def header(active):
    nav = []
    for key, href, label, megaKind in NAV_LINKS:
        cls = ' class="on"' if key == active else ''
        cur = ' aria-current="page"' if key == active else ''
        if megaKind:
            mega = {'mega-products': mega_products, 'mega-support': mega_support,
                    'mega-company': mega_company, 'mega-gaming': mega_gaming,
                    'mega-solutions': mega_solutions, 'mega-buy': mega_buy}[megaKind]()
            nav.append('<li><a href="%s"%s%s aria-haspopup="true">%s <span class="caret" aria-hidden="true">▾</span></a>%s</li>'
                       % (href, cls, cur, label, mega))
        else:
            nav.append('<li><a href="%s"%s%s>%s</a></li>' % (href, cls, cur, label))
    drawer_products = ''.join('<a href="shop.html?cat=%s">%s</a>' % (cid, label)
                              for _, items in MEGA_COLS for cid, label in items)
    drawer_company = ''.join('<a href="%s">%s</a>' % (h, l) for h, l in COMPANY_LINKS)
    return ('<header class="site-header"><div class="wrap header-in">'
            '<a class="logo" href="index.html" aria-label="TwinMOS home"><img src="' + logo_src() + '" alt="TwinMOS"></a>'
            '<nav aria-label="Main navigation"><ul class="nav">' + ''.join(nav) + '</ul></nav>'
            '<div class="header-cta">'
            '<select id="langSel" class="lang-sel" aria-label="Language">' + LANG_OPTS + '</select>'
            '<button class="icon-btn" id="searchBtn" aria-label="Search">' + _icon('search') + '</button>'
            '<a class="icon-btn" href="compare.html" aria-label="Compare tray">' + _icon('compare') + '<span class="tray-count" data-tray-count style="display:none">0</span></a>'
            '<a class="btn btn-accent btn-sm" href="quote.html" style="margin-left:4px">Get a quote</a>'
            '<button class="icon-btn burger" id="burger" aria-label="Open menu" aria-expanded="false">' + _icon('burger', 19) + '</button>'
            '</div></div></header>'
            '<div class="drawer" id="drawer"><div class="drawer-veil"></div>'
            '<div class="drawer-panel" role="dialog" aria-label="Mobile menu">'
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'
            '<img src="' + logo_src() + '" alt="TwinMOS" style="height:22px">'
            '<button class="icon-btn drawer-close" aria-label="Close menu">' + _icon('close') + '</button></div>'
            '<label style="display:block;font-size:12px;font-weight:700;color:var(--muted);margin:2px 0 6px">Language / region</label>'
            '<select class="lang-sel drawer-lang" aria-label="Language">' + LANG_OPTS + '</select>'
            '<a class="dlink" href="index.html">Home</a>'
            '<a class="dlink" href="#" data-sub="dsub-prod">Products <span aria-hidden="true">▾</span></a>'
            '<div class="drawer-sub" id="dsub-prod"><a href="shop.html">All products</a>' + drawer_products + '</div>'
            '<a class="dlink" href="#" data-sub="dsub-gaming">Gaming — VOLTX <span aria-hidden="true">▾</span></a>'
            '<div class="drawer-sub" id="dsub-gaming"><a href="gaming.html">Gaming home</a>'
            '<a href="gaming.html#arsenal">The arsenal &amp; specs</a>'
            '<a href="shop.html?cat=dram-gaming">Gaming DRAM catalog</a>'
            '<a href="gaming.html#rgb">RGB effects lab</a>'
            '<a href="gaming.html#tuning">XMP 3.0 &amp; EXPO tuning</a>'
            '<a href="gaming.html#builds">Rigs &amp; wallpapers</a>'
            '<a href="gaming.html#stories">From the VOLTX desk</a></div>'
            '<a class="dlink" href="#" data-sub="dsub-sol">Solutions <span aria-hidden="true">▾</span></a>'
            '<div class="drawer-sub" id="dsub-sol"><a href="solutions.html">Solutions home</a>'
            '<a href="solutions.html#dist">Regional distribution</a>'
            '<a href="solutions.html#oem">OEM manufacturing</a>'
            '<a href="solutions.html#fleet">Fleet &amp; workplace</a>'
            '<a href="quote.html">Request a quote</a>'
            '<a href="partners.html">Become a distributor</a></div>'
            '<a class="dlink" href="#" data-sub="dsub-buy">Where to Buy <span aria-hidden="true">▾</span></a>'
            '<div class="drawer-sub" id="dsub-buy"><a href="where-to-buy.html">Where to Buy home</a>'
            '<a href="where-to-buy.html#marketplaces">Online marketplaces</a>'
            '<a href="where-to-buy.html#locator">Distributor locator</a>'
            '<a href="where-to-buy.html#offices">Offices &amp; hubs</a>'
            '<a href="partners.html">Become a distributor</a></div>'
            '<a class="dlink" href="#" data-sub="dsub-support">Support <span aria-hidden="true">▾</span></a>'
            '<div class="drawer-sub" id="dsub-support"><a href="support.html">Support Center</a><a href="rma.html">Warranty &amp; RMA</a>'
            '<a href="support.html#faq">FAQ</a><a href="support.html#downloads">Downloads</a>'
            '<a href="learn.html">Knowledge Hub</a><a href="learn-guides.html">Buying guides</a>'
            '<a href="learn-explained.html">Technology explainers</a><a href="learn-benchmarks.html">Benchmarks</a>'
            '<a href="learn-glossary.html">Glossary A–Z</a><a href="learn-blog.html">Tech insights &amp; blog</a></div>'
            '<a class="dlink" href="#" data-sub="dsub-comp">Company <span aria-hidden="true">▾</span></a>'
            '<div class="drawer-sub" id="dsub-comp">' + drawer_company + '</div>'
            '<a class="dlink" href="compare.html">Compare tray <span class="tray-count" data-tray-count style="display:none">0</span></a>'
            '<a class="btn btn-accent" style="margin-top:16px" href="quote.html">Get a quote</a>'
            '</div></div>'
            '<div class="search-overlay" id="searchOverlay" role="dialog" aria-label="Site search">'
            '<div class="drawer-veil"></div><div class="search-box">'
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'
            '<b class="search-title">' + brand(20) + ' catalog search</b>'
            '<button class="icon-btn search-close" aria-label="Close search">' + _icon('close') + '</button></div>'
            '<form id="searchForm" style="display:flex;gap:10px;align-items:stretch">'
            '<input id="searchInput" placeholder="Products, articles, topics…" autocomplete="off" style="flex:1">'
            '<button class="btn btn-primary" type="submit">Search</button></form>'
            '<div class="search-hint">Try “DDR5”, “Gen 5”, “VOLTX”, “portable SSD”, “warranty” — press Enter for all results.</div>'
            '</div></div>')

FOOTER_SOCIALS = [('https://www.facebook.com/twinmos.tech', 'f', 'Facebook'),
                  ('https://instagram.com/twinmos.tech', '◎', 'Instagram'),
                  ('https://www.linkedin.com/company/twinmos-technologies/', 'in', 'LinkedIn'),
                  ('https://x.com/twinmos', '𝕏', 'X (Twitter)'),
                  ('https://www.youtube.com/c/TwinMOStech', '▶', 'YouTube'),
                  ('https://www.pinterest.com/twinmos', 'P', 'Pinterest')]

def hero_slider(slides, stats_html='', label='Featured highlights'):
    """Baked-banner hero carousel (Kingston/ADATA-style): one blended image per
    slide (scene + product composited at build time), copy overlaid on it."""
    n = len(slides)
    track, dots = [], []
    for i, s in enumerate(slides):
        on = ' on' if i == 0 else ''
        title_tag = 'h1' if i == 0 else 'h2'
        track.append(
            '<article class="sl-slide%s" data-accent="%s" role="group" aria-roledescription="slide" aria-label="Slide %d of %d">' % (on, s.get('accent', 'navy'), i + 1, n) +
            '<div class="sl-bg"><img src="%s" alt="%s"%s></div>' % (
                s['img'], s['alt'], ' fetchpriority="high"' if i == 0 else ' loading="lazy"') +
            '<div class="wrap sl-content"><div class="sl-copy">' +
            '<span class="sl-kicker">%s</span>' % s.get('kicker', '') +
            '<%s class="sl-title">%s</%s>' % (title_tag, s['title'], title_tag) +
            '<p class="sl-lede">%s</p>' % ilogo(s['lede'], 16) +
            '<div class="sl-ctas">' +
            '<a class="btn btn-lg sl-cta1" href="%s">%s <span aria-hidden="true">→</span></a>' % (s['cta1'][1], s['cta1'][0]) +
            '<a class="btn btn-lg sl-cta2" href="%s">%s</a>' % (s['cta2'][1], s['cta2'][0]) +
            '</div></div></div></article>')
        dots.append('<button class="sl-dot%s" data-sl-dot="%d" role="tab" aria-label="Go to slide %d"%s></button>' % (
            on, i, i + 1, ' aria-selected="true"' if i == 0 else ' aria-selected="false"'))
    return ('<section class="hero hero-has-slider">'
            '<div class="slider hero-slider" data-slider data-autoplay="6500" aria-roledescription="carousel" aria-label="%s">' % label +
            '<button class="sl-arrow sl-prev" data-sl-prev aria-label="Previous slide" tabindex="-1">‹</button>' +
            '<div class="sl-track">' + ''.join(track) + '</div>' +
            '<button class="sl-arrow sl-next" data-sl-next aria-label="Next slide" tabindex="-1">›</button>' +
            '<div class="sl-dots" role="tablist">' + ''.join(dots) + '</div>' +
            '<div class="sl-count" aria-hidden="true"><b>01</b><i>/</i><span>%02d</span></div>' % n +
            '</div>' +
            (('<div class="hero-stats-band"><div class="wrap"><div class="hero-stats">%s</div></div></div></section>' % stats_html) if stats_html else '</section>') +
            '')

def footer():
    prod_links = ''.join('<a href="shop.html?cat=%s">%s</a>' % (cid, label) for cid, label in SC.CATS)
    company = ''.join('<a href="%s">%s</a>' % (h, l) for h, l in COMPANY_LINKS)
    support = ('<a href="support.html">Support Center</a><a href="rma.html">Warranty &amp; RMA</a>'
               '<a href="learn.html">Knowledge Hub</a><a href="learn-guides.html">Buying guides</a>'
               '<a href="learn-explained.html">Technology explainers</a><a href="learn-glossary.html">Glossary A–Z</a>'
               '<a href="support.html#faq">FAQ</a><a href="legal.html#warranty">Warranty Policy</a>'
               '<a href="legal.html#terms">Terms of Use</a><a href="legal.html#privacy">Privacy Policy</a>'
               '<a href="legal.html#eol">EOL Product List</a>')
    soc = ''.join('<a href="%s" aria-label="%s" target="_blank" rel="noopener">%s</a>' % (u, l, g) for u, g, l in FOOTER_SOCIALS)
    return ('<footer class="site-footer"><div class="wrap"><div class="footer-grid">'
            '<div><img src="' + logo_src() + '" alt="TwinMOS">'
            '<p style="font-size:13.5px;max-width:34ch">Legendary memory brand since 1998. Memory modules, SSDs, portable storage and accessories for customers in 93+ countries.</p>'
            '<form id="nlForm" class="newsletter" style="max-width:320px">'
            '<input id="nlEmail" type="email" placeholder="Email for product news" aria-label="Email for newsletter">'
            '<button class="btn btn-accent btn-sm" type="submit">Join</button></form>'
            '<div class="social-row">' + soc + '</div></div>'
            '<div><h4>Products</h4>' + prod_links + '</div>'
            '<div><h4>Company</h4>' + company + '</div>'
            '<div><h4>Support</h4>' + support + '</div>'
            '<div class="footer-contact"><h4 style="display:flex;align-items:center;gap:8px">' + brand(17) + ' Technologies Ltd.</h4>'
            '5F.-5, No. 29, Sec. 1, Minsheng E. Rd.,<br>Zhongshan Dist., Taipei City 104619, Taiwan<br>'
            '<b>sales@twinmos.com</b><br><b>+886-970 368 077</b><br>Mon–Fri: 9am–5pm'
            '<div style="margin-top:10px"><a class="btn btn-accent btn-sm" href="quote.html">Request a quote</a></div></div>'
            '</div><div class="footer-bar">'
            '<span style="display:inline-flex;align-items:center;gap:6px">' + brand(13) + ' Technologies © ' + PI.YEAR + '. All rights reserved.</span>'
            '<span><a href="legal.html#terms" style="display:inline">Terms</a> · '
            '<a href="legal.html#privacy" style="display:inline">Privacy</a> · '
            '<a href="sitemap.html" style="display:inline">Sitemap</a> · Interactive prototype — demo data where marked</span>'
            '</div></div></footer>'
            '<div class="cookie-bar" id="cookieBar" role="region" aria-label="Cookie consent">'
            '<span>🍪 We use cookies to analyze traffic and improve your experience. See our '
            '<a href="legal.html#privacy" style="text-decoration:underline">privacy policy</a> or '
            '<a href="legal.html#cookies" style="text-decoration:underline">customize preferences</a>.</span>'
            '<button class="btn btn-accent btn-sm cookie-accept">Accept</button></div>'
            '<a class="chat-fab" href="https://wa.me/886970368077" target="_blank" rel="noopener" '
            'aria-label="Chat with TwinMOS on WhatsApp"><svg width="22" height="22" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">'
            '<path d="M8 1a6.5 6.5 0 0 0-5.6 9.8L1.3 14l3.3-.86A6.5 6.5 0 1 0 8 1zm3.9 9.3c-.16.45-.94.88-1.3.92-.35.05-.78.07-2.23-.6-1.7-.78-2.8-2.6-2.9-2.73-.09-.13-.7-.98-.7-1.87 0-.89.47-1.33.64-1.51.16-.18.35-.22.47-.22h.34c.11 0 .26-.04.4.3.15.35.5 1.2.55 1.29.04.09.07.19.01.3-.06.12-.27.4-.4.54-.08.1-.17.2-.07.39.1.19.44.75.95 1.22.65.6 1.2.79 1.38.88.18.09.29.07.4-.04.11-.12.47-.54.6-.73.13-.18.26-.15.43-.08.18.06 1.12.53 1.31.62.19.1.32.14.37.22.05.09.05.5-.11.94z"/></svg>'
            '<span class="chat-fab-tip">Chat with us</span></a>'
            '<div class="compare-tray" id="cmpTray"><span><b id="cmpTrayN">0</b> in compare</span>'
            '<a class="btn btn-accent btn-sm" href="compare.html">Compare now</a></div>'
            '<div class="toast-wrap" aria-live="polite"></div>'
            '<script src="assets/js/data.js?v=' + ASSET_V + '"></script><script src="assets/js/app.js?v=' + ASSET_V + '"></script>'
            '</body></html>')

def page(fname, title, desc, body, active='', dark=False, crumbs=None):
    """Render a full page document into the module registry (no file I/O here)."""
    if fname not in PI.PAGES:
        raise ValueError('refusing to render unexpected page name: %r' % fname)
    crumb = ''
    if crumbs:
        trail = list(crumbs)
        if not trail or trail[0][0] != 'index.html':
            trail = [('index.html', 'Home')] + trail
        items = ''.join('<li style="list-style:none"><a href="%s">%s</a></li><li aria-hidden="true" style="list-style:none">/</li>'
                        % (h, t) for h, t in trail[:-1])
        items += '<li style="list-style:none" aria-current="page">%s</li>' % trail[-1][1]
        crumb = ('<div class="wrap"><nav class="breadcrumb" aria-label="Breadcrumb">'
                 + items + '</nav></div>')
        # F1.3 — BreadcrumbList structured data for rich results
        ld = ('{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":['
              + ','.join('{"@type":"ListItem","position":%d,"name":"%s","item":"https://www.twinmos.com/%s"}'
                         % (i + 1, H.escape(t, quote=True), h) for i, (h, t) in enumerate(trail))
              + ']}')
        crumb += '<script type="application/ld+json">' + ld + '</script>'
    doc = (head(title, desc, dark) + header(active) + crumb + '<main id="main">' + body + '</main>' + footer())
    PAGES_OUT[fname] = doc
    print('  rendered', fname, len(doc), 'bytes')

def rail(attr):
    return '<div class="grid g4" data-rail="%s"></div>' % attr

def office_cards():
    cards = []
    for role, ent, addr, flag in SC.OFFICES:
        short_role = role.split('—')[0].strip()
        rest = role.split('—', 1)[1].strip() if '—' in role else role
        cards.append('<div class="card office"><span class="of-flag">%s</span><span class="of-role">%s</span>'
                     '<b>%s</b><address><i style="opacity:.75;font-style:normal">%s</i><br>%s</address></div>'
                     % (flag, short_role, rest, ent, addr))
    return '<div class="grid g3">' + ''.join(cards) + '</div>'
