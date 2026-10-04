# -*- coding: utf-8 -*-
"""Prototype builder — module 4: all page builders (render into pb_templates.PAGES_OUT)."""
import html as H
import site_content as SC
import pb_images as PI
import pb_templates as T
import pb_content as PB_C

def _n():
    return len(_PRODUCTS)

_PRODUCTS = []  # injected by build.py before building

def set_products(products):
    global _PRODUCTS
    _PRODUCTS = products

# ---------------------------------------------------------------- home
def build_home():
    # Category tiles enriched with micro-stats & badge pills
    cat_badges = {
        'dram-gaming': ('VOLTX DDR5 & RGB', 'Up to 6000MHz · Lifetime Warranty', '⚡ Gaming Grade'),
        'ssd-nvme': ('CoreX Pro & Xtreme', 'Up to 14,000 MB/s · 5-Year Warranty', '🔥 Gen 5 / 4'),
        'portable-ssd': ('ELITE Drive Pro Type-C', 'Up to 1,100 MB/s · Shock-Resistant', '🚀 Ultra-Fast'),
        'flash': ('USB 3.2 High-Speed', 'Metal Alloy Housing · 5-Year Warranty', '💾 Durable'),
        'microsd': ('V30 4K UHD Video', 'Class 10 UHS-3 · Drone & Camera Ready', '📹 4K Ready'),
        'psu': ('80 PLUS Bronze Certified', 'SmartX RGB & Xpower · Stable 12V', '🔌 High Efficiency'),
        'hub': ('EzeeHUB Multi-Port', 'USB 3.0 Superspeed · Aluminum Chassis', '⚡ Multi-Port'),
        'ssd-sata': ('Hyper H2 Ultra 2.5″', '550 MB/s · Instant PC/Laptop Refresh', '🛠️ Easy Upgrade'),
    }
    _cat_counts = {}
    for p in _PRODUCTS:
        _cat_counts[p['cat']] = _cat_counts.get(p['cat'], 0) + 1
    tiles = []
    for cid, label, sub, img in SC.CAT_TILES:
        c_title, c_sub, c_pill = cat_badges.get(cid, (label, sub, 'Official'))
        _n = _cat_counts.get(cid, 0)
        _count = ('<span style="font-size:11.5px;font-weight:700;color:var(--muted)">%d product%s</span>'
                  % (_n, '' if _n == 1 else 's')) if _n else ''
        tiles.append(
            '<a class="card cat-tile enhanced-tile" href="shop.html?cat=%s">'
            '<div class="cat-pill">%s</div>'
            '<div class="cat-img"><img src="assets/img/card/%s" alt="%s" loading="lazy"></div>'
            '<div class="cat-body"><b>%s</b><span class="cat-desc">%s</span>%s'
            '<div class="cat-cta">Explore line <span aria-hidden="true">→</span></div></div></a>'
            % (cid, c_pill, img, label, label, c_sub, _count)
        )
    tiles_html = ''.join(tiles)

    news_cards = ''.join(
        ('<a class="card card-pad article-card" href="article.html?id=%s">'
         '<span class="chip" style="align-self:flex-start">%s</span>'
         '<b style="display:block;color:var(--ink);margin:10px 0 8px;font-size:15.5px;line-height:1.4">%s</b>'
         '<span class="form-note">%s…</span>'
         '<span class="link-arrow" style="margin-top:auto;padding-top:10px;font-size:13.5px">Read article</span></a>'
         % (a['id'], a['cat'], H.escape(a['title']), H.escape(a['desc'][:120])))
        for a in SC.ARTICLES[:3])

    # Brand-line explorer chips (F4.8 dual-axis discovery, deep-links shop ?brand=)
    _brands = {}
    for p in _PRODUCTS:
        b = p.get('brand') or 'TwinMOS'
        _brands[b] = _brands.get(b, 0) + 1
    brand_chips = ''.join(
        '<a class="brand-chip" href="shop.html?brand=%s">%s <span>%d</span></a>'
        % (H.escape(b), H.escape(b), n)
        for b, n in sorted(_brands.items(), key=lambda kv: -kv[1]) if n >= 1)

    # Global reach band (F2.5) — orbit graphic + region stats
    reach = (
        '<section class="reach-band"><div class="wrap reach-in">'
        '<div class="reach-copy"><span class="eyebrow">Global reach</span>'
        '<h2 class="h2">One brand, five continents</h2>'
        '<p>Headquartered in Taipei with manufacturing in Taiwan and Dongguan, and offices in Dubai, Cologne and San Jose — '
        'authorized distribution puts ' + T.brand(15) + ' hardware within reach in 93+ countries.</p>'
        '<div class="reach-stats">'
        '<div><b data-counter="93">93+</b><span>Countries served</span></div>'
        '<div><b data-counter="5">5</b><span>Continents</span></div>'
        '<div><b data-counter="28">28</b><span>Years of supply</span></div></div>'
        '<div class="reach-flags">'
        '<span class="brand-chip">🇹🇼 Taipei HQ</span><span class="brand-chip">🇦🇪 Dubai DAFZA</span>'
        '<span class="brand-chip">🇩🇪 Cologne</span><span class="brand-chip">🇺🇸 San Jose</span>'
        '<span class="brand-chip">🇨🇳 Dongguan Mfg.</span></div>'
        '<a class="btn btn-ghost btn-sm" href="where-to-buy.html">Find a distributor →</a></div>'
        '<div class="reach-orbit" aria-hidden="true">'
        '<span class="orbit-ring r1"></span><span class="orbit-ring r2"></span><span class="orbit-ring r3"></span>'
        '<span class="orbit-core"></span>'
        '<span class="orbit-dot d1"></span><span class="orbit-dot d2"></span><span class="orbit-dot d3"></span>'
        '<span class="orbit-dot d4"></span><span class="orbit-dot d5"></span></div>'
        '</div></section>')

    # Social proof strip (F2.6 — placeholder attribution only, BR-14.2 governance)
    testi = (
        '<section style="padding-top:0"><div class="wrap">'
        '<div class="section-head"><div><span class="eyebrow">Voices from the field</span>'
        '<h2 class="h2">What the channel says</h2></div></div>'
        '<div class="grid g3">'
        '<div class="card card-pad testi-card"><span class="testi-quote">"</span>'
        '<p>The VOLTX DDR5 launch was a game-changer for our gaming customers — quality and steady supply we can build a shelf on.</p>'
        '<div class="testi-who"><b>Managing director, regional distributor</b><span>Middle East channel · attribution pending written release</span></div></div>'
        '<div class="card card-pad testi-card"><span class="testi-quote">"</span>'
        '<p>We spec TwinMOS across our builds — the warranty tiers and regional stock make procurement simple.</p>'
        '<div class="testi-who"><b>Procurement lead, system integrator</b><span>UAE · attribution pending written release</span></div></div>'
        '<div class="card card-pad testi-card"><span class="testi-quote">"</span>'
        '<p>CoreX Pro takes 8K footage in stride, and the 5-year NVMe warranty closes the deal with our clients.</p>'
        '<div class="testi-who"><b>Studio technical director</b><span>Creative agency, North Africa · attribution pending written release</span></div></div>'
        '</div>'
        '<p class="form-note" style="margin-top:10px">🔒 Testimonials publish only with signed releases — placeholder attributions shown per the verified-claims policy.</p>'
        '</div></section>')

    hero_stats = (
        '<div class="hero-stat-box"><b class="hero-stat-num" data-counter="1998">1998</b><span class="hero-stat-lbl">Founded in Taipei, Taiwan</span><small class="hero-stat-sub">28 Years of Engineering</small></div>'
        '<div class="hero-stat-box"><b class="hero-stat-num" data-counter="93">93+</b><span class="hero-stat-lbl">Countries Globally Served</span><small class="hero-stat-sub">5 Continents Network</small></div>'
        '<div class="hero-stat-box"><b class="hero-stat-num" data-counter="14000">14,000</b><span class="hero-stat-lbl">MB/s Next-Gen Read Speed</span><small class="hero-stat-sub">CoreX Pro PCIe Gen 5.0</small></div>'
        '<div class="hero-stat-box"><b class="hero-stat-num">Lifetime</b><span class="hero-stat-lbl">DRAM Module Warranty</span><small class="hero-stat-sub">5-Year Protection on NVMe</small></div>'
    )

    body = (
        # 1. Hero Carousel with stats band
        T.hero_slider(SC.HOME_SLIDES, hero_stats)
        
        # 2. Interactive Quick Upgrade Advisor (Crucial/Kingston-style instant conversion)
        + '<section class="upgrade-advisor-sec">'
        '<div class="wrap">'
        '<div class="upgrade-advisor-box">'
        '<div class="ua-header">'
        '<div>'
        '<span class="eyebrow" style="color:var(--accent-deep)"><span class="pulse-indicator"></span> Interactive Upgrade Advisor</span>'
        '<h2 class="h2" style="margin-bottom:6px">Find Your Hardware Upgrade in 2 Clicks</h2>'
        '<p class="form-note" style="font-size:14px;max-width:62ch;margin:0">Match your system and performance goal to validated TwinMOS memory modules and high-speed NVMe storage.</p>'
        '</div>'
        '<a class="btn btn-ghost btn-sm ua-deep-link" href="compatibility.html">Full 3-Step Compatibility Finder →</a>'
        '</div>'
        '<div class="ua-controls">'
        '<div class="ua-group">'
        '<span class="ua-label">1. Choose Your Device Platform</span>'
        '<div class="ua-pill-row" id="uaDeviceRow" role="tablist">'
        '<button class="ua-pill on" data-dev="laptop" role="tab" aria-selected="true"><span class="ua-icon">💻</span> Laptop / Notebook</button>'
        '<button class="ua-pill" data-dev="desktop" role="tab" aria-selected="false"><span class="ua-icon">🖥️</span> Desktop PC</button>'
        '<button class="ua-pill" data-dev="gaming" role="tab" aria-selected="false"><span class="ua-icon">🎮</span> Gaming Rig / PS5</button>'
        '<button class="ua-pill" data-dev="creator" role="tab" aria-selected="false"><span class="ua-icon">💼</span> Mobile Creator &amp; Mac</button>'
        '</div>'
        '</div>'
        '<div class="ua-group">'
        '<span class="ua-label">2. Select Your Primary Goal</span>'
        '<div class="ua-pill-row" id="uaGoalRow" role="tablist">'
        '<!-- Populated dynamically by app.js -->'
        '</div>'
        '</div>'
        '</div>'
        '<div class="ua-recommendation" id="uaRecommendation">'
        '<!-- Populated dynamically by app.js -->'
        '</div>'
        '</div>'
        '</div></section>'

        # 3. Certified Quality & Compliance band (corpus 00-site-wide/09-trust-bar + 01-homepage §2)
        + ('<section class="cert-band" id="certifications"><div class="wrap">'
           '<div class="section-head"><div>'
           '<span class="eyebrow">Certified quality &amp; compliance</span>'
           '<h2 class="h2">Trusted worldwide for 28 years</h2>'
           '<p class="lede">ISO 9001 certified — TÜV SÜD, first certified 2002 — with full CE, FCC, RoHS and JEDEC compliance across every product line.</p>'
           '</div>'
           '<a class="btn btn-ghost btn-sm" href="about.html#quality">Quality assurance →</a></div>'
           '<div class="cb-stats">'
           '<div class="cb-cell" title="Founded in 1998 in Taipei, Taiwan"><b data-counter="28">28</b><span>Years of excellence</span></div>'
           '<div class="cb-cell" title="Across 5 continents: Middle East, Africa, Asia, Europe, Americas"><b data-counter="93">93+</b><span>Countries served</span></div>'
           '<div class="cb-cell" title="Taipei · Dubai · Cologne · San Jose · Dongguan"><b data-counter="5">5</b><span>Global offices</span></div>'
           '<a class="cb-cell" href="https://www.usb.org/vendor-id-search" target="_blank" rel="noopener" title="Registered USB Implementers Forum Vendor ID — TwinMOS Technologies ME FZE"><b>4719</b><span>USB-IF Vendor ID ↗</span></a>'
           '<a class="cb-cell" href="https://regauth.standards.ieee.org/standards-ra-web/pub/view.html#registries" target="_blank" rel="noopener" title="IEEE Organizationally Unique Identifier — TwinMOS Technologies Inc."><b class="cb-mono">000B9D</b><span>IEEE OUI ↗</span></a>'
           '</div>'
           '<div class="cb-badges">'
           '<span class="cb-badge">ISO 9001</span><span class="cb-badge">JEDEC</span><span class="cb-badge">CE</span><span class="cb-badge">UKCA</span>'
           '<span class="cb-badge">FCC</span><span class="cb-badge">RoHS</span><span class="cb-badge">REACH</span><span class="cb-badge">EAC</span>'
           '<span class="cb-badge cb-award">🏆 Best SSD Manufacturer 2023</span>'
           '</div>'
           '</div></section>')

        # 4. Categorized Hardware Ecosystem Explorer
        + '<section><div class="wrap">'
        '<div class="section-head"><div>'
        '<span class="eyebrow">Product Ecosystem</span>'
        '<h2 class="h2">Engineered for Every Platform</h2>'
        '<p class="lede">From ultra-high-speed PCIe Gen 5.0 drives to extreme DDR5 gaming memory and industrial power supplies.</p>'
        '</div>'
        '<a class="link-arrow" href="shop.html">View all 39 products in catalog</a></div>'
        '<div class="grid g4">' + tiles_html + '</div>'
        '<div class="brand-row"><span class="brand-row-l">Or explore by brand line</span>' + brand_chips + '</div>'
        '</div></section>'

        # 5. Interactive Speed Benchmark Simulator (Showcasing 14,000 MB/s CoreX Pro)
        + '<section style="padding-top:0"><div class="wrap">'
        '<div class="speed-sim-container">'
        '<div class="speed-sim-header">'
        '<div>'
        '<span class="eyebrow" style="color:#00F0FF"><span class="pulse-indicator pulse-cyan"></span> Real-World Speed Visualizer</span>'
        '<h2 class="h2" style="color:#fff;margin-bottom:8px">Experience the 14,000 MB/s Gen 5.0 Velocity</h2>'
        '<p style="color:#A4B8CC;max-width:62ch;margin:0">Compare sequential throughput and actual loading times across storage generations. See why PCIe Gen 5.0 is a game-changer for creators and gamers.</p>'
        '</div>'
        '<div class="speed-workload-tabs" id="speedWorkloadTabs" role="tablist">'
        '<button class="sw-tab on" data-workload="directstorage" role="tab" aria-selected="true">🎮 50GB DirectStorage Game</button>'
        '<button class="sw-tab" data-workload="video8k" role="tab" aria-selected="false">🎬 100GB 8K ProRes Video</button>'
        '<button class="sw-tab" data-workload="boot" role="tab" aria-selected="false">⚡ OS Cold Boot &amp; Apps</button>'
        '</div>'
        '</div>'
        '<div class="speed-bars-wrap" id="speedBarsWrap">'
        '<!-- Rendered & animated dynamically by app.js -->'
        '</div>'
        '<div class="speed-sim-footer">'
        '<div class="speed-takeaway">'
        '<b class="st-highlight">🚀 DirectStorage &amp; 3D TLC Architecture:</b> '
        '<span id="speedTakeawayText">TwinMOS CoreX Pro Gen 5 streams assets directly to GPU VRAM at up to 14,000 MB/s, cutting massive open-world texture load times from minutes on HDD down to just 3.6 seconds.</span>'
        '</div>'
        '<div class="speed-ctas">'
        '<a class="btn btn-accent btn-sm" href="product.html?id=corex-pro-m2-pcie-gen-5-0-nvme-ssd">View CoreX Pro Gen 5.0</a>'
        '<a class="btn btn-ghost btn-sm" style="color:#DCE7F0;border-color:#3A5568" href="article.html?id=nvme-gen3-gen4-gen5-explained">Gen 3 vs 4 vs 5 Guide</a>'
        '</div>'
        '</div>'
        '</div>'
        '</div></section>'

        # 6. Filterable Flagships Showcase with Dynamic Category Filter Tabs
        + '<section style="padding-top:0"><div class="wrap">'
        '<div class="section-head">'
        '<div>'
        '<span class="eyebrow">Season Highlights</span>'
        '<h2 class="h2">Featured Flagship Hardware</h2>'
        '<p class="lede">High-performance components tested and verified for stability, low latency, and sustained endurance.</p>'
        '</div>'
        '<div class="flagship-tabs" id="flagshipTabs" role="tablist">'
        '<button class="ftab on" data-fseg="all" role="tab" aria-selected="true">🔥 All Flagships</button>'
        '<button class="ftab" data-fseg="nvme" role="tab" aria-selected="false">⚡ Gen 5 &amp; NVMe</button>'
        '<button class="ftab" data-fseg="gaming" role="tab" aria-selected="false">🎮 VOLTX Gaming</button>'
        '<button class="ftab" data-fseg="portable" role="tab" aria-selected="false">💼 Portable &amp; Flash</button>'
        '</div>'
        '</div>'
        '<div class="grid g4" id="homeFlagshipGrid">'
        '<!-- Populated dynamically by app.js with live compare and quick-view -->'
        '</div>'
        '<div style="text-align:center;margin-top:24px">'
        '<a class="btn btn-ghost" href="shop.html">Browse the Complete 39-Product Catalog →</a>'
        '</div>'
        '</div></section>'

        # 7. Modernized Engineering & Reliability Bento Grid
        + '<section style="padding-top:0"><div class="wrap">'
        '<div class="section-head"><div><span class="eyebrow">Engineering Excellence</span><h2 class="h2">Why Builders &amp; Enterprises Trust ' + T.brand(24) + '</h2></div></div>'
        '<div class="bento">'
        '<div class="b-cell b-span2 b-dark">'
        '<span class="eyebrow" style="color:#7DEEFF">Flagship Storage · M.2 NVMe 2.0</span>'
        '<h3 style="color:#fff">Up to 14,000 MB/s Sequential Read</h3>'
        '<p>PCIe Gen 5.0 x4, TLC 3D NAND, graphene thermal management foil, and up to 1,400 TBW endurance. Engineered for DirectStorage gaming rigs and demanding AI workstations.</p>'
        '<div style="margin-top:auto;display:flex;gap:10px;flex-wrap:wrap">'
        '<a class="btn btn-accent btn-sm" href="product.html?id=corex-pro-m2-pcie-gen-5-0-nvme-ssd">Explore CoreX Pro</a>'
        '<a class="btn btn-ghost btn-sm" style="color:#DCE7F0;border-color:#3A5568" href="article.html?id=directstorage-gen5-gaming">DirectStorage Explained</a>'
        '</div></div>'
        '<div class="b-cell b-warranty"><span class="big">Lifetime</span><b>DRAM Module Warranty</b><p>Unmatched confidence: Every memory module is backed by our lifetime replacement policy. NVMe SSDs &amp; Flash carry 5 years.</p><a class="link-arrow" style="margin-top:auto" href="legal.html#warranty">View warranty policy</a></div>'
        '<div class="b-cell b-neon"><span class="eyebrow" style="color:#00F0FF">VOLTX Gaming Line</span>'
        '<h3 style="color:#fff">DDR5 with Addressable RGB</h3><p>Board-synced illumination, Intel XMP 3.0 &amp; AMD EXPO profiles, and frequencies tuned for modern platforms.</p>'
        '<a class="link-arrow" style="color:#00F0FF;margin-top:auto" href="gaming.html">Enter the gaming hub</a></div>'
        '<div class="b-cell b-span2"><span class="eyebrow">Hardware Knowledge Hub</span><h3>Upgrade With Total Confidence</h3>'
        '<p>Not sure whether to upgrade RAM or storage first? Our comprehensive guides walk you through bottlenecks — then our 3-step compatibility finder confirms the exact fit for your machine.</p>'
        '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:auto">'
        '<a class="btn btn-ghost btn-sm" href="article.html?id=boost-pc-performance-ram-or-ssd-first">RAM or SSD First?</a>'
        '<a class="btn btn-ghost btn-sm" href="compatibility.html">Compatibility Finder</a>'
        '</div></div>'
        '<div class="b-cell"><span class="big">27+ Yrs</span><b>Since 1998</b><p>Founded in Taipei, Taiwan. Over a quarter-century of continuous memory innovation and global channel distribution.</p></div>'
        '<div class="b-cell"><span class="big">24/7</span><b>Self-Service RMA</b><p>Instant serial verification and live ticket tracker, supported by regional teams in Taipei and Dubai.</p><a class="link-arrow" style="margin-top:auto" href="rma.html">Track RMA status</a></div>'
        '</div></div></section>'

        # Global reach band (research: Kingston heritage-trust pattern)
        + reach
        # Social proof strip (governance-safe placeholders)
        + testi

        # 8. Enterprise & OEM Volume Procurement Fast-Track Banner
        + '<section style="padding-top:0"><div class="wrap">'
        '<div class="b2b-card">'
        '<div class="b2b-content">'
        '<span class="eyebrow" style="color:#00E0FF">Enterprise &amp; Channel Distribution</span>'
        '<h2 class="h2" style="color:#fff;margin-bottom:8px">Sourcing Memory &amp; Storage at Volume?</h2>'
        '<p style="color:#D5E5F2;max-width:58ch;margin-bottom:18px">' + T.brand(16) + ' manufactures under its own renowned brand and delivers OEM/ODM turnkey solutions for system integrators, PC assemblers, and enterprise fleets worldwide.</p>'
        '<div class="b2b-perks">'
        '<div class="b2b-perk"><span class="bp-icon">⚡</span><div><b>Guaranteed 24h Response</b><span>Rapid quote turnaround from Taipei &amp; Dubai</span></div></div>'
        '<div class="b2b-perk"><span class="bp-icon">🛡️</span><div><b>Custom OEM &amp; Private Label</b><span>Industrial IC screening, custom firmware &amp; packaging</span></div></div>'
        '<div class="b2b-perk"><span class="bp-icon">🌍</span><div><b>5 Strategic Global Hubs</b><span>Seamless logistics across 93+ countries</span></div></div>'
        '</div>'
        '<div class="b2b-actions">'
        '<a class="btn btn-lg btn-accent" href="quote.html">Request a Volume Quote</a>'
        '<a class="btn btn-lg btn-ghost" style="color:#fff;border-color:rgba(255,255,255,.35)" href="solutions.html">Explore Enterprise Solutions</a>'
        '<a class="btn btn-lg btn-ghost" style="color:#fff;border-color:rgba(255,255,255,.35)" href="where-to-buy.html">Authorized Distributors</a>'
        '</div></div>'
        '<div class="b2b-graphic">'
        '<img src="assets/img/card/corex-pro.webp" alt="TwinMOS Enterprise Storage" loading="lazy">'
        '</div></div>'
        '</div></section>'

        # 9. Latest News, Media & Events
        + '<section style="padding-top:0"><div class="wrap">'
        '<div class="section-head"><div><span class="eyebrow">Media &amp; Industry Events</span><h2 class="h2" style="display:flex;align-items:center;gap:10px">Latest from ' + T.brand(22) + '</h2></div>'
        '<a class="link-arrow" href="news.html">All news &amp; events</a></div>'
        '<div class="grid g3">' + news_cards + '</div>'
        '<div class="brand-row" style="margin-top:18px"><span class="brand-row-l">Popular upgrade guides</span>'
        '<a class="brand-chip" href="article.html?id=how-to-choose-ram">How to choose RAM</a>'
        '<a class="brand-chip" href="article.html?id=ddr4-vs-ddr5">DDR4 vs DDR5</a>'
        '<a class="brand-chip" href="article.html?id=nvme-vs-sata-ssd">NVMe vs SATA</a>'
        '<a class="brand-chip" href="article.html?id=best-ram-for-gaming">Best RAM for gaming</a>'
        '<a class="brand-chip" href="article.html?id=laptop-nvme-upgrade-guide">Laptop NVMe guide</a>'
        '</div></div></section>'

        # 10. Global Where to Buy & Support Ribbon
        + '<section style="padding-top:0"><div class="wrap">'
        '<div class="cta-band">'
        '<img class="cta-watermark" src="' + T.logo_src() + '" alt="" aria-hidden="true">'
        '<div class="cta-copy"><h2 class="h2" style="color:#fff;margin-bottom:6px">Ready to Upgrade Your Hardware?</h2>'
        '<p style="margin:0;max-width:56ch">Purchase genuine ' + T.brand(16) + ' components from verified global marketplaces including Amazon and Newegg, or find an authorized regional partner.</p></div>'
        '<div style="display:flex;gap:12px;flex-wrap:wrap">'
        '<a class="btn btn-lg" style="background:#fff;color:#0A2540" href="where-to-buy.html">Where to Buy</a>'
        '<a class="btn btn-lg btn-ghost" style="color:#fff;border-color:rgba(255,255,255,.45)" href="support.html">Support Center</a>'
        '</div></div>'
        '</div></section>'
    )
    T.page('index.html', 'TwinMOS — Memory & Storage Solutions Since 1998',
           'TwinMOS Technologies: DRAM, NVMe SSDs, portable storage and flash — trusted in 93+ countries since 1998.',
           body, active='home')

# ---------------------------------------------------------------- shop
def build_shop():
    n_all = str(_n())
    cats_html = ''.join(
        ('<label class="fcheck"><input type="radio" name="fcat" data-fcat="%s"> %s'
         '<span class="cnt">%d</span></label>' % (cid, label, sum(1 for p in _PRODUCTS if p['cat'] == cid)))
        for cid, label in SC.CATS)
    gens = ''.join('<label class="fcheck"><input type="checkbox" data-fgen="%s"> %s <span class="cnt">%d</span></label>'
                   % (g, g, sum(1 for p in _PRODUCTS if p['gen'] == g)) for g in ('DDR5', 'DDR4', 'DDR3'))
    caps = ''.join('<label class="fcheck"><input type="checkbox" data-fcap="%s"> %s</label>' % (c, c)
                   for c in ('128GB', '256GB', '512GB', '1TB', '2TB'))
    lines = [('CoreX Pro', 'CoreX Pro'), ('VOLTX', 'VOLTX'), ('ELITE Drive', 'ELITE Drive'), ('ProDrive Ultra', 'ProDrive Ultra'),
             ('Mobile Disk', 'Mobile Disk'), ('TornadoX7', 'TornadoX7'), ('Thunder GX', 'Thunder GX'),
             ('Xtreme', 'Xtreme'), ('Alpha Pro', 'Alpha Pro'), ('Hyper H2', 'Hyper H2 Ultra'),
             ('Concord', 'Concord'), ('TwinMOS', 'TwinMOS line')]
    brands = ''.join('<label class="fcheck"><input type="checkbox" data-fbrand="%s"> %s <span class="cnt">%d</span></label>'
                     % (b, lbl, sum(1 for p in _PRODUCTS if (p.get('brand') or 'TwinMOS') == b))
                     for b, lbl in lines if sum(1 for p in _PRODUCTS if (p.get('brand') or 'TwinMOS') == b))
    body = ('<div class="page-hero"><div class="wrap"><span class="eyebrow">Catalog</span><h1 class="h1">All products</h1>'
            '<p class="lede">Every ' + T.brand(16) + ' module, drive and accessory in the current catalog — ' + n_all +
            ' products across ' + str(len(SC.CATS)) + ' categories. Filter by category, brand line, memory generation or capacity; add up to four products to the compare tray.</p></div></div>'
            '<section style="padding-top:clamp(22px,3vw,36px)"><div class="wrap">'
            '<div class="tabs" id="catChips" role="tablist" style="margin-bottom:18px"></div>'
            '<div class="shop-layout"><aside class="filters" aria-label="Product filters">'
            '<h4>Category</h4><label class="fcheck"><input type="radio" name="fcat" data-fcat="all" checked> All products <span class="cnt">' + n_all + '</span></label>'
            + cats_html + '<h4>Brand line</h4>' + brands + '<h4>Memory generation</h4>' + gens + '<h4>Capacity</h4>' + caps +
            '<h4>Warranty</h4><p class="form-note" style="margin:0">Lifetime — DRAM · 5 yrs — NVMe &amp; flash · 3 yrs — SATA SSD · details on each product page.</p>'
            '<button class="btn btn-ghost btn-sm" id="clearAll" style="margin-top:14px">Clear all filters</button></aside>'
            '<div><div class="toolbar">'
            '<input class="input" id="shopSearch" placeholder="Filter by keyword…" style="min-width:210px" aria-label="Keyword filter">'
            '<span class="result-count" id="resultCount"></span>'
            '<select class="input sp" id="sortSel" aria-label="Sort"><option value="featured">Sort: Featured</option>'
            '<option value="name">Sort: Name A–Z</option><option value="cat">Sort: Category</option></select></div>'
            '<div class="active-filters" id="activeFilters"></div><div class="grid g3" id="shopGrid"></div></div></div></div></section>')
    T.page('shop.html', 'Shop All Products — TwinMOS', 'Browse the full TwinMOS catalog: DRAM, NVMe and SATA SSDs, portable storage, flash drives, microSD, power supplies and hubs.',
           body, active='products', crumbs=[('index.html', 'Home'), ('shop.html', 'Products')])

# ---------------------------------------------------------------- product / compat / compare
def build_product():
    body = ('<div class="wrap" style="padding-top:18px"><nav class="breadcrumb" aria-label="Breadcrumb">'
            '<a href="index.html">Home</a> / <a href="shop.html">Products</a> / <span id="bcName">…</span></nav></div>'
            '<section style="padding-top:clamp(14px,2vw,26px)"><div class="wrap" id="pdpRoot">'
            '<div class="empty-state"><h3>Loading product…</h3><p>JavaScript renders this page from the catalog data. '
            'If you see this message, enable JavaScript or <a href="shop.html">browse the catalog</a>.</p></div></div></section>'
            '<section style="padding-top:0"><div class="wrap"><div id="pdpGuides"></div></div></section>'
            '<section style="padding-top:0"><div class="wrap">'
            '<div class="section-head"><div><span class="eyebrow">Same category</span><h2 class="h2">Related products</h2></div>'
            '<a class="link-arrow" href="shop.html">All products</a></div>'
            '<div class="grid g4" id="relatedGrid"></div></div></section>')
    T.page('product.html', 'Product — TwinMOS', 'TwinMOS product detail: specifications, warranty, variants and where to buy.', body, active='products')

def build_compatibility():
    # platform count + guide picks computed from the real sources at build time
    _n_devices = sum(len(b['models']) for t in SC.COMPAT_DB['types'] for b in t['brands'])
    _quick = (('ThinkPad T14 Gen 4', 'laptop', 'lenovo', 'thinkpad-t14-g4'),
              ('ROG Strix X670E', 'diy', 'asus', 'rog-x670e'),
              ('OMEN 16', 'laptop', 'hp', 'omen-16'),
              ('NUC 13 Arena', 'minipc', 'intel', 'nuc13-arena'))
    _qhtml = ''.join(
        '<button class="btn btn-ghost btn-sm quick-pick" data-t="%s" data-b="%s" data-m="%s">%s →</button>' % (t, b, m, H.escape(l))
        for l, t, b, m in _quick)
    _gids = ('how-to-check-motherboard-ram-compatibility', 'how-much-ram-do-you-need',
             'boost-pc-performance-ram-or-ssd-first', 'ram-glossary')
    _arts = {a['id']: a for a in SC.ARTICLES}
    _pick = [_arts[i] for i in _gids if i in _arts]
    _guides = ''.join(
        '<a class="card card-pad" href="article.html?id=%s" style="text-decoration:none">'
        '<span class="chip">Guide</span><b style="display:block;color:var(--ink);margin:10px 0 6px;line-height:1.4">%s</b>'
        '<span class="form-note">%s…</span><span class="link-arrow" style="display:inline-block;margin-top:10px">Read guide</span></a>'
        % (H.escape(a['id']), H.escape(a['title']), H.escape(a.get('desc', '')[:110]))
        for a in _pick[:4])
    faq = (
        '<details open><summary>Will faster memory work in my machine?</summary><div class="acc-body">'
        'Yes — DDR modules run at the maximum speed your platform supports and downclock automatically. '
        'A DDR5-6000 kit in a DDR5-5600 laptop runs reliably at 5600 MT/s; the finder flags the exact behaviour on every match above.</div></details>'
        '<details><summary>What is the difference between SO-DIMM and U-DIMM?</summary><div class="acc-body">'
        'SO-DIMM (260/262-pin) is the small form factor for laptops, mini PCs and some NUCs; U-DIMM (288-pin) is the desktop module. '
        'They are not interchangeable — the finder filters by the exact form factor your platform uses.</div></details>'
        '<details><summary>Can I put an NVMe SSD in a SATA-only slot?</summary><div class="acc-body">'
        'No — M-key NVMe and B-key SATA are different interfaces, though they share the M.2 connector shape. '
        'The finder only lists storage that matches your platform\u2019s slot type; a 2.5\u2033 SATA bay takes our SATA SSDs.</div></details>'
        '<details><summary>Do I have to install memory in pairs?</summary><div class="acc-body">'
        'Modern platforms boot with a single module, but two matched modules enable dual-channel mode — up to roughly double the memory bandwidth. '
        'For best results, fill both slots with identical kits.</div></details>'
        '<details><summary>What if my exact model is not listed?</summary><div class="acc-body">'
        'The prototype database covers a representative set of %d platforms; the production index grows to 500+ with quarterly vendor-QVL refreshes. '
        'Send your exact model to <a href="contact.html">support</a> and we will confirm the right upgrade manually.</div></details>' % _n_devices)
    body = ('<div class="page-hero"><div class="wrap"><span class="eyebrow">Flagship tool</span><h1 class="h1">Compatibility finder</h1>'
            '<p class="lede">Three steps from device to the right ' + T.brand(16) + ' upgrade. Pick your device type, brand and model — we show the platform facts, then the matching memory and storage.</p>'
            '<div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:18px">'
            '<span class="trust-item"><b>%d</b><span>platforms in the demo index</span></span>'
            '<span class="trust-item"><b>Memory + storage</b><span>matched per platform</span></span>'
            '<span class="trust-item"><b>Honest labels</b><span>spec-compatible never means incompatible</span></span></div></div></div>'
            % _n_devices)
    body += ('<section style="padding-top:clamp(22px,3vw,36px)"><div class="wrap" id="compatRoot" style="max-width:1080px">'
             '<div class="card card-pad"><div class="form-grid g3">'
             '<div class="fg"><label>Device type</label><select class="input" id="fType"></select></div>'
             '<div class="fg"><label>Brand</label><select class="input" id="fBrand" disabled></select></div>'
             '<div class="fg"><label>Model / platform</label><select class="input" id="fModel" disabled></select></div></div>'
             '<div style="margin-top:16px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">'
             '<button class="btn btn-primary" id="fGo">Find compatible products</button>'
             '<span class="form-note">Demo database for the prototype — always confirm with your device manual.</span></div>'
             '<div style="margin-top:14px;padding-top:14px;border-top:1px dashed var(--border);display:flex;gap:8px;align-items:center;flex-wrap:wrap">'
             '<span class="form-note" style="font-weight:700">Popular:</span>' + _qhtml + '</div></div>'
             '<div id="compatOut" style="margin-top:8px"></div></div></section>')
    body += ('<section style="padding-top:0"><div class="wrap">'
             '<div class="section-head"><div><span class="eyebrow">How it works</span><h2 class="h2">Matching logic, in the open</h2></div></div>'
             '<div class="steps">'
             '<div class="step"><b>Identify the platform</b><span>Device type and brand narrow the memory generation and form factor (U-DIMM vs SO-DIMM).</span></div>'
             '<div class="step"><b>Read the platform facts</b><span>Max memory, slots, supported speed and storage slot — before you pick a product.</span></div>'
             '<div class="step"><b>Matched, not dumped</b><span>Only in-catalog products that satisfy every rule appear, each with the reason it fits — including honest downclock notes.</span></div>'
             '<div class="step"><b>Verify &amp; buy</b><span>Check the note, add to compare, then continue to where-to-buy or a volume quote.</span></div></div></div></section>')
    body += ('<section style="padding-top:0"><div class="wrap" style="max-width:880px">'
             '<div class="section-head"><div><span class="eyebrow">Good to know</span><h2 class="h2">Upgrade questions, answered</h2></div></div>'
             '<div class="acc">' + faq + '</div></div></section>')
    if _guides:
        body += ('<section style="padding-top:0"><div class="wrap">'
                 '<div class="section-head"><div><span class="eyebrow">Learn hub</span><h2 class="h2">Go deeper before you buy</h2></div>'
                 '<a class="link-arrow" href="news.html">All guides</a></div>'
                 '<div class="grid g4">' + _guides + '</div></div></section>')
    T.page('compatibility.html', 'Compatibility Finder — TwinMOS', 'Find TwinMOS memory and storage compatible with your laptop, desktop, motherboard or mini PC — platform facts, matched speeds and honest downclock notes.',
           body, active='products', crumbs=[('index.html', 'Home'), ('compatibility.html', 'Compatibility finder')])

def build_compare():
    body = ('<div class="page-hero"><div class="wrap"><span class="eyebrow">Decision tool</span><h1 class="h1">Compare products</h1>'
            '<p class="lede">Add up to four products from the catalog using the ⇄ button on any product card. Differences are highlighted automatically, and your tray persists between visits.</p></div></div>'
            '<section style="padding-top:clamp(22px,3vw,36px)"><div class="wrap" id="cmpMount"></div></section>')
    T.page('compare.html', 'Compare Products — TwinMOS', 'Side-by-side TwinMOS product comparison with automatic difference highlighting.',
           body, active='products', crumbs=[('index.html', 'Home'), ('compare.html', 'Compare')])

# ---------------------------------------------------------------- buy / gaming / solutions
_LOC_STATUS = {'hub': ('chip', 'TwinMOS hub'), 'authorized': ('chip ok', 'Authorized distribution'),
               'expanding': ('chip warn', 'Expanding coverage'), 'seeking': ('chip info', 'Seeking distributors')}

def _loc_cards():
    from html import escape
    from urllib.parse import quote
    out = []
    for e in SC.DISTRIB_COUNTRIES:
        cls, label = _LOC_STATUS[e['status']]
        country = escape(e['country'])                     # "Botswana &amp; Lesotho" in text/attrs
        cities = ''.join('<span>%s</span>' % escape(c) for c in e['cities'])
        search = escape(' '.join([e['country'], e['region_label'], e['tag']] + e['cities']).lower())
        qcountry = quote(e['country'])                     # URL-encoded for mailto subjects
        if e['status'] == 'seeking':
            actions = ('<a class="btn btn-primary btn-sm" href="partners.html">Become a distributor</a>'
                       '<a class="btn btn-ghost btn-sm" href="mailto:sales@twinmos.com?subject=' + qcountry + '%20distributor%20inquiry">Contact sales</a>')
        elif e['status'] == 'hub':
            actions = ('<a class="btn btn-primary btn-sm" href="contact.html">Contact the hub</a>'
                       '<a class="btn btn-ghost btn-sm" href="mailto:sales@twinmos.com?subject=' + qcountry + '%20sales%20inquiry">Email sales</a>')
        else:
            actions = ('<a class="btn btn-primary btn-sm" href="mailto:sales@twinmos.com?subject=Authorized%20distributor%20in%20' + qcountry + '">Connect with the distributor</a>'
                       '<a class="btn btn-ghost btn-sm" href="partners.html">Become a partner</a>')
        out.append('<div class="dcard" data-cc="%s" data-region="%s" data-status="%s" data-search="%s">'
                   '<div class="dc-head"><span class="dc-flag" aria-hidden="true">%s</span>'
                   '<div class="dc-title"><b>%s</b><span class="dc-region">%s</span></div></div>'
                   '<span class="%s dc-chip">%s</span>'
                   '<p class="dc-tag">%s</p>'
                   '<p class="dc-note">%s</p>'
                   '<div class="dc-cities">%s</div>'
                   '<div class="dc-actions">%s</div></div>'
                   % (e['cc'], e['region'], e['status'], search, e['cc'], country,
                      escape(e['region_label']), cls, label, escape(e['tag']), escape(e['note']), cities, actions))
    return ''.join(out)

def build_buy():
    regions = SC.DISTRIB_REGIONS
    counts = {}
    for e in SC.DISTRIB_COUNTRIES:
        counts[e['region']] = counts.get(e['region'], 0) + 1
    n_all = len(SC.DISTRIB_COUNTRIES)
    chips = ('<button class="lchip on" data-rg="all" aria-pressed="true">All regions <span>%d</span></button>' % n_all)
    for r in regions:
        chips += '<button class="lchip" data-rg="%s" aria-pressed="false">%s <span>%d</span></button>' % (
            r['id'], r['label'], counts.get(r['id'], 0))
    pending = ' · '.join(SC.MARKETPLACES_PENDING)

    body = ('<div class="page-hero"><div class="wrap"><span class="eyebrow">Where to buy</span><h1 class="h1" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">Get ' + T.brand(32) + ' products</h1>'
            '<p class="lede">' + T.brand(16) + ' products reach 93+ countries through verified online marketplaces, a country-by-country distributor network and five TwinMOS offices. Find your channel below — for volume and OEM supply, request a quotation directly from the factory.</p>'
            '<div class="anchor-chips">'
            '<a class="achip" href="#marketplaces">🛒 Online marketplaces</a>'
            '<a class="achip" href="#locator">📍 Distributor locator</a>'
            '<a class="achip" href="#offices">🏢 TwinMOS offices</a>'
            '<a class="achip" href="#trust">🛡 Buy with confidence</a>'
            '</div></div></div>'

            '<section style="padding-top:clamp(22px,3vw,36px)" id="marketplaces"><div class="wrap">'
            '<div class="section-head"><div><span class="eyebrow">Verified marketplaces</span><h2 class="h2">Shop online</h2></div></div>'
            '<div class="grid g2">'
            '<div class="card card-pad"><span class="chip ok">Verified · checked 2026</span><h3 class="h3" style="margin-top:10px">Amazon UAE</h3>'
            '<p>' + T.brand(15) + ' memory and storage products available with Prime delivery across the UAE and wider Gulf region.</p>'
            '<a class="btn btn-primary btn-sm" href="https://www.amazon.ae" target="_blank" rel="noopener">Visit Amazon.ae ↗</a></div>'
            '<div class="card card-pad"><span class="chip ok">Verified · checked 2026</span><h3 class="h3" style="margin-top:10px">Newegg</h3>'
            '<p>The full consumer line — VOLTX memory, CoreX SSDs, flash and accessories — on one of the largest PC hardware marketplaces.</p>'
            '<a class="btn btn-primary btn-sm" href="https://www.newegg.com" target="_blank" rel="noopener">Visit Newegg ↗</a></div></div>'
            '<p class="mp-pending"><b>Also listed on:</b> ' + pending + ' — storefront listings are re-verified quarterly before links are published.</p>'
            '</div></section>'

            '<section id="locator" style="padding-top:clamp(30px,4vw,50px)"><div class="wrap">'
            '<div class="section-head"><div><span class="eyebrow">Distributor locator</span><h2 class="h2">Find the channel in your country</h2></div>'
            '<a class="btn btn-ghost btn-sm" href="partners.html">Become a distributor →</a></div>'
            '<div class="loc-stats"><div class="ls-cell"><b>93+</b><span>countries served</span></div>'
            '<div class="ls-cell"><b>' + str(n_all) + '</b><span>markets listed</span></div>'
            '<div class="ls-cell"><b>6</b><span>regions</span></div>'
            '<div class="ls-cell"><b>5</b><span>TwinMOS offices</span></div></div>'
            '<div class="geo-bar" id="geoBar" hidden></div>'
            '<div class="loc-controls">'
            '<div class="loc-search"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="7.2" cy="7.2" r="5.4"/><path d="M11.2 11.2 15 15"/></svg>'
            '<input type="search" id="locSearch" placeholder="Search country or city — e.g. Kenya, Dubai, Lagos…" aria-label="Search distributor by country or city"></div>'
            '<select id="locStatus" aria-label="Filter by channel status"><option value="all">All channel types</option>'
            '<option value="authorized">Authorized distribution</option><option value="expanding">Expanding coverage</option>'
            '<option value="seeking">Seeking distributors</option><option value="hub">TwinMOS hubs</option></select>'
            '</div>'
            '<div class="loc-chips" id="locChips" role="group" aria-label="Filter by region">' + chips + '</div>'
            '<div class="loc-meta"><span id="locCount" aria-live="polite">Showing ' + str(n_all) + ' markets</span>'
            '<span class="loc-hint">Named partners are shared on inquiry — TwinMOS publishes only verified channels.</span></div>'
            '<div class="grid g3 dgrid" id="locGrid">' + _loc_cards() + '</div>'
            '<div class="loc-empty" id="locEmpty" hidden>'
            '<b>No channel listed for your search yet?</b>'
            '<p>TwinMOS ships worldwide via verified marketplaces and appoints distributors market by market. Our sales team will connect you with the nearest channel — or you can bring TwinMOS to your market.</p>'
            '<a class="btn btn-primary btn-sm" href="mailto:sales@twinmos.com">Contact sales</a>'
            '<a class="btn btn-ghost btn-sm" href="partners.html">Become a distributor</a></div>'
            '</div></section>'

            '<section id="offices" style="padding-top:clamp(30px,4vw,50px)"><div class="wrap">'
            '<div class="section-head"><div><span class="eyebrow">Global network</span><h2 class="h2">TwinMOS offices &amp; hubs</h2></div></div>'
            + T.office_cards() +
            '<div class="card office" style="background:var(--bg-tint);max-width:520px;margin-top:6px">'
            '<span class="of-flag">🌐</span><span class="of-role">Distributors &amp; resellers</span><b>Worldwide channel</b>'
            '<address>TwinMOS products reach 93+ countries through authorized distribution. To become a partner or find your nearest supplier, contact <b>sales@twinmos.com</b>.</address>'
            '<a class="btn btn-ghost btn-sm" style="margin-top:10px" href="partners.html">Partner program</a></div>'
            '</div></section>'

            '<section id="trust" style="padding-top:clamp(30px,4vw,50px);padding-bottom:clamp(34px,4vw,56px)"><div class="wrap">'
            '<div class="card card-pad wtb-trust">'
            '<div class="trust-item">🛡 <span>Authorized only<small>Channels meeting authenticity &amp; support standards</small></span></div>'
            '<div class="trust-item">🕒 <span>Quarterly review<small>Marketplace &amp; retailer listings re-verified every 90 days</small></span></div>'
            '<div class="trust-item">✅ <span>Serial verification<small>Bought elsewhere? Verify authenticity with serial check</small></span></div>'
            '<div class="trust-item">🤝 <span>Partner with us<small>Distributor &amp; reseller programs — response within 48 h</small></span></div>'
            '</div>'
            '<div class="note-box" style="margin-top:24px">⚠️ Only buy from verified marketplaces and authorized distributors — counterfeit memory is a real risk. '
            'If a listing looks off, <a href="contact.html">ask us to verify</a>.</div>'
            '</div></section>')
    T.page('where-to-buy.html', 'Where to Buy — TwinMOS',
           'TwinMOS distributor locator by country — authorized distribution across the Middle East, Africa, Asia and beyond, plus verified online marketplaces.',
           body, active='buy', crumbs=[('index.html', 'Home'), ('where-to-buy.html', 'Where to buy')])

def build_gaming():
    # VOLTX spec matrix from the live gaming-DRAM catalog
    _g = [p for p in _PRODUCTS if p['cat'] == 'dram-gaming'][:4]
    spec_rows = ''.join(
        '<tr><td><a href="product.html?id=%s" style="color:#fff;font-weight:700">%s</a>'
        '<br><span style="font-size:12px;color:#8CA0B0">%s</span></td>'
        '<td><span class="chip" style="background:rgba(0,240,255,.1);border-color:rgba(0,240,255,.35);color:#00F0FF">%s</span></td>'
        '<td style="color:#B9C6D2">%s</td>'
        '<td><span class="chip" style="background:rgba(124,58,237,.15);border-color:rgba(124,58,237,.4);color:#C4B5FD">%s</span></td></tr>'
        % (H.escape(p['id']), H.escape(p['name'][:44]), H.escape(p.get('brand', '')),
           H.escape(p.get('shortSpec', '')), 'Lifetime' if 'ife' in (p.get('warranty') or '') else H.escape(p.get('warranty', '—')),
           'XMP 3.0 / EXPO' if 'DDR5' in p.get('shortSpec', '') else 'XMP 2.0')
        for p in _g)
    # ---- RGB effects lab (corpus 03) - pure-CSS visualizer, no JS, reduced-motion safe
    _fx = (('static', 'Static'), ('breathing', 'Breathing'), ('rainbow', 'Rainbow'),
           ('wave', 'Wave'), ('meteor', 'Meteor'))
    _fx_inputs = ''.join('<input type="radio" name="rgbfx" id="fx-%s"%s>' % (k, ' checked' if i == 0 else '')
                         for i, (k, _) in enumerate(_fx))
    _fx_labels = ''.join('<label class="fx-chip" for="fx-%s"><span>%s</span></label>'
                         % (k, H.escape(l)) for k, l in _fx)
    _fx_segments = '<i></i>' * 8
    rgb_lab = (
        '<section style="padding-top:0" id="rgb"><div class="wrap">'
        '<div class="section-head"><div><span class="eyebrow" style="color:#00F0FF">RGB lab</span>'
        '<h2 class="h2" style="color:#fff">Pick your glow</h2></div>'
        '<a class="link-arrow" style="color:#00F0FF" href="article.html?id=what-is-rgb-sync">RGB sync 101</a></div>'
        '<div class="card rgb-lab">' + _fx_inputs +
        '<div class="rgb-stage"><div class="rgb-module" role="img" aria-label="VOLTX DDR5 RGB module with the selected lighting effect">' + _fx_segments + '</div></div>'
        '<div class="fx-row" role="radiogroup" aria-label="Lighting effect">' + _fx_labels + '</div>'
        '<p class="form-note" style="margin:14px 0 0;color:#8CA0B0">Effects render through your motherboard software \u2014 ASUS Aura Sync, Gigabyte RGB Fusion, MSI Mystic Light or ASRock Polychrome. This is a preview, not a driver.</p>'
        '</div></div></section>')

    # ---- XMP 3.0 / EXPO tuning (corpus 05) - profile values from the live product data
    tuning = (
        '<section style="padding-top:0" id="tuning"><div class="wrap">'
        '<div class="section-head"><div><span class="eyebrow" style="color:#00F0FF">Tuning</span>'
        '<h2 class="h2" style="color:#fff">Flip the switch: XMP 3.0 &amp; EXPO</h2></div>'
        '<a class="link-arrow" style="color:#00F0FF" href="article.html?id=what-is-xmp">What is XMP?</a></div>'
        '<div class="grid g2">'
        '<div class="b-cell b-neon"><h3 style="color:#fff;margin:0 0 10px">Enable your rated speed</h3>'
        '<ol class="oc-steps">'
        '<li><b>Restart into BIOS/UEFI</b><span>Press <span class="kbd">Del</span> or <span class="kbd">F2</span> during boot.</span></li>'
        '<li><b>Open the memory tuner</b><span>\u201cAI Tweaker / XMP\u201d on Intel boards, \u201cEXPO\u201d or \u201cA-XMP\u201d on AMD.</span></li>'
        '<li><b>Enable Profile 1</b><span>The module\u2019s factory-validated settings load automatically.</span></li>'
        '<li><b>Save &amp; verify</b><span>Boot, then confirm the speed in Task Manager \u2192 Performance \u2192 Memory.</span></li></ol>'
        '<div class="fx-row" style="justify-content:flex-start;margin-top:14px">'
        '<span class="sync-badge">XMP 3.0 \u00b7 P1 \u2014 6000 MT/s \u00b7 CL36-46-46-86 \u00b7 1.35V</span>'
        '<span class="sync-badge">EXPO \u2014 validated for AM5</span></div></div>'
        '<div class="b-cell b-neon"><h3 style="color:#fff;margin:0 0 10px">Why 6000 is the sweet spot</h3>'
        '<p style="color:#B9C6D2;margin:0 0 12px">On Ryzen 7000/9000, DDR5-6000 keeps the memory controller 1:1 with Infinity Fabric (FCLK 2000MHz) \u2014 the lowest-latency ratio for AM5. On Intel, 6000MT/s XMP profiles are a one-toggle upgrade on 12th Gen and newer.</p>'
        '<p style="color:#B9C6D2;margin:0 0 12px">Fallback timings (JEDEC) run CL36-36-36-68 \u2014 stability first, speed on demand.</p>'
        '<p style="color:#8CA0B0;margin:0 0 12px">\u26a0 Enabling XMP/EXPO does not void your lifetime DRAM warranty. Confirm stability with a memory stress test after tuning.</p>'
        '<a class="link-arrow" style="color:#00F0FF" href="article.html?id=what-is-amd-expo">What is AMD EXPO?</a></div>'
        '</div></div></section>')

    # ---- community builds (corpus 06/07) - demo entries, placeholder attribution (BR-14.2 pattern)
    _builds = (
        ('Competitive', 'Crimson Velocity', 'Ryzen 7 7800X3D \u00b7 RTX 4070 \u00b7 VOLTEX DDR5 RGB 32GB 6000MHz \u00b7 CoreX Pro 2TB',
         '\u201cEXPO was literally one toggle \u2014 240Hz competitive with zero drama.\u201d'),
        ('RGB Showcase', 'Neon Cathedral', 'Core i7-14700K \u00b7 RTX 4080 Super \u00b7 VOLTEX DDR5 RGB 32GB \u00b7 Xtreme Gen4 2TB',
         '\u201cEvery component breathes the same wave pattern. The rig IS the screensaver.\u201d'),
        ('SFF', 'Blackout Box', 'Ryzen 5 7600 \u00b7 RTX 4060 \u00b7 VOLTEX DDR5 16GB \u00b7 CoreX Pro 1TB',
         '\u201c10 litres of volume, full-size frame rates. LAN parties fear it.\u201d'),
    )
    builds = (
        '<section style="padding-top:0" id="builds"><div class="wrap">'
        '<div class="section-head"><div><span class="eyebrow" style="color:#00F0FF">Community</span>'
        '<h2 class="h2" style="color:#fff">Rigs from the scene</h2></div></div>'
        '<div class="grid g3">' + ''.join(
            '<div class="b-cell b-neon"><span class="chip" style="background:rgba(0,240,255,.1);border-color:rgba(0,240,255,.35);color:#00F0FF;align-self:flex-start">%s</span>'
            '<b style="color:#fff">%s</b>'
            '<span style="font-size:12.5px;color:#8CA0B0">%s</span>'
            '<p style="margin:8px 0 0;color:#B9C6D2;font-style:italic">%s</p>'
            '<span class="form-note" style="margin-top:auto;padding-top:10px">Demo entry \u2014 publishes with signed release</span></div>'
            % (H.escape(c), H.escape(n), H.escape(sp), H.escape(q)) for c, n, sp, q in _builds) + '</div>'
        '<div style="display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;margin-top:16px">'
        '<p class="form-note" style="margin:0;color:#8CA0B0">Build gallery submissions open with the production hub \u2014 moderated, with builder consent.</p>'
        '<a class="btn btn-hot btn-sm" href="contact.html">Submit your build</a></div>'
        '</div></section>')

    # ---- wallpapers (corpus 10) - real baked downloads
    walls = ''
    _wp = getattr(SC, 'WALLPAPERS', [])
    if _wp:
        _cards = ''.join(
            '<div class="b-cell b-neon" style="padding:16px">'
            '<img class="wall-thumb%s" src="%s" alt="%s wallpaper preview" loading="lazy">'
            '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:12px">'
            '<div><b style="color:#fff">%s</b><span style="display:block;font-size:12px;color:#8CA0B0">%d \u00d7 %d</span></div>'
            '<a class="btn btn-hot btn-sm" href="%s" download>Download</a></div></div>'
            % (H.escape(' wall-tall' if h > w else ''), H.escape(p), H.escape(t), H.escape(t), w, h, H.escape(p))
            for t, w, h, p in _wp)
        walls = (
            '<section style="padding-top:0" id="downloads"><div class="wrap">'
            '<div class="section-head"><div><span class="eyebrow" style="color:#00F0FF">Downloads</span>'
            '<h2 class="h2" style="color:#fff">Take the vibe with you</h2></div></div>'
            '<div class="grid g3">' + _cards + '</div>'
            '<p class="form-note" style="margin-top:10px;color:#8CA0B0">Official TwinMOS wallpapers \u2014 free for personal use on your desktop and devices.</p>'
            '</div></section>')

    # ---- gaming stories (corpus 11) - real corpus articles
    _gids = ('voltx-ddr5-rgb-gaming', 'directstorage-gen5-gaming', 'best-ram-for-gaming')
    _arts = {a['id']: a for a in SC.ARTICLES}
    stories = ''
    if _arts:
        _pick = [_arts[i] for i in _gids if i in _arts][:3]
        for _a in SC.ARTICLES:            # pad with any remaining articles up to 3
            if len(_pick) >= 3:
                break
            if _a['id'] not in _gids:
                _pick.append(_a)
        stories = (
            '<section style="padding-top:0" id="stories"><div class="wrap">'
            '<div class="section-head"><div><span class="eyebrow" style="color:#00F0FF">Gaming stories</span>'
            '<h2 class="h2" style="color:#fff">From the VOLTX desk</h2></div>'
            '<a class="link-arrow" style="color:#00F0FF" href="news.html">All news</a></div>'
            '<div class="grid g3">' + ''.join(
                '<a class="card card-pad article-card" href="article.html?id=%s" style="text-decoration:none;background:#141418;border-color:#262626">'
                '<span class="chip" style="align-self:flex-start;background:rgba(0,240,255,.1);border-color:rgba(0,240,255,.35);color:#00F0FF">%s</span>'
                '<b style="display:block;color:#fff;margin:10px 0 8px;font-size:15.5px;line-height:1.4">%s</b>'
                '<span class="form-note" style="color:#8CA0B0">%s\u2026</span>'
                '<span class="link-arrow" style="margin-top:auto;padding-top:10px;font-size:13.5px;color:#00F0FF">Read article</span></a>'
                % (H.escape(a['id']), H.escape(a.get('cat', 'Gaming')), H.escape(a['title']), H.escape(a.get('desc', '')[:120]))
                for a in _pick) + '</div></div></section>')

    body = (T.hero_slider(SC.GAMING_SLIDES,
            '<div><b>DDR5</b><span>Newest platform</span></div>'
            '<div><b>Lifetime</b><span>Module warranty</span></div>'
            '<div><b>14,000</b><span>MB/s with CoreX Pro</span></div>',
            label='VOLTX gaming highlights')
            # neon stat counters band
            + '<section class="gstat-band"><div class="wrap gstat-in">'
            '<div><b data-counter="6000">6,000</b><span>MT/s DDR5 XMP speeds</span></div>'
            '<div><b data-counter="14000">14,000</b><span>MB/s Gen 5 game loads</span></div>'
            '<div><b>CL30</b><span>tight VOLTX latencies</span></div>'
            '<div><b>Lifetime</b><span>warranty on every module</span></div>'
            '</div></section>'
            + '<section id="arsenal"><div class="wrap"><div class="section-head">'
            '<div><span class="eyebrow">The arsenal</span><h2 class="h2" style="color:#fff">VOLTX &amp; gaming-grade gear</h2></div>'
            '<a class="link-arrow" style="color:#00F0FF" href="shop.html?cat=dram-gaming">All gaming DRAM</a></div>' + T.rail('gaming')
            # spec matrix
            + '<div class="gspec-wrap" id="specs"><table class="tbl gspec"><thead><tr>'
            '<th>Module</th><th>Speed</th><th>Warranty</th><th>Profiles</th></tr></thead>'
            '<tbody>' + spec_rows + '</tbody></table>'
            '<p class="form-note" style="margin-top:10px;color:#8CA0B0">Representative lineup — see each product page for validated speeds per platform.</p></div>'
            '</div></section>'
            # RGB sync ecosystem strip
            + '<section style="padding-top:0" id="sync"><div class="wrap">'
            '<div class="rgb-sync-strip">'
            '<div><span class="eyebrow" style="color:#00F0FF">Sync ecosystems</span>'
            '<h3 class="h3" style="color:#fff;margin:6px 0 4px">Lights that obey your board</h3>'
            '<p style="margin:0;color:#B9C6D2;max-width:44ch">VOLTX RGB addressable bars follow the motherboard’s lighting controller — no extra software war.</p></div>'
            '<div class="rgb-sync-badges">'
            '<span class="sync-badge">ASUS <b>Aura Sync</b></span>'
            '<span class="sync-badge">Gigabyte <b>RGB Fusion</b></span>'
            '<span class="sync-badge">MSI <b>Mystic Light</b></span>'
            '<span class="sync-badge">ASRock <b>Polychrome</b></span></div>'
            '</div></div></section>'
            + rgb_lab
            + '<section style="padding-top:0"><div class="wrap"><div class="grid g4">'
            '<div class="b-cell b-neon b-span2" style="min-height:190px"><span class="eyebrow" style="color:#00F0FF">DirectStorage ready</span>'
            '<h3 style="color:#fff">Load worlds, not bars</h3><p>Gen 5 bandwidth keeps Microsoft DirectStorage pipelines saturated — up to 14,000 MB/s from the CoreX Pro.</p>'
            '<a class="link-arrow" style="color:#00F0FF" href="article.html?id=directstorage-gen5-gaming">How DirectStorage works</a></div>'
            '<div class="b-cell b-neon stat-ring" style="justify-content:flex-start;align-items:flex-start"><b>DDR5</b>'
            '<p style="margin:6px 0 0;color:#B9C6D2">Higher densities and bus efficiency for streaming while you frag.</p></div>'
            '<div class="b-cell b-neon stat-ring" style="justify-content:flex-start;align-items:flex-start"><b>RGB</b>'
            '<p style="margin:6px 0 0;color:#B9C6D2">Addressable bars synced with major motherboard ecosystems.</p></div>'
            '</div></div></section>'
            + tuning
            + '<section style="padding-top:0"><div class="wrap">'
            '<div class="card card-pad" style="background:linear-gradient(120deg,#141414,#0A0A0A);border-color:#262626;display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap">'
            '<div><h2 class="h2" style="color:#fff;margin-bottom:6px">Build the full rig</h2>'
            '<p style="margin:0;color:#B9C6D2;max-width:52ch">Gaming DRAM + Gen 5 storage + 80 PLUS Bronze power — plan the whole load-out in the compare tray.</p></div>'
            '<a class="btn btn-hot btn-lg" href="compare.html">Compare your build</a></div></div></section>'
            # gaming guides chips (ADATA QuikTips pattern)
            + '<section style="padding-top:0"><div class="wrap">'
            '<div class="brand-row" style="border-color:#262626"><span class="brand-row-l" style="color:#8CA0B0">Level up</span>'
            '<a class="brand-chip" href="article.html?id=best-ram-for-gaming">Best RAM for gaming</a>'
            '<a class="brand-chip" href="article.html?id=best-ssd-for-gaming">Best SSD for gaming</a>'
            '<a class="brand-chip" href="article.html?id=rgb-ram-buyers-guide">RGB RAM buyer\u2019s guide</a>'
            '<a class="brand-chip" href="article.html?id=what-is-xmp">What is XMP?</a>'
            '<a class="brand-chip" href="article.html?id=what-is-amd-expo">What is EXPO?</a>'
            '</div></div></section>'
            '<section style="padding-top:0"><div class="wrap">'
            '<div class="section-head"><div><span class="eyebrow" style="color:#00F0FF">The brand</span><h2 class="h2" style="color:#fff">VOLTX, explained</h2></div></div>'
            '<div class="grid g3">' + ''.join(
                '<div class="b-cell b-neon"><b style="color:#fff">%s</b><p style="margin:4px 0 0;color:#B9C6D2">%s</p></div>' % (H.escape(t), H.escape(d[:120]))
                for t, d in [
                    ('Brand story', 'The VOLTX manifesto — identity and vision behind TwinMOS gaming memory and storage.'),
                    ('The name VOLTX', 'Voltage and energy, with the X marking the extreme edge of what memory can do \u2014 built for players who push every limit.'),
                    ('RGB ecosystems', 'Addressable bars synced with ASUS Aura Sync, Gigabyte RGB Fusion, MSI Mystic Light and ASRock Polychrome.'),
                ]) + '</div>'
            # esports & partnerships (corpus 08) — grounded: real partner program, no invented tiers
            + '<div class="grid g3" style="margin-top:16px">'
            '<a class="b-cell b-neon" href="partners.html" style="text-decoration:none"><b style="color:#fff">\U0001F3C6 Esports &amp; partnerships</b><p style="margin:4px 0 0;color:#B9C6D2">Teams, tournaments and creators \u2014 bring your proposal to the TwinMOS partner program.</p></a>'
            '<a class="b-cell b-neon" href="article.html?id=what-is-rgb-sync" style="text-decoration:none"><b style="color:#fff">\U0001F4A1 RGB sync 101</b><p style="margin:4px 0 0;color:#B9C6D2">How addressable lighting talks to your board \u2014 read the explainer now.</p></a>'
            '<a class="b-cell b-neon" href="shop.html?cat=dram-gaming" style="text-decoration:none"><b style="color:#fff">\U0001F3AE Shop VOLTX</b><p style="margin:4px 0 0;color:#B9C6D2">DDR5 with lifetime warranty, from 4800 to 6000MT/s \u2014 pick your kit.</p></a>'
            '</div></section>'
            + builds
            + walls
            + stories)
    T.page('gaming.html', 'VOLTX Gaming Hub — TwinMOS', 'TwinMOS VOLTX gaming memory: DDR5, RGB, lifetime warranty — plus Gen 5 storage for DirectStorage gaming.',
           body, active='gaming', dark=True, crumbs=[('index.html', 'Home'), ('gaming.html', 'Gaming')])

def build_solutions():
    verts = PB_C.solution_verticals()
    vhtml = ''
    if verts:
        vhtml = ('<div class="section-head" id="workloads" style="margin-top:clamp(30px,4vw,50px)"><div>'
                 '<span class="eyebrow">By workload</span><h2 class="h2">Built on the real catalogue</h2></div></div>'
                 '<div class="grid g3">' + ''.join(
            '<a class="card card-pad" href="shop.html" style="text-decoration:none">'
            '<span class="chip">%s</span><b style="display:block;color:var(--ink);margin:10px 0 6px;line-height:1.4">%s</b>'
            '<span class="form-note">%s…</span><span class="link-arrow" style="display:inline-block;margin-top:10px">See the hardware →</span></a>'
            % (H.escape(cat), H.escape(t), H.escape(d[:110])) for cat, t, d in verts) + '</div>')
    facts = (('1998', 'Founded in Taipei — memory specialists ever since'),
             ('93+', 'Countries served across 5 continents'),
             ('100+', 'Products in the live catalogue'),
             ('Lifetime', 'DRAM warranty — 5 years NVMe &amp; flash, 3 years SATA'))
    fhtml = ''.join('<div class="b-cell"><span class="big">%s</span><span>%s</span></div>' % f for f in facts)
    offices = (('Taipei, Taiwan', 'Headquarters &amp; R&amp;D Center', 'Product design, validation and quality system — TÜV SÜD ISO 9001 certified since 2002.'),
               ('Dongguan, China', 'Manufacturing facility', 'Volume production of modules and drives, alongside additional lines in Hsinchu and Xinjiang.'),
               ('Dubai, UAE (DAFZA)', 'International office — MEA', 'Coverage for the Middle East, Africa and CIS markets.'),
               ('Cologne, Germany', 'TwinMOS Europe GmbH', 'European channel, logistics and regional quoting.'),
               ('San Jose, USA', 'TwinMOS America Inc.', 'North-American sales and partner support.'))
    ohtml = ''.join(
        '<div class="card card-pad"><span class="chip">%s</span><b style="display:block;color:var(--ink);margin:10px 0 4px;font-size:15.5px">%s</b>'
        '<span class="form-note">%s</span></div>' % o for o in offices)
    body = ('<div class="page-hero"><div class="wrap"><span class="eyebrow">B2B &amp; OEM</span><h1 class="h1">Memory solutions at scale</h1>'
            '<p class="lede">' + T.brand(16) + ' markets its products under its own brand and serves as an OEM provider — a line we have held since 1998. From regional distribution to fleet refreshes and custom-labeled modules, we supply the memory and storage layer for your business.</p></div></div>'
            '<section style="padding-top:clamp(22px,3vw,36px)"><div class="wrap">'
            '<div class="grid g4">' + fhtml + '</div>'
            '<div class="grid g3" style="margin-top:clamp(18px,2.4vw,28px)">'
            '<div class="card card-pad" id="dist"><span class="chip">Distribution</span><h3 class="h3" style="margin-top:10px">Regional distribution</h3>'
            '<p>Partners, distributors and resellers bring ' + T.brand(15) + ' to 93+ countries. The program is simple: tell us your market and product focus, and the regional office takes it from there.</p>'
            '<a class="link-arrow" href="partners.html">Partner program</a></div>'
            '<div class="card card-pad" id="oem"><span class="chip">OEM / ODM</span><h3 class="h3" style="margin-top:10px">OEM manufacturing</h3>'
            '<p>Custom-labeled modules and drives built on our Taipei R&amp;D and Dongguan manufacturing base — JEDEC-compliant DRAM from DDR3 to DDR5, plus NVMe, SATA, portable and flash lines.</p>'
            '<a class="link-arrow" href="quote.html">Start an OEM quote</a></div>'
            '<div class="card card-pad" id="fleet"><span class="chip">Enterprise</span><h3 class="h3" style="margin-top:10px">Fleet &amp; workplace</h3>'
            '<p>Volume DDR4/DDR3 lines keep business fleets alive; NVMe refreshes cut boot and load times across the estate. A published end-of-life list lets IT plan every refresh cycle.</p>'
            '<a class="link-arrow" href="quote.html">Volume quotation</a></div></div>'
            + vhtml +
            '<div class="section-head" id="process" style="margin-top:clamp(30px,4vw,50px)"><div><span class="eyebrow">Process</span><h2 class="h2">From requirement to rollout</h2></div></div>'
            '<div class="steps">'
            '<div class="step"><b>Share requirements</b><span>Platform, capacities, quantities, target regions — one form or one email.</span></div>'
            '<div class="step"><b>Engineering review</b><span>Taipei R&amp;D checks compatibility and proposes the exact SKUs or a custom build.</span></div>'
            '<div class="step"><b>Quote &amp; samples</b><span>Pricing, lead time and evaluation samples for your qualification.</span></div>'
            '<div class="step"><b>Production &amp; delivery</b><span>Dongguan manufacturing and worldwide delivery, with the regional office as your single contact.</span></div></div>'
            '<div class="section-head" id="footprint" style="margin-top:clamp(30px,4vw,50px)"><div><span class="eyebrow">Footprint</span><h2 class="h2">Where we operate</h2></div></div>'
            '<div class="grid g3">' + ohtml + '</div>'
            '<div class="trust-band" style="margin-top:clamp(18px,2.4vw,28px);border-inline:1px solid var(--border);border-radius:var(--radius)"><div class="wrap">'
            '<span class="trust-item">🛡️ <span>TÜV SÜD ISO 9001<small>certified since 2002</small></span></span>'
            '<span class="trust-item">📐 <span>JEDEC standards<small>DRAM compliance</small></span></span>'
            '<span class="trust-item">🌱 <span>RoHS · CE · FCC · EPEAT<small>product compliance</small></span></span>'
            '<span class="trust-item">📜 <span>Published EOL list<small>plan refreshes ahead</small></span></span>'
            '</div></div>'
            '<div class="grid g2" style="margin-top:clamp(30px,4vw,50px)">'
            '<div class="card card-pad"><h3 class="h3" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">Why teams choose ' + T.brand(17) + '</h3><ul>'
            '<li><b>Since 1998</b> — a memory specialist, not a diversified conglomerate</li>'
            '<li><b>Rigorous quality control</b> — TÜV SÜD ISO 9001 certified since 2002; RoHS, CE, FCC and EPEAT compliant</li>'
            '<li><b>JEDEC-compliant DRAM</b> across DDR3, DDR4 and DDR5</li>'
            '<li><b>Taipei HQ &amp; R&amp;D</b>, Dongguan manufacturing, and offices in Dubai, Cologne and San Jose</li>'
            '<li><b>Warranty that holds</b> — lifetime on DRAM, 5 years on NVMe &amp; flash, 3 years on SATA SSD</li></ul></div>'
            '<div class="card card-pad" style="background:var(--bg-tint)"><h3 class="h3">Start a conversation</h3>'
            '<p>Send your requirements and the regional office nearest you — Dubai, Cologne, San Jose or Taipei — will pick it up from there.</p>'
            '<div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn btn-primary" href="quote.html">Request a quote</a>'
            '<a class="btn btn-ghost" href="contact.html">Contact an office</a></div><div class="divider"></div>'
            '<p class="form-note">sales@twinmos.com · +886-970 368 077 · Mon–Fri 9am–5pm (Taipei)</p></div></div>'
            '</div></section>')
    T.page('solutions.html', 'B2B & OEM Memory Solutions — TwinMOS', 'TwinMOS B2B and OEM solutions since 1998: regional distribution to 93+ countries, custom-labeled manufacturing in Dongguan, and fleet upgrades backed by lifetime DRAM warranty.',
           body, active='solutions', crumbs=[('index.html', 'Home'), ('solutions.html', 'Solutions')])

# ---------------------------------------------------------------- support / rma
def _kb_section():
    """Knowledge-base library rendered from the imported corpus (F8.7)."""
    kb = getattr(SC, 'KB', [])
    if not kb:
        return ''
    cards = ''.join(
        '<a class="card card-pad" href="article.html?id=%s" style="text-decoration:none">'
        '<span class="chip">KB</span>'
        '<b style="display:block;color:var(--ink);margin:10px 0 6px;line-height:1.4">%s</b>'
        '<span class="form-note">%s…</span></a>'
        % (H.escape(k['slug']), H.escape(k['title']), H.escape(k['desc'][:110]))
        for k in kb[:9])
    return ('<section style="padding-top:0"><div class="wrap">'
            '<div class="section-head"><div><span class="eyebrow">Knowledge base</span>'
            '<h2 class="h2">Step-by-step guides from the support team</h2></div>'
            '<a class="link-arrow" href="search.html?q=install">Search the KB</a></div>'
            '<div class="grid g3">' + cards + '</div>'
            '<p class="form-note" style="margin-top:10px">%d knowledge-base articles in total — also searchable from the header.' % len(kb)
            + '</div></section>')

def build_support():
    faq_tabs, panes = [], []
    for i, (tab, items) in enumerate(SC.FAQ):
        faq_tabs.append('<button class="tab%s" data-tab="faq%d" role="tab">%s</button>' % (' on' if i == 0 else '', i, tab))
        acc = ''.join('<details%s><summary>%s</summary><div class="acc-body">%s</div></details>'
                      % (' open' if (j == 0 and i == 0) else '', H.escape(q), H.escape(a))
                      for j, (q, a) in enumerate(items))
        panes.append('<div class="tabpane%s" id="faq%d"><div class="acc">%s</div></div>' % (' on' if i == 0 else '', i, acc))
    body = ('<div class="page-hero"><div class="wrap"><span class="eyebrow">Support center</span><h1 class="h1">We’ve got your back</h1>'
            '<p class="lede">Answers, warranties and service — from a team that has been building memory since 1998. Search the knowledge base, track an RMA, or reach the Taipei support desk directly.</p>'
            '<form class="sup-search" id="supSearch" role="search">'
            '<input class="input" id="supSearchInput" type="search" placeholder="Search help articles — e.g. "enable XMP", "RMA status", "DDR5 laptop"…" aria-label="Search support articles">'
            '<button class="btn btn-primary" type="submit">Search help</button></form></div></div>'
            # warranty tier quick reference (F29.4 presentation standard)
            '<div class="wty-strip"><div class="wrap wty-in">'
            '<span class="wty-chip"><b>Lifetime</b> Memory modules</span>'
            '<span class="wty-chip"><b>5 years</b> NVMe SSD · flash · USB</span>'
            '<span class="wty-chip"><b>3 years</b> SATA SSD</span>'
            '<span class="wty-chip"><b>1 year</b> Accessories</span>'
            '<a href="legal.html#warranty">Full warranty policy →</a></div></div>'
            # six category cards (F8.1)
            '<section style="padding-top:clamp(22px,3vw,36px)"><div class="wrap"><div class="grid g3">'
            '<a class="card card-pad sup-cat" href="rma.html" style="text-decoration:none"><span class="sc-icon">🔧</span><span class="chip">Service</span><h3 class="h3" style="margin-top:10px">Warranty &amp; RMA</h3>'
            '<p>Start a guided return or track an existing one with your RMA number.</p><span class="link-arrow">Open RMA center</span></a>'
            '<a class="card card-pad sup-cat" href="legal.html#warranty" style="text-decoration:none"><span class="sc-icon">📜</span><span class="chip">Policy</span><h3 class="h3" style="margin-top:10px">Warranty policy</h3>'
            '<p>Lifetime on DRAM, 5 years on NVMe &amp; flash, 3 years on SATA SSD — full terms and exclusions.</p><span class="link-arrow">Read the policy</span></a>'
            '<a class="card card-pad sup-cat" href="compatibility.html" style="text-decoration:none"><span class="sc-icon">🔍</span><span class="chip">Tool</span><h3 class="h3" style="margin-top:10px">Compatibility help</h3>'
            '<p>Not sure which module fits your laptop or board? The finder matches your device in three steps.</p><span class="link-arrow">Open the finder</span></a>'
            '<a class="card card-pad sup-cat" href="#downloads" style="text-decoration:none"><span class="sc-icon">💾</span><span class="chip">Downloads</span><h3 class="h3" style="margin-top:10px">Firmware &amp; manuals</h3>'
            '<p>SSD firmware, utilities, manuals and printable quick-start guides for install day.</p><span class="link-arrow">Browse downloads</span></a>'
            '<a class="card card-pad sup-cat" href="#kb" style="text-decoration:none"><span class="sc-icon">📚</span><span class="chip">Guides</span><h3 class="h3" style="margin-top:10px">Install &amp; how-to</h3>'
            '<p>Step-by-step KB articles — DDR5 installation, cloning to a new SSD, checking drive health.</p><span class="link-arrow">Knowledge base</span></a>'
            '<a class="card card-pad sup-cat" href="contact.html" style="text-decoration:none"><span class="sc-icon">💬</span><span class="chip">Contact</span><h3 class="h3" style="margin-top:10px">Talk to support</h3>'
            '<p>sales@twinmos.com · +886-970 368 077 · Mon–Fri 9am–5pm (Taipei) — 48-hour answer SLA.</p><span class="link-arrow">Contact options</span></a></div></div></section>'
            # RMA tracker + SN-check teaser (research: on-site tracker is a differentiator)
            '<section style="padding-top:0"><div class="wrap">'
            '<a class="card card-pad learn-band" href="learn.html" style="text-decoration:none">'
            '<span class="sc-icon">🎓</span><span class="chip">New</span>'
            '<b>Knowledge hub — ' + str(sum(1 for a in SC.ARTICLES if a['cat'] in ('Guide', 'Explainer', 'Benchmark', 'Blog') and a['id'] != 'glossary')) + ' guides, explainers &amp; benchmarks</b>'
            '<span class="form-note">Buying guides, DDR5/NVMe technology explainers and an A–Z glossary from the ' + T.brand(13) + ' engineering team.</span>'
            '<span class="link-arrow" style="margin-top:auto">Open the Knowledge Hub →</span></a></div></section>'
            '<section style="padding-top:clamp(22px,3vw,36px)"><div class="wrap"><div class="grid g2">'
            '<div class="card card-pad rma-track" data-form-box>'
            '<h3 class="h3" style="display:flex;align-items:center;gap:8px">Track your RMA <span class="chip ok">Live in production</span></h3>'
            '<p class="form-note" style="margin-top:4px">Enter the number from your confirmation email — e.g. RMA-2026-123456 or TM-RMA-2026-0142.</p>'
            '<form id="rmaTrackForm" style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap">'
            '<input class="input" id="rmaTrackInput" placeholder="RMA-2026-123456" aria-label="RMA number" style="flex:1;min-width:200px">'
            '<button class="btn btn-primary" type="submit">Track</button></form>'
            '<div id="rmaTrackOut" style="margin-top:14px"></div></div>'
            '<div class="card card-pad" style="background:var(--bg-tint)">'
            '<h3 class="h3" style="display:flex;align-items:center;gap:8px">Serial check <span class="chip warn">Phase 2</span></h3>'
            '<p class="form-note" style="margin-top:4px">Verify a product is genuine TwinMOS hardware by serial number — VERIFIED GENUINE / NOT FOUND / SUSPECTED COUNTERFEIT results with anti-counterfeit reporting.</p>'
            '<div class="steps" style="margin-top:14px">'
            '<div class="step"><b>Find the serial</b><span>Printed on the module label and retail packaging.</span></div>'
            '<div class="step"><b>Check online</b><span>/support/sn-check ships with the production build.</span></div>'
            '<div class="step"><b>Report fakes</b><span>Suspect a counterfeit? The form routes to brand protection.</span></div></div>'
            '<a class="link-arrow" href="contact.html">Report suspicious hardware →</a></div></div></div></section>'
            '<section id="faq" style="padding-top:0"><div class="wrap">'
            '<div class="section-head"><div><span class="eyebrow">Knowledge</span><h2 class="h2">Frequently asked questions</h2></div>'
            '<span style="display:flex;gap:18px;align-items:baseline;flex-wrap:wrap"><a class="link-arrow" href="learn.html">Knowledge hub</a>'
            '<a class="link-arrow" href="news.html">More articles</a></span></div>'
            '<div class="tabs" role="tablist">' + ''.join(faq_tabs) + '</div>' + ''.join(panes) + '</div></section>'
            + _kb_section()
            # downloads & firmware (corpus 07-support/11-15)
            + '<section id="downloads" style="padding-top:0"><div class="wrap">'
            '<div class="section-head"><div><span class="eyebrow">Downloads</span><h2 class="h2">Firmware, manuals &amp; quick-start guides</h2></div></div>'
            '<div class="grid g3">'
            '<a class="card card-pad" href="support.html#kb" style="text-decoration:none"><span class="sc-icon">⚡</span><h3 class="h3" style="font-size:17px;margin-top:8px">SSD firmware center</h3>'
            '<p>Firmware updates verified against your serial number before download, with MD5/SHA checksums and changelogs — serial gate ships in Phase 2.</p><span class="link-arrow">How updates work</span></a>'
            '<a class="card card-pad" href="article.html?id=ddr5-installation-desktop" style="text-decoration:none"><span class="sc-icon">📖</span><h3 class="h3" style="font-size:17px;margin-top:8px">Manuals &amp; quick-start</h3>'
            '<p>Printable install guides for DDR5/DDR4 desktop and laptop modules — with the screwdriver you already own.</p><span class="link-arrow">Open the install guide</span></a>'
            '<a class="card card-pad" href="article.html?id=how-to-check-ssd-health-smart" style="text-decoration:none"><span class="sc-icon">🩺</span><h3 class="h3" style="font-size:17px;margin-top:8px">Drive health &amp; SMART</h3>'
            '<p>Check remaining endurance, temperature and SMART attributes on your TwinMOS SSD — no extra software needed for a first look.</p><span class="link-arrow">Read the guide</span></a>'
            '</div></div></section>'
            # published SLA band (F8.9)
            + '<section style="padding-top:0"><div class="wrap">'
            '<div class="sla-band"><div class="sla-cell"><b>≤ 5 min</b><span>Auto-reply with ticket number</span></div>'
            '<div class="sla-cell"><b>24 hrs</b><span>Sales &amp; quote response</span></div>'
            '<div class="sla-cell"><b>48 hrs</b><span>Support desk answer</span></div>'
            '<div class="sla-cell"><b>48 hrs</b><span>Distributor application review</span></div>'
            '<div class="sla-cta"><span>Still stuck?</span><a class="btn btn-accent" href="contact.html">Contact support</a></div></div>'
            '</div></section>')
    T.page('support.html', 'Support Center — TwinMOS', 'TwinMOS support: FAQ for DRAM, SSD, flash and accessories, warranty policy and RMA tracking.',
           body, active='support', crumbs=[('index.html', 'Home'), ('support.html', 'Support')])

def build_rma():
    stages = (('Describe the issue', 'Product, purchase details and what happened — photos help.'),
              ('Ship to service centre', 'We confirm the RMA number and return address by email.'),
              ('Diagnosis &amp; repair', 'Factory-standard testing; repair or replacement per policy.'),
              ('Shipped back', 'Tracking number issued; warranty continues per policy.'))
    steps = ''.join('<div class="step"><b>%s</b><span>%s</span></div>' % s for s in stages)
    opts = ''.join('<option>%s</option>' % H.escape(p['name']) for p in _PRODUCTS)
    body = ('<div class="page-hero"><div class="wrap"><span class="eyebrow">Warranty service</span><h1 class="h1">RMA center</h1>'
            '<p class="lede">Register a warranty return or track an existing one. Memory modules are covered for life; NVMe SSDs and flash for 5 years; SATA SSDs for 3 years — '
            '<a href="legal.html#warranty">full policy</a>.</p></div></div>'
            '<section style="padding-top:clamp(22px,3vw,36px)"><div class="wrap">'
            '<div class="section-head"><div><span class="eyebrow">How it works</span><h2 class="h2">Four steps, no surprises</h2></div></div>'
            '<div class="steps">' + steps + '</div></div></section>'
            '<section style="padding-top:0"><div class="wrap rma-cols">'
            '<div class="card card-pad" data-form-box><h2 class="h3">Start an RMA</h2>'
            '<form id="rmaForm" novalidate data-tm-form data-success="RMA request received — your RMA number and shipping instructions arrive by email within one business day."><div class="form-grid">'
            '<div class="fg" data-req><label>Full name <span class="req">*</span></label><input class="input" type="text" autocomplete="name"><span class="err">Enter your name</span></div>'
            '<div class="fg" data-req><label>Email <span class="req">*</span></label><input class="input" type="email" autocomplete="email"><span class="err">Enter a valid email</span></div>'
            '<div class="fg" data-req><label>Product <span class="req">*</span></label><select class="input" id="rmaProduct">'
            '<option value="">Select product…</option>' + opts + '</select><span class="err">Select the product</span></div>'
            '<div class="fg" data-req><label>Serial / part number <span class="req">*</span></label><input class="input" type="text" placeholder="e.g. NVCXP1TBG52280"><span class="err">Enter the part number</span></div>'
            '<div class="fg full" data-req data-min="10"><label>Issue description <span class="req">*</span></label>'
            '<textarea class="input" rows="4" placeholder="What happened, when, and any troubleshooting already tried…"></textarea>'
            '<span class="err">Tell us a little more (10+ characters)</span></div></div>'
            '<button class="btn btn-primary" type="submit" style="margin-top:14px">Submit RMA request</button>'
            '<p class="form-note" style="margin-top:10px">Prototype note: submission generates a demo RMA number; no data leaves your browser.</p></form></div>'
            '<div class="card card-pad"><h2 class="h3">Track an RMA</h2>'
            '<p class="form-note">Enter the RMA number from your confirmation email. Demo IDs: TM-RMA-2026-0142 · TM-RMA-2026-0388 · TM-RMA-2026-0517</p>'
            '<div style="display:flex;gap:10px;flex-wrap:wrap"><input class="input" id="rmaId" placeholder="TM-RMA-2026-0142" style="flex:1;min-width:200px">'
            '<button class="btn btn-accent" id="rmaTrackBtn">Track</button></div><div id="rmaOut"></div></div>'
            '</div></section>')
    T.page('rma.html', 'RMA Center — TwinMOS', 'Start or track a TwinMOS warranty return (RMA).',
           body, active='support', crumbs=[('index.html', 'Home'), ('support.html', 'Support'), ('rma.html', 'RMA center')])

# ---------------------------------------------------------------- news / article
def build_news():
    events = [a for a in SC.ARTICLES if a['cat'] == 'Event']
    rest = [a for a in SC.ARTICLES if a['cat'] not in ('Event', 'KB')]
    cats = sorted({a['cat'] for a in SC.ARTICLES if a['cat'] != 'KB'})
    def card(a, big):
        return ('<a class="card card-pad article-card" data-ncat="%s" href="article.html?id=%s">'
                '<span class="chip" style="align-self:flex-start">%s</span>'
                '<b style="display:block;color:var(--ink);margin:10px 0 8px;%s;line-height:1.4">%s</b>'
                '<span class="form-note">%s…</span>'
                '<span class="form-note" style="display:block;margin-top:10px;color:var(--accent-deep);font-weight:700">%s · %s</span></a>'
                % (a['cat'], a['id'], a['cat'], 'font-size:18px' if big else 'font-size:15.5px',
                   H.escape(a['title']), H.escape(a['desc'][:130]), a['date'], a['tag']))
    chips = ('<div class="tabs" id="newsChips" role="tablist" aria-label="Filter by category" style="margin-bottom:18px">'
             '<button class="tab on" data-ncat="all" role="tab">All</button>'
             + ''.join('<button class="tab" data-ncat="%s" role="tab">%s</button>' % (c, c) for c in cats)
             + '</div>')
    body = ('<div class="page-hero"><div class="wrap"><span class="eyebrow">Media &amp; events</span><h1 class="h1">Newsroom</h1>'
            '<p class="lede">Product news, guides from the memory team, and where to meet ' + T.brand(16) + ' on the road — straight from the source since 1998.</p></div></div>'
            '<section style="padding-top:clamp(22px,3vw,36px)"><div class="wrap">'
            '<div class="section-head"><div><span class="eyebrow">On the calendar</span><h2 class="h2">Events</h2></div></div>'
            '<div class="grid g2">' + ''.join(card(e, True) for e in events) + '</div>'
            '<div class="section-head" style="margin-top:clamp(30px,4vw,50px)"><div><span class="eyebrow">Library</span><h2 class="h2">Latest news &amp; articles</h2></div>'
            '<a class="link-arrow" href="learn.html">Guides &amp; explainers → Knowledge hub</a></div>'
            + chips + '<div class="grid g3" id="newsGrid">' + ''.join(card(a, False) for a in rest) + '</div></div></section>'
            '<section style="padding-top:0"><div class="wrap">'
            '<div class="card card-pad" style="display:flex;justify-content:space-between;gap:18px;align-items:center;flex-wrap:wrap;background:var(--bg-tint)">'
            '<div><h3 class="h3" style="margin-bottom:4px">For the press</h3>'
            '<p style="margin:0;max-width:60ch">Media kit (logos, imagery, boilerplate), the corporate fact sheet and the press-release archive live with the production press room — '
            'press@twinmos.com answers media requests within one business day.</p></div>'
            '<div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn btn-ghost" href="about.html">About &amp; facts</a>'
            '<a class="btn btn-primary" href="mailto:press@twinmos.com">Contact press</a></div></div></div></section>')
    T.page('news.html', 'Newsroom — TwinMOS', 'TwinMOS product news, technology guides and trade events (GITEX, COMPUTEX).',
           body, active='company', crumbs=[('index.html', 'Home'), ('news.html', 'Newsroom')])

def build_article():
    body = ('<section style="padding-top:clamp(26px,4vw,46px)"><div class="wrap"><div id="artRoot">'
            '<div class="empty-state"><h3>Loading article…</h3><p>JavaScript renders articles from the content library. '
            '<a href="learn.html">Open the Knowledge hub</a>.</p></div></div></div></section>'
            '<section style="padding-top:0"><div class="wrap">'
            '<div class="section-head"><div><span class="eyebrow">Keep reading</span><h2 class="h2" style="display:flex;align-items:center;gap:10px">Related reading</h2></div>'
            '<a class="link-arrow" href="learn.html">Knowledge hub</a></div>'
            '<div class="grid g3" id="artMore"></div></div></section>')
    T.page('article.html', 'Article — TwinMOS', 'TwinMOS media & articles library.', body, active='company',
           crumbs=[('index.html', 'Home'), ('news.html', 'Newsroom')])

# ---------------------------------------------------------------- about / careers / contact
def build_about():
    # unified line-icon set (stroke SVG, currentColor) — replaces emoji glyphs with enterprise iconography
    _ICONS = {
        'bolt': '<path d="M13 2.5 4.5 13.5H11l-1.5 8L18 10.5h-6.5L13 2.5z"/>',
        'shield': '<path d="M12 3 5.2 5.8v5.4c0 4.2 2.8 8 6.8 9.6 4-1.6 6.8-5.4 6.8-9.6V5.8L12 3z"/><path d="m9.2 12.2 2 2 3.8-4"/>',
        'medal': '<circle cx="12" cy="15" r="5.2"/><path d="m9.6 11.2-3-7.7h3.9L12 7.4l1.5-3.9h3.9l-3 7.7"/><path d="m12 13.2.8 1.7 1.9.3-1.4 1.3.3 1.9-1.6-.9-1.6.9.3-1.9-1.4-1.3 1.9-.3.8-1.7z"/>',
        'leaf': '<path d="M5 19c0-8 5-13 14-14 .5 8-3 14-11 14-1.2 0-2.2-.4-3-1z"/><path d="M5 19c3-5 7-8.5 11-10"/>',
        'users': '<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="16.8" cy="9.5" r="2.6"/><path d="M16 14.2c2.4.2 4 1.8 4.5 4.3"/>',
        'scale': '<path d="M12 4v16M7 20h10M5 8h14M5 8l-2.5 5.5a3 3 0 0 0 5 0L5 8zm14 0-2.5 5.5a3 3 0 0 0 5 0L19 8z"/>',
        'copy': '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>',
        'file': '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z"/><path d="M14 3v5h5"/>',
    }
    def _ico(name, size=22):
        return ('<svg width="%d" height="%d" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" '
                'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">%s</svg>' % (size, size, _ICONS[name]))

    # milestone timeline grouped into eras; watershed years emphasized; a terminus node for "Today"
    TL_ERAS = [('Foundation', '1998 – 2009', ('1998', '2001', '2002', '2000s')),
               ('Storage era', '2010 – 2021', ('2010',)),
               ('Gaming &amp; next-gen', '2022 – now', ('2022', '2023', '2024', 'Today'))]
    TL_MAJOR = {'1998', '2001', '2010', '2022', '2024'}
    _ms = {y: (y, t, d) for y, t, d in SC.MILESTONES}
    tl = ''
    for era, span, years in TL_ERAS:
        tl += '<div class="tl-era"><div class="tl-era-h"><b>%s</b><span>%s</span></div>' % (era, span)
        for y in years:
            _, t, d = _ms[y]
            tl += ('<div class="tl-item rv%s%s"><span class="tl-date">%s</span><b>%s</b><p>%s</p></div>'
                   % (' tl-major' if y in TL_MAJOR else '', ' tl-now' if y == 'Today' else '', y, t, d))
        tl += '</div>'

    # quality metrics infographic (corpus 05): target vs actual on scaled tracks
    # (label, actual, target, axis_min, axis_max, lower_is_better)
    QM = [('First-pass yield', 99.7, 99.5, 98.0, 100.0, False),
          ('Customer return rate', 0.25, 0.30, 0.0, 0.5, True),
          ('Burn-in failure rate', 0.40, 0.50, 0.0, 0.8, True),
          ('On-time delivery', 97.0, 95.0, 90.0, 100.0, False),
          ('ISO 9001 audit score', 94.0, 90.0, 80.0, 100.0, False)]
    def _qrow(label, act, tgt, lo, hi, lower):
        def pos(v):
            return max(0.0, min(100.0, (v - lo) / (hi - lo) * 100.0))
        meets = act <= tgt if lower else act >= tgt
        fmt = ('%.2f' % act) if act < 1 else ('%.1f' % act)
        tfmt = ('%.2f' % tgt) if tgt < 1 else ('%.1f' % tgt)
        return ('<div class="qm"><div class="qm-top"><b>%s%%</b>'
                '<span class="chip %s">target %s %s%%</span></div>'
                '<div class="qm-track"><span class="qm-target" style="left:%.1f%%"></span>'
                '<span class="qm-fill" style="width:%.1f%%"></span></div>'
                '<span class="qm-lbl">%s</span></div>'
                % (fmt, 'ok' if meets else 'warn', '&le;' if lower else '&ge;', tfmt,
                   pos(tgt), pos(act), H.escape(label)))
    qm_rows = ''.join(_qrow(*m) for m in QM)

    PIPE = [('Incoming IQC', 'Supplier COC validation and sampling plans on every IC lot'),
            ('In-process control', 'AOI and X-ray inspection with live SPC monitoring'),
            ('Functional test', 'Full electrical validation on reference platforms'),
            ('Burn-in screening', 'Thermal and stress cycling before release'),
            ('Final inspection', 'Cosmetic, packaging and batch traceability checks')]
    pipe = '<div class="steps apipe">' + ''.join('<div class="step"><b>%s</b><span>%s</span></div>' % s for s in PIPE) + '</div>'

    body = ('<div class="page-hero"><div class="wrap"><span class="eyebrow">Company</span><h1 class="h1">A legendary memory brand since 1998</h1>'
            '<p class="lede">' + T.brand(16) + ' Technologies designs, manufactures and markets memory and storage — under its own brand and as an OEM provider — for customers in more than 93 countries across five continents.</p>'
            '<div class="pillar-row" aria-label="Business pillars">'
            '<span class="pillar-chip"><b>DRAM</b> modules</span><span class="pillar-chip"><b>SSD</b> NVMe &amp; SATA</span>'
            '<span class="pillar-chip"><b>Portable</b> storage</span><span class="pillar-chip"><b>USB</b> flash &amp; accessories</span></div></div></div>'
            '<nav class="about-nav" aria-label="About sections"><div class="wrap about-nav-in">'
            '<a href="#overview">Overview</a><a href="#mission">Mission &amp; values</a><a href="#history">History</a>'
            '<a href="#quality">Quality</a><a href="#esg">Sustainability</a><a href="#global">Global</a><a href="#press">Press &amp; facts</a>'
            '</div></nav>'
            '<section id="overview" style="padding-top:clamp(22px,3vw,36px)"><div class="wrap about-cols">'
            '<div><span class="eyebrow">Who we are</span><h2 class="h2">Engineering confidence since 1998</h2>'
            '<p>' + T.brand(15) + ' Technologies is an independent memory and storage manufacturer headquartered in Taipei, with its international hub at Dubai DAFZA and manufacturing in Taiwan and Dongguan. '
            'From gaming enthusiasts running high-frequency DDR5 RGB to enterprises deploying NVMe Gen 5 fleets, we build products across four pillars — <b>DRAM, SSDs, portable storage and USB solutions</b>.</p>'
            '<p>Since establishing the Dubai free-zone hub in 2001, distribution has radiated to the Middle East, Africa, South Asia, CIS, Europe, Southeast Asia and the Americas — one brand, one quality standard, five continents.</p>'
            '<blockquote class="motto"><span class="motto-mark" aria-hidden="true">&ldquo;</span><b>Innovation, Perfection, and Quality</b>'
            '<span class="motto-sub">The ' + T.brand(15) + ' motto since 1998 — not a slogan, a methodology.</span></blockquote></div>'
            '<aside class="card card-pad factfile"><div class="ff-head"><span class="ff-badge">' + _ico('file', 17) + '</span><h3 class="h3">Company fact file</h3></div>'
            '<dl><div><dt>Founded</dt><dd>1998 · Taipei, Taiwan</dd></div>'
            '<div><dt>Team</dt><dd>301–500 employees</dd></div>'
            '<div><dt>Reach</dt><dd>93+ countries · 5 continents</dd></div>'
            '<div><dt>USB-IF Vendor ID</dt><dd class="ff-code"><span class="kbd">4719</span>'
            '<button class="ff-copy" type="button" data-copy="4719" aria-label="Copy USB-IF Vendor ID">' + _ico('copy', 13) + '</button></dd></div>'
            '<div><dt>IEEE OUI</dt><dd class="ff-code"><span class="kbd">000B9D</span>'
            '<button class="ff-copy" type="button" data-copy="000B9D" aria-label="Copy IEEE OUI">' + _ico('copy', 13) + '</button></dd></div>'
            '<div><dt>Status</dt><dd><span class="chip">Privately held</span></dd></div></dl>'
            '<p class="form-note ff-note">Registry identifiers — paste straight into USB-IF or IEEE lookups.</p></aside></div>'
            '<div class="grid g4" style="gap:14px;margin-top:clamp(24px,3vw,40px)">'
            '<div class="b-cell"><span class="big">27+</span><p>Years of continuous memory engineering.</p></div>'
            '<div class="b-cell"><span class="big">100+</span><p>Products across DRAM, SSD, portable, flash and accessories.</p></div>'
            '<div class="b-cell"><span class="big">93+</span><p>Countries served through offices and authorized distribution.</p></div>'
            '<div class="b-cell"><span class="big">5</span><p>Offices: Taipei, Dubai, Dongguan, Cologne, San Jose.</p></div></div></section>'
            '<section id="mission" style="padding-top:0"><div class="wrap">'
            '<div class="section-head"><div><span class="eyebrow">Our DNA</span><h2 class="h2">Mission, vision &amp; values</h2></div></div>'
            '<div class="grid g2">'
            '<div class="card card-pad mv-card"><span class="chip">Mission</span>'
            '<blockquote class="mv-q">To design, manufacture and deliver memory and storage solutions that empower individuals, businesses and communities to harness the full potential of digital technology.</blockquote>'
            '<p class="form-note">Engineering excellence combined with ethical business practice — for gamers, professionals, enterprises, communities and partners alike.</p></div>'
            '<div class="card card-pad mv-card"><span class="chip">Vision</span>'
            '<blockquote class="mv-q">To be the most trusted independent brand in memory and storage — recognized worldwide for innovation, reliability, and partnership.</blockquote>'
            '<p class="form-note">The destination the whole company steers toward — tracked as concrete 2030 targets below.</p></div></div>'
            '<div class="v2030-strip rv"><span class="v2030-l">2030 targets</span>'
            '<div class="v-t"><span class="v-cap">Countries served</span><b>93+ &rarr; 120+</b></div>'
            '<div class="v-t"><span class="v-cap">Product categories</span><b>5 &rarr; 7+</b></div>'
            '<div class="v-t"><span class="v-cap">Carbon footprint</span><b>&minus;30%</b></div></div>'
            '<div class="grid g3" style="margin-top:16px">'
            '<div class="b-cell values-cell rv"><span class="vc-badge">' + _ico('bolt') + '</span><b>Innovation</b><p>From SDRAM to DDR5 and Gen 5 NVMe — every platform generation, on time.</p></div>'
            '<div class="b-cell values-cell rv"><span class="vc-badge">' + _ico('shield') + '</span><b>Perfection</b><p>JEDEC-compliant design, 100% pre-delivery IC screening and burn-in validation.</p></div>'
            '<div class="b-cell values-cell rv"><span class="vc-badge">' + _ico('medal') + '</span><b>Quality</b><p>An ISO 9001 system certified since 2002 that every team member owns.</p></div></div></div></section>'
            '<section id="history" style="padding-top:0"><div class="wrap">'
            '<div class="section-head"><div><span class="eyebrow">Our story</span><h2 class="h2">Milestones</h2></div></div>'
            '<div class="timeline">' + tl + '</div></div></section>'
            '<section style="padding-top:0"><div class="wrap">'
            '<div class="reach-band why-band" style="border-radius:18px"><div class="wrap reach-in" style="grid-template-columns:1fr;padding:clamp(28px,4vw,48px) clamp(18px,3.5vw,40px)">'
            '<div class="reach-copy"><span class="eyebrow">Why ' + T.brand(15) + ' — by the numbers</span>'
            '<h2 class="h2" style="font-size:clamp(22px,2.6vw,32px)">We don&rsquo;t just manufacture memory — we engineer confidence</h2>'
            '<div class="reach-stats">'
            '<div><b>27+</b><span>years in operation</span></div>'
            '<div><b>23+</b><span>years at the Dubai hub</span></div>'
            '<div><b>17+</b><span>years — longest distributor</span></div>'
            '<div><b>6</b><span>memory generations</span></div></div>'
            '<p style="color:#B9D2E6;max-width:64ch;margin:0">Through SDRAM, DDR1–DDR5 and now PCIe Gen 5, the constants have been products that work, warranties you can trust and partnerships that last.</p>'
            '</div></div></div></section>'
            '<section id="quality" style="padding-top:0"><div class="wrap">'
            '<div class="section-head"><div><span class="eyebrow">Quality assurance</span><h2 class="h2">Quality is engineered in, not inspected on</h2></div></div>'
            '<div class="about-cols">'
            '<div class="card card-pad qm-card"><h3 class="h3">Live quality metrics <span class="chip ok">all targets met</span></h3>'
            + qm_rows +
            '<p class="form-note" style="margin:8px 0 0">Recent quarterly averages; the &diams; marker shows the target on each scale.</p></div>'
            '<div><h3 class="h3" style="margin-bottom:10px">Five gates, every unit</h3>' + pipe +
            '<div class="audit-chips" style="margin-top:18px"><span class="brand-chip">Monthly — internal audits</span>'
            '<span class="brand-chip">Quarterly — supplier audits</span>'
            '<span class="brand-chip">Annual — TÜV SÜD surveillance</span>'
            '<span class="brand-chip">Every 3 yrs — ISO recertification</span></div></div></div>'
            '<div class="grid g2" style="margin-top:16px"><div class="card card-pad"><h3 class="h3">Certifications</h3><ul>'
            '<li><b>ISO 9001:2000</b> — certified by TÜV SÜD since 2002</li>'
            '<li><b>JEDEC standards</b> — DRAM designed to the industry’s joint standards</li>'
            '<li><b>CE marking</b> — EEA health, safety and environmental requirements</li>'
            '<li><b>FCC certification</b> — electromagnetic compatibility</li>'
            '<li><b>RoHS / REACH</b> — hazardous-substance restrictions &amp; chemical safety</li>'
            '<li><b>EPEAT certification</b> — environmentally responsible design</li></ul></div>'
            '<div class="card card-pad"><h3 class="h3">How we test</h3>'
            '<p>Every product line passes environmental stress testing (temperature extremes, humidity, thermal cycling), signal-integrity and compatibility validation on reference platforms, '
            'and burn-in screening before shipment — governed by the quality management system certified since 2002. Complaints are acknowledged within 24 hours with a 72-hour initial response and CAPA root-cause follow-through.</p>'
            '<p>R&amp;D is anchored at Taipei HQ, with manufacturing in Taiwan (Hsinchu) and China (Dongguan), giving engineering direct control of the production line.</p>'
            '<a class="link-arrow" href="solutions.html">OEM &amp; manufacturing capabilities</a></div></div></div></section>'
            '<section id="esg" style="padding-top:0"><div class="wrap">'
            '<div class="section-head"><div><span class="eyebrow">Sustainability &amp; community</span><h2 class="h2">ESG, in practice</h2></div></div>'
            '<div class="grid g3">'
            '<div class="b-cell esg-cell rv"><span class="vc-badge">' + _ico('leaf') + '</span><b>Environmental</b>'
            '<ul class="esg-list"><li><b>RoHS &amp; REACH</b> compliant across the shipping catalog</li>'
            '<li><b>SVHC tracking</b> through the component supply chain</li>'
            '<li><b>Lifetime DRAM warranties</b> and leaner packaging cut replacement waste</li></ul></div>'
            '<div class="b-cell esg-cell rv"><span class="vc-badge">' + _ico('users') + '</span><b>Social</b>'
            '<ul class="esg-list"><li><b>Ethical labor</b> standards across manufacturing partners</li>'
            '<li><b>Youth digital-literacy</b> programs in emerging markets</li>'
            '<li><b>University partnerships</b> and internships in Dubai and Taipei</li></ul></div>'
            '<div class="b-cell esg-cell rv"><span class="vc-badge">' + _ico('scale') + '</span><b>Governance</b>'
            '<ul class="esg-list"><li><b>ISO 9001</b>-governed operations since 2002</li>'
            '<li><b>Anti-corruption</b> and data-privacy policies</li>'
            '<li><b>Verified-only claims</b> — every published fact is evidence-backed</li></ul></div></div>'
            '<div class="note-box esg-note" style="margin-top:18px"><b>CSR focus:</b> technology education, digital inclusion, employee volunteering and environmental stewardship — '
            'hardware donations, workshops and guest lectures through schools and institutes in the UAE, Egypt and beyond. Annual ESG reporting ships with the production site.</div></div></section>'
            '<section id="global" style="padding-top:0"><div class="wrap">'
            '<div class="section-head"><div><span class="eyebrow">Global presence</span><h2 class="h2">Five offices, one standard</h2></div></div>'
            + T.office_cards() +
            '<div class="note-box" style="margin-top:22px">Manufacturing: Taiwan (Hsinchu) and China (Dongguan). Marketing branches: USA, Germany, Netherlands, '
            'Middle East, South East Asia, Singapore, Hong Kong, Japan, South Korea, Taiwan, China.</div></div></section>'
            '<section id="press" style="padding-top:0"><div class="wrap">'
            '<div class="section-head"><div><span class="eyebrow">Media &amp; investors</span><h2 class="h2">Press room, media kit &amp; facts</h2></div></div>'
            '<div class="grid g3">'
            '<div class="card card-pad press-card"><span class="chip">Newsroom</span><h3 class="h3" style="margin-top:10px;font-size:17px">Press room</h3>'
            '<p class="form-note" style="margin-top:6px">Latest releases (COMPUTEX &amp; GITEX coverage), review-sample requests and interview scheduling — the press office answers within one business day.</p>'
            '<div class="pc-actions"><a class="btn btn-ghost btn-sm" href="mailto:press@twinmos.com">Contact the press office</a>'
            '<span class="pc-mail">press@twinmos.com</span></div></div>'
            '<div class="card card-pad press-card"><span class="chip">Media kit</span><h3 class="h3" style="margin-top:10px;font-size:17px">Assets &amp; brand</h3>'
            '<p class="form-note" style="margin-top:6px">Logo package (full-color, dark-background, mono, reversed — PNG/SVG/EPS), brand guidelines with clear-space rules, product imagery and boilerplate.</p>'
            '<div class="pc-actions"><a class="btn btn-primary btn-sm" href="mailto:press@twinmos.com?subject=Media%20kit%20request">Request the media kit</a></div></div>'
            '<div class="card card-pad press-card"><span class="chip">Investors</span><h3 class="h3" style="margin-top:10px;font-size:17px">Investor relations</h3>'
            '<p class="form-note" style="margin-top:6px">' + T.brand(15) + ' is privately held and not publicly traded. Structure: Taipei parent with Middle East FZE / ME LLC and America Inc. entities; investment inquiries route via the corporate office.</p>'
            '<div class="pc-actions"><a class="btn btn-ghost btn-sm" href="contact.html">Contact investor relations</a></div></div></div>'
            '<div class="note-box" style="margin-top:18px"><b>Awards policy:</b> only verified recognition is published — <i>Best SSD Manufacturer 2023</i> is retained; the UAE Superbrand 2022 listing remains conditional on certificate evidence.</div></div></section>'
            '<section style="padding-top:0"><div class="wrap"><div class="about-cta rv">'
            '<div class="cta-copy"><span class="eyebrow">Work with ' + T.brand(15) + '</span>'
            '<h2 class="h2">Partner with a 27-year memory specialist</h2>'
            '<p>Component supply, OEM manufacturing with five-gate quality, or distribution in your region — the fastest route is a direct conversation with the team that designs and builds the products.</p></div>'
            '<div class="cta-actions"><a class="btn btn-primary" href="shop.html">Explore products</a>'
            '<a class="btn btn-ghost" href="contact.html">Start a conversation</a></div></div></div></section>')
    T.page('about.html', 'About TwinMOS — Since 1998', 'TwinMOS Technologies: founded 1998 in Taipei; ISO 9001 quality system; offices in Taipei, Dubai, Dongguan, Cologne and San Jose; 93+ countries.',
           body, active='company', crumbs=[('index.html', 'Home'), ('about.html', 'About')])

def build_careers():
    # All content flows from the 12-careers corpus via pb_content.import_careers.
    _c = lambda n, d=None: getattr(SC, n, d if d is not None else [])

    # ---- hero + quick-jump nav -------------------------------------------------
    jump = [('openings', 'Open roles'), ('departments', 'Departments'), ('life', 'Life at TwinMOS'),
            ('benefits', 'Benefits'), ('locations', 'Locations'), ('internships', 'Internships'),
            ('apply', 'How to apply'), ('faq', 'FAQ')]
    nav = ' '.join('<a href="#%s">%s</a>' % (a, H.escape(t)) for a, t in jump)
    body = ('<div class="page-hero"><div class="wrap"><span class="eyebrow">Careers</span><h1 class="h1">Build memory with us</h1>'
            '<p class="lede">A quarter-century-old memory specialist with the energy of a product company: engineering-led, '
            'globally distributed, and shipping to 93+ countries. Whether you are an experienced professional, a recent graduate '
            'or a student seeking an internship — if storage technology motivates you, we should talk.</p>'
            '<div class="car-nav" aria-label="Jump to section">' + nav + '</div>'
            '<div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:18px">'
            '<span class="trust-item"><b>93+</b><span>countries served</span></span>'
            '<span class="trust-item"><b>5</b><span>offices · 4 continents</span></span>'
            '<span class="trust-item"><b>Since 1998</b><span>27+ years of memory firsts</span></span></div>'
            '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:20px">'
            '<a class="btn btn-primary" href="#openings">View open roles</a>'
            '<a class="btn btn-ghost" href="#apply">Submit an application</a></div></div></div>')

    # ---- why TwinMOS ------------------------------------------------------------
    why = ''.join('<div class="card card-pad"><b style="color:var(--ink);font-size:15.5px">%s</b>'
                  '<p style="margin-top:6px">%s</p></div>' % (H.escape(t), H.escape(d))
                  for t, d in _c('CAREERS_WHY'))
    body += ('<section id="why" style="padding-top:clamp(22px,3vw,36px)"><div class="wrap">'
             '<div class="section-head"><div><span class="eyebrow">Why ' + T.brand(14) + '</span>'
             '<h2 class="h2">Six reasons to build here</h2></div></div>'
             '<div class="grid g3">' + why + '</div></div></section>')

    # ---- values -------------------------------------------------------------------
    vals = ''.join('<div class="card card-pad val-card"><b class="val-name">%s</b><p>%s</p></div>'
                   % (H.escape(n), H.escape(d)) for n, d in _c('CAREERS_VALUES'))
    body += ('<section id="values" style="padding-top:0"><div class="wrap" style="max-width:1080px">'
             '<div class="section-head"><div><span class="eyebrow">What we value</span>'
             '<h2 class="h2">Four values, one motto — &ldquo;Innovation, Perfection, and Quality&rdquo;</h2></div></div>'
             '<div class="grid g2">' + vals + '</div></div></section>')

    # ---- openings -----------------------------------------------------------------
    rows = ''.join(('<tr><td><b style="color:var(--ink)">%s</b><br><span class="form-note">%s</span></td><td>%s</td>'
                    '<td><a class="btn btn-ghost btn-sm" href="mailto:hr@twinmos.com?subject=%s">Apply / ask</a></td></tr>')
                   % (t, loc, desc, H.escape(t)) for t, loc, desc in SC.CAREERS_ROLES)
    body += ('<section id="openings" style="padding-top:0"><div class="wrap">'
             '<div class="section-head"><div><span class="eyebrow">Openings</span><h2 class="h2">Representative openings</h2></div>'
             '<a class="link-arrow" href="#apply">Submit a general application</a></div>'
             '<p class="form-note" style="margin-bottom:14px">We hire across engineering (hardware, firmware, thermal, PCB, '
             'compatibility), sales and key accounts, marketing, supply-chain operations, quality assurance and customer '
             'service — at every experience level.</p>'
             '<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Role</th><th>Focus</th><th></th></tr></thead><tbody>'
             + rows + '</tbody></table></div>'
             '<div class="note-box" style="margin-top:20px">📋 Representative openings for the prototype — live vacancies and '
             'internship tracks are published via our HR mailbox, <a href="mailto:hr@twinmos.com">hr@twinmos.com</a>. '
             'Unsolicited applications are welcome: select "General Application" on the <a href="#apply">form below</a>.</div></div></section>')

    # ---- departments ---------------------------------------------------------------
    deps = ''.join(
        '<div class="card card-pad dep-card"><span class="chip">%s</span>'
        '<h3 class="h3" style="margin-top:10px;font-size:16.5px">%s</h3>'
        '<ul class="dep-do">%s</ul>'
        '<p class="dep-roles"><b>Roles:</b> %s<br><b>You bring:</b> %s</p></div>'
        % (H.escape(n), H.escape(tag),
           ''.join('<li>%s</li>' % H.escape(w) for w in what),
           H.escape(', '.join(roles)), H.escape(skills))
        for n, tag, what, roles, skills in _c('CAREERS_DEPTS'))
    body += ('<section id="departments" style="padding-top:0"><div class="wrap">'
             '<div class="section-head"><div><span class="eyebrow">Departments</span><h2 class="h2">Find your place in the technology</h2></div></div>'
             '<div class="grid g3">' + deps + '</div>'
             '<div class="note-box" style="margin-top:18px">Career growth often spans departments — many of our leaders have '
             'experience across multiple functions. We encourage internal mobility. Not sure where you fit? '
             '<a href="mailto:hr@twinmos.com">Ask HR for a career consultation</a>.</div></div></section>')

    # ---- life at TwinMOS -------------------------------------------------------------
    pillars = ''.join('<li><b>%s</b><span> — %s</span></li>' % (H.escape(n), H.escape(d))
                      for n, d in _c('CAREERS_LIFE_PILLARS'))
    growth = ''.join('<li><b>%s</b><span> — %s</span></li>' % (H.escape(n), H.escape(d))
                     for n, d in _c('CAREERS_GROWTH'))
    perks = ''.join('<div class="card card-pad perk-card"><b style="color:var(--ink);font-size:15px">%s</b>'
                    '<p style="margin-top:6px">%s</p></div>' % (H.escape(n), H.escape(d))
                    for n, d in _c('CAREERS_GLOBAL_PERKS'))
    testi = ''.join(
        '<div class="card card-pad testi-card"><span class="testi-quote">"</span><p>%s</p>'
        '<div class="testi-who"><b>%s</b><span>%s</span></div></div>'
        % (H.escape(q), H.escape(who), H.escape(meta))
        for q, who, meta in _c('CAREERS_TESTIMONIALS'))
    body += ('<section id="life" style="padding-top:0"><div class="wrap">'
             '<div class="section-head"><div><span class="eyebrow">Life at ' + T.brand(15) + '</span>'
             '<h2 class="h2">More than a job — a career with purpose</h2></div></div>'
             '<div class="grid g2">'
             '<div class="card card-pad"><h3 class="h3" style="font-size:17px">Our culture</h3>'
             '<p class="form-note" style="margin:6px 0 10px">Great products come from great people. Whether you are designing '
             'the next VOLTX DDR5 module, optimizing CoreX Pro Gen 5 firmware or supporting a distributor in an emerging '
             'market, your contribution has tangible global impact.</p>'
             '<ul class="dep-do val-list">' + pillars + '</ul></div>'
             '<div class="card card-pad"><h3 class="h3" style="font-size:17px">Growth &amp; development</h3>'
             '<p class="form-note" style="margin:6px 0 10px">We invest in our people through structured learning, mentorship '
             'and hands-on exposure to new technologies and markets.</p>'
             '<ul class="dep-do val-list">' + growth + '</ul></div></div>'
             '<div class="grid g2" style="margin-top:18px">' + perks + '</div>'
             '<div class="section-head" style="margin-top:clamp(28px,4vw,44px)"><div>'
             '<span class="eyebrow">Voices from the team</span><h2 class="h2" style="font-size:clamp(21px,3vw,28px)">What colleagues say</h2></div></div>'
             '<div class="grid g2">' + testi + '</div>'
             '<p class="form-note" style="margin-top:10px">🔒 Testimonials publish only with signed releases — role '
             'attributions shown per the verified-claims policy.</p>'
             '<div class="note-box" style="margin-top:14px"><b>Diversity &amp; inclusion:</b> equal opportunity hiring across '
             'all roles and levels, inclusive team practices that respect cultural and religious observances, employee '
             'resource groups and cultural celebrations, and zero tolerance for discrimination or harassment. '
             + T.brand(13) + ' is an equal opportunity employer — we celebrate diversity and are committed to creating an '
             'inclusive environment for all employees.</div></div></section>')

    # ---- benefits -------------------------------------------------------------------
    bgroups = ''.join(
        '<div class="card card-pad"><span class="chip">%s</span>'
        '<h3 class="h3" style="margin-top:10px;font-size:16.5px">%s</h3>'
        '<ul class="dep-do">%s</ul></div>'
        % (H.escape(chip), H.escape(t), ''.join('<li>%s</li>' % H.escape(i) for i in items))
        for chip, t, items in _c('CAREERS_BENEFIT_GROUPS'))
    extra = ''.join('<tr><td><b style="color:var(--ink)">%s</b></td><td>%s</td></tr>' % (H.escape(n), H.escape(d))
                    for n, d in _c('CAREERS_BENEFITS_EXTRA'))
    bloc = ''.join('<div class="card card-pad perk-card"><b style="color:var(--ink);font-size:15px">%s</b>'
                   '<p style="margin-top:6px">%s</p></div>' % (H.escape(city), H.escape(d))
                   for city, d in _c('CAREERS_BENEFITS_LOC'))
    body += ('<section id="benefits" style="padding-top:0"><div class="wrap">'
             '<div class="section-head"><div><span class="eyebrow">Benefits</span>'
             '<h2 class="h2">Rewarding excellence, supporting wellbeing</h2></div></div>'
             '<div class="grid g2">' + bgroups + '</div>'
             '<div class="section-head" style="margin-top:clamp(26px,3.5vw,40px)"><div>'
             '<span class="eyebrow">Also included</span><h2 class="h2" style="font-size:clamp(19px,2.6vw,25px)">Extras on top of the core package</h2></div></div>'
             '<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Benefit</th><th>What it includes</th></tr></thead>'
             '<tbody>' + extra + '</tbody></table></div>'
             '<div class="grid g2" style="margin-top:18px">' + bloc + '</div>'
             '<div class="note-box" style="margin-top:16px">Benefit availability and specifics vary by country, role and '
             'employment type to comply with local regulations — details are provided during the offer process. Questions '
             'about benefits in your region: <a href="mailto:hr@twinmos.com">hr@twinmos.com</a>.</div></div></section>')

    # ---- locations --------------------------------------------------------------------
    offs = ''.join(
        '<div class="card card-pad loc-card"><div style="display:flex;align-items:center;gap:10px">'
        '<span class="of-flag" style="font-size:24px">%s</span><div><b style="color:var(--ink);font-size:16px">%s</b>'
        '<div class="form-note">%s</div></div></div>'
        '<p style="margin-top:10px;font-size:13.5px">%s</p>'
        '<p class="dep-roles"><b>Teams you could join:</b> %s</p></div>'
        % (flag, H.escape(city), H.escape(role), H.escape(fn), H.escape(focus))
        for flag, city, role, fn, focus in _c('CAREERS_OFFICES'))
    remote = ' · '.join(H.escape(f) for f in _c('CAREERS_REMOTE_FUNCS'))
    body += ('<section id="locations" style="padding-top:0"><div class="wrap">'
             '<div class="section-head"><div><span class="eyebrow">Locations</span><h2 class="h2">A global network, a local presence</h2></div>'
             '<a class="link-arrow" href="contact.html">Office addresses &amp; contacts</a></div>'
             '<div class="grid g3">' + offs + '</div>'
             '<div class="note-box" style="margin-top:18px"><b>Remote &amp; hybrid:</b> select roles offer flexible, remote '
             'or hybrid arrangements depending on function, seniority and location — discussed during recruitment. '
             'Functions that most often support remote work: ' + remote + '.</div></div></section>')

    # ---- internships & graduate programs ------------------------------------------------
    who = ''.join('<div class="card card-pad perk-card"><b style="color:var(--ink);font-size:15px">%s</b>'
                  '<p style="margin-top:6px">%s</p></div>' % (H.escape(n), H.escape(d))
                  for n, d in _c('CAREERS_INTERNSHIP_WHO'))
    strong_row = ('<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;align-items:center">'
                  '<span class="form-note" style="font-weight:700">Strong candidates:</span>'
                  + ''.join('<span class="chip">%s</span>' % H.escape(x) for x in _c('CAREERS_INTERNSHIP_STRONG'))
                  + '</div>')
    gains = ''.join('<div class="card card-pad perk-card"><b style="color:var(--ink);font-size:15px">%s</b>'
                    '<p style="margin-top:6px">%s</p></div>' % (H.escape(n), H.escape(d))
                    for n, d in _c('CAREERS_INTERNSHIP_GAINS'))
    tracks = ''.join(
        '<div class="card card-pad dep-card"><span class="chip">%s</span>'
        '<ul class="dep-do" style="margin-top:12px">%s</ul></div>'
        % (H.escape(n), ''.join('<li>%s</li>' % H.escape(w) for w in items))
        for n, items in _c('CAREERS_INTERNSHIP_TRACKS'))
    body += ('<section id="internships" style="padding-top:0"><div class="wrap">'
             '<div class="section-head"><div><span class="eyebrow">Early careers</span>'
             '<h2 class="h2">Internships &amp; graduate programs</h2></div></div>'
             '<div class="grid g2">'
             '<div class="card card-pad"><span class="chip">Internship · 8–16 weeks</span>'
             '<h3 class="h3" style="margin-top:10px;font-size:16.5px">Project-based, mentor-guided</h3>'
             '<ul class="dep-do" style="margin-top:10px">'
             '<li><b>Duration</b> — 8–16 weeks, flexible around the academic calendar</li>'
             '<li><b>Locations</b> — Taipei HQ &amp; R&amp;D, Dubai, Cologne and San Jose offices</li>'
             '<li><b>Schedule</b> — full-time preferred; part-time possible for local students</li>'
             '<li><b>Intakes</b> — rolling admissions, primary intakes in January, May and September</li>'
             '<li><b>Stipends</b> — all internships are paid, aligned with local market standards</li></ul></div>'
             '<div class="card card-pad"><span class="chip">Graduate · 12–24 months</span>'
             '<h3 class="h3" style="margin-top:10px;font-size:16.5px">Rotation or deep specialization</h3>'
             '<ul class="dep-do" style="margin-top:10px">'
             '<li><b>Duration</b> — 12–24 months, varying by function and location</li>'
             '<li><b>Structure</b> — rotational assignments across departments, or deep specialization in one area</li>'
             '<li><b>Mentorship</b> — dedicated mentor plus access to senior leadership</li>'
             '<li><b>Outcome</b> — a pathway to full-time employment on successful completion</li></ul></div></div>'
             '<div class="section-head" style="margin-top:clamp(26px,3.5vw,40px)"><div>'
             '<span class="eyebrow">Who we look for</span><h2 class="h2" style="font-size:clamp(19px,2.6vw,25px)">Ambitious, curious, hands-on</h2></div></div>'
             '<div class="grid g2">' + who + '</div>'
             + strong_row +
             '<div class="section-head" style="margin-top:clamp(26px,3.5vw,40px)"><div>'
             '<span class="eyebrow">Tracks</span><h2 class="h2" style="font-size:clamp(19px,2.6vw,25px)">Five internship tracks</h2></div></div>'
             '<div class="grid g3">' + tracks + '</div>'
             '<div class="grid g2" style="margin-top:18px">' + gains + '</div>'
             '<div class="note-box" style="margin-top:18px">Internships are real assignments with real business outcomes — '
             'you get a mentor, join team meetings and present to department leadership at the end of the program. Recent '
             'graduates (within 12 months) are eligible for both programs, and many of our full-time team members started '
             'as interns. <a href="#apply">Apply</a> selecting "Internship" or "Graduate Program" as the position type.</div></div></section>')

    # ---- how to apply + application form ---------------------------------------------------
    role_opts = ''.join('<option>%s</option>' % H.escape(r[0]) for r in SC.CAREERS_ROLES)
    dept_opts = ''.join('<option>%s</option>' % H.escape(d[0]) for d in _c('CAREERS_DEPTS'))
    proc = ''.join('<li><span class="pnum" aria-hidden="true">%d</span>'
                   '<div><b>%s</b><span>%s</span></div></li>'
                   % (i + 1, H.escape(n), H.escape(d))
                   for i, (n, d) in enumerate(_c('CAREERS_PROCESS_STEPS')))
    body += ('<section id="apply" style="padding-top:0"><div class="wrap">'
             '<div class="section-head"><div><span class="eyebrow">Apply</span><h2 class="h2">Take the first step</h2></div></div>'
             '<div class="grid g2 apply-grid">'
             '<div class="card card-pad" data-form-box>'
             '<h3 class="h3" style="font-size:17px">General application</h3>'
             '<p class="form-note" style="margin:6px 0 14px">Fields marked <span class="req">*</span> are required. '
             'Tailor your cover letter to the role — for technical and creative roles, include portfolio, GitHub or work-sample links.</p>'
             '<form data-tm-form novalidate data-success="Application received — HR will review it and respond within 2–3 weeks.">'
             '<div class="form-grid">'
             '<div class="fg" data-req><label>Full name <span class="req">*</span></label><input class="input" type="text" autocomplete="name"><span class="err">Enter your name</span></div>'
             '<div class="fg" data-req><label>Email address <span class="req">*</span></label><input class="input" type="email" autocomplete="email"><span class="err">Enter a valid email</span></div>'
             '<div class="fg"><label>Phone (with country code)</label><input class="input" type="tel" autocomplete="tel" placeholder="+971…, +886…, +91…"></div>'
             '<div class="fg"><label>Country / region</label><input class="input" type="text" autocomplete="country-name"></div>'
             '<div class="fg" data-req><label>Position applied for <span class="req">*</span></label>'
             '<select class="input"><option value="">Select…</option><option>General Application</option>'
             '<option>Internship</option><option>Graduate Program</option>' + role_opts + '</select>'
             '<span class="err">Pick a position type</span></div>'
             '<div class="fg"><label>Preferred department</label>'
             '<select class="input"><option value="">No preference</option>' + dept_opts + '</select></div>'
             '<div class="fg"><label>Preferred location</label><select class="input">'
             '<option value="">No preference</option><option>Taipei, Taiwan</option><option>Dubai, UAE</option>'
             '<option>Dongguan, China</option><option>Cologne, Germany</option><option>San Jose, USA</option>'
             '<option>Remote / hybrid</option></select></div>'
             '<div class="fg"><label>Employment type</label><select class="input">'
             '<option value="">Select…</option><option>Full-time</option><option>Part-time</option>'
             '<option>Contract</option><option>Internship</option></select></div>'
             '<div class="fg"><label>Years of experience</label><select class="input">'
             '<option value="">Select…</option><option>0–2</option><option>3–5</option>'
             '<option>6–10</option><option>10+</option></select></div>'
             '<div class="fg"><label>Notice period</label><select class="input">'
             '<option value="">Select…</option><option>Immediate</option><option>2 weeks</option>'
             '<option>1 month</option><option>3 months+</option></select></div>'
             '<div class="fg" data-req><label>Highest education <span class="req">*</span></label>'
             '<select class="input"><option value="">Select…</option><option>High school</option><option>Bachelor\u2019s</option>'
             '<option>Master\u2019s</option><option>PhD</option><option>Other</option></select>'
             '<span class="err">Pick an education level</span></div>'
             '<div class="fg"><label>LinkedIn / portfolio URL</label><input class="input" type="url" placeholder="https://…"></div>'
             '<div class="fg"><label>How did you hear about us?</label><select class="input">'
             '<option value="">Select…</option><option>LinkedIn</option><option>Website</option><option>Referral</option>'
             '<option>Job board</option><option>Event</option><option>Social media</option><option>Other</option></select></div>'
             '<div class="fg full" data-req data-min="20"><label>Cover letter — why ' + T.brand(14) + ', why this role? <span class="req">*</span></label>'
             '<textarea class="input" rows="4" placeholder="Tell us what drives you, and what you would bring to the team…"></textarea>'
             '<span class="err">A few sentences (20+ characters) help us route your application</span></div>'
             '<div class="fg full" data-req><label>Privacy consent <span class="req">*</span></label>'
             '<select class="input"><option value="">Select…</option>'
             '<option>Yes — I have read the Job Applicant Privacy Notice</option>'
             '<option>I have questions first — contact me</option></select>'
             '<span class="err">Please choose an option</span></div>'
             '</div>'
             '<button class="btn btn-primary btn-lg" type="submit" style="margin-top:16px">Submit application</button>'
             '<p class="form-note" style="margin-top:10px">Prototype: nothing is sent from your browser. The production form '
             'accepts attachments — CV (PDF/Word, 5 MB), cover letter, transcripts, certificates and portfolios up to 10 MB.</p>'
             '</form></div>'
             '<div><div class="card card-pad"><h3 class="h3" style="font-size:17px">What happens next</h3>'
             '<ol class="proc-list">' + proc + '</ol>'
             '<p class="form-note" style="margin-top:12px">Typical total timeline: <b>2–4 weeks</b> from application to offer, '
             'varying by role and location. Shortlisted candidates hear from us within 2–3 weeks.</p></div>'
             '<div class="note-box" style="margin-top:16px">📄 <b>Attach in the production build:</b> CV (required, PDF/Word '
             '≤ 5 MB) · cover letter · academic transcripts (internships &amp; graduate program) · certificates · portfolio '
             'or work samples (technical/creative roles) — links to GitHub or published work are welcome.</div>'
             '<div class="note-box" style="margin-top:12px">Prefer email? Send your CV to '
             '<a href="mailto:hr@twinmos.com">hr@twinmos.com</a> with the job title in the subject line.</div></div>'
             '</div></div></section>')

    # ---- careers FAQ (tabs + accordions, from 09-careers-faq.md) ---------------------------
    short = {'Applying at TwinMOS': 'Applying', 'The Recruitment Process': 'Process',
             'Remote Work and Locations': 'Remote &amp; locations', 'Compensation and Benefits': 'Pay &amp; benefits',
             'Internships and Early Career': 'Internships', 'Data Privacy and Security': 'Data &amp; privacy',
             'Diversity and Inclusion': 'Diversity'}
    faq = _c('CAREERS_FAQ', [])
    if faq:
        ftabs, fpanes = [], []
        for i, (group, items) in enumerate(faq):
            ftabs.append('<button class="tab%s" data-tab="cfaq%d" role="tab">%s</button>'
                         % (' on' if i == 0 else '', i, short.get(group, H.escape(group))))
            acc = ''.join('<details%s><summary>%s</summary><div class="acc-body">%s</div></details>'
                          % (' open' if (i == 0 and j == 0) else '', H.escape(q), H.escape(a))
                          for j, (q, a) in enumerate(items))
            fpanes.append('<div class="tabpane%s" id="cfaq%d"><div class="acc">%s</div></div>'
                          % (' on' if i == 0 else '', i, acc))
        import json as _J
        faq_ld = _J.dumps({'@context': 'https://schema.org', '@type': 'FAQPage',
                           'mainEntity': [{'@type': 'Question', 'name': q,
                                           'acceptedAnswer': {'@type': 'Answer', 'text': a}}
                                          for _g, items in faq for q, a in items]},
                          ensure_ascii=False)
        body += ('<script type="application/ld+json">' + faq_ld + '</script>'
                 '<section id="faq" style="padding-top:0"><div class="wrap" style="max-width:980px">'
                 '<div class="section-head"><div><span class="eyebrow">FAQ</span>'
                 '<h2 class="h2">Everything about joining ' + T.brand(14) + '</h2></div></div>'
                 '<div class="tabs" role="tablist">' + ''.join(ftabs) + '</div>' + ''.join(fpanes) +
                 '<div class="note-box" style="margin-top:18px">Still have questions? '
                 '<a href="mailto:hr@twinmos.com">hr@twinmos.com</a> · +971-4-2996421 · '
                 'TwinMOS Technologies Middle East FZE, C-9, DAFZA, P.O. Box 54278, Dubai, UAE.</div></div></section>')

    # ---- applicant privacy + stay connected ------------------------------------------------
    pts = ''.join('<li>%s</li>' % H.escape(p) for p in _c('CAREERS_PRIVACY_POINTS'))
    body += ('<section id="privacy" style="padding-top:0"><div class="wrap" style="max-width:980px">'
             '<div class="grid g2">'
             '<div class="card card-pad"><span class="chip">Privacy</span>'
             '<h3 class="h3" style="margin-top:10px;font-size:16.5px">Job Applicant Privacy Notice — key points</h3>'
             '<ul class="dep-do" style="margin-top:10px">' + pts + '</ul>'
             '<p class="form-note" style="margin-top:12px">Controller: TwinMOS Technologies Middle East FZE (DAFZA, Dubai), '
             'with affiliated entities in Taiwan, India, Germany and the USA. Data rights requests — subject line '
             '"Data Rights Request" — are answered within 30 days.</p>'
             '<a class="link-arrow" href="legal.html#privacy">Read the full privacy policy</a></div>'
             '<div class="card card-pad"><span class="chip">Stay connected</span>'
             '<h3 class="h3" style="margin-top:10px;font-size:16.5px">Follow ' + T.brand(14) + ' for career updates</h3>'
             '<p style="margin-top:8px">Company news, product launches and behind-the-scenes looks at life at TwinMOS:</p>'
             '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px">'
             '<a class="btn btn-ghost btn-sm" href="https://www.linkedin.com/company/twinmos-technologies/" target="_blank" rel="noopener">LinkedIn</a>'
             '<a class="btn btn-ghost btn-sm" href="https://x.com/twinmos" target="_blank" rel="noopener">X (Twitter)</a>'
             '<a class="btn btn-ghost btn-sm" href="mailto:hr@twinmos.com">hr@twinmos.com</a></div>'
             '<p class="form-note" style="margin-top:14px">We welcome applicants from all backgrounds who share our '
             'commitment to "Innovation, Perfection, and Quality."</p></div></div></div></section>')

    T.page('careers.html', 'Careers at TwinMOS — Open roles, benefits & internships',
           'Join TwinMOS — memory and storage since 1998. Open roles across six departments, internships and graduate '
           'programs, benefits, and five offices: Taipei, Dubai, Dongguan, Cologne and San Jose.',
           body, active='company', crumbs=[('index.html', 'Home'), ('careers.html', 'Careers')])

def build_contact():
    body = ('<div class="page-hero"><div class="wrap"><span class="eyebrow">Contact</span><h1 class="h1" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">Talk to ' + T.brand(32) + '</h1>'
            '<p class="lede">Product questions, support, distribution or press — pick the nearest office or use the form. We reply within one business day.</p></div></div>'
            '<section style="padding-top:clamp(22px,3vw,36px)"><div class="wrap contact-cols">'
            '<div class="card card-pad" data-form-box><h2 class="h3">Send a message</h2>'
            '<form data-tm-form novalidate data-success="Thank you — the TwinMOS team will reply within one business day."><div class="form-grid">'
            '<div class="fg" data-req><label>Full name <span class="req">*</span></label><input class="input" type="text" autocomplete="name"><span class="err">Enter your name</span></div>'
            '<div class="fg" data-req><label>Email <span class="req">*</span></label><input class="input" type="email" autocomplete="email"><span class="err">Enter a valid email</span></div>'
            '<div class="fg"><label>Company</label><input class="input" type="text" autocomplete="organization"></div>'
            '<div class="fg" data-req><label>Topic <span class="req">*</span></label><select class="input"><option value="">Select…</option>'
            '<option>Product question</option><option>Warranty / RMA</option><option>Compatibility help</option>'
            '<option>Distribution / partnership</option><option>OEM / ODM project</option><option>Press &amp; media</option><option>Careers</option></select>'
            '<span class="err">Select a topic</span></div>'
            '<div class="fg full" data-req data-min="10"><label>Message <span class="req">*</span></label>'
            '<textarea class="input" rows="5" placeholder="How can we help?"></textarea><span class="err">Tell us a little more (10+ characters)</span></div></div>'
            '<button class="btn btn-primary" type="submit" style="margin-top:14px">Send message</button></form></div>'
            '<div><div class="card card-pad" style="margin-bottom:16px"><h3 class="h3">Direct lines</h3>'
            '<p style="margin-bottom:6px"><b style="color:var(--ink)">General &amp; sales:</b> sales@twinmos.com<br>'
            '<b style="color:var(--ink)">Phone:</b> +886-970 368 077<br><b style="color:var(--ink)">Hours:</b> Mon–Fri, 9am–5pm (Taipei)</p>'
            '<a class="link-arrow" href="quote.html">Sourcing at volume? Request a quote</a></div>'
            '<div class="card card-pad" style="background:var(--bg-tint);text-align:center"><div style="font-size:40px">🗺️</div>'
            '<b style="color:var(--ink)">HQ — Taipei</b><p class="form-note" style="margin-top:6px">5F.-5, No. 29, Sec. 1, Minsheng E. Rd., Zhongshan Dist., Taipei City 104619, Taiwan</p></div></div>'
            '</div></section>'
            '<section style="padding-top:0"><div class="wrap">'
            '<div class="section-head"><div><span class="eyebrow">Global offices</span><h2 class="h2">Find your region</h2></div></div>'
            + T.office_cards() + '</div></section>')
    T.page('contact.html', 'Contact TwinMOS', 'Contact TwinMOS: offices in Taipei, Dubai, Dongguan, Cologne and San Jose — sales@twinmos.com.',
           body, active='company', crumbs=[('index.html', 'Home'), ('contact.html', 'Contact')])

# ---------------------------------------------------------------- quote / legal / partners / search / 404 / sitemap
def build_quote():
    opts = ''.join('<option>%s</option>' % H.escape(p['name']) for p in _PRODUCTS)
    body = ('<div class="page-hero"><div class="wrap"><span class="eyebrow">Request a quote</span><h1 class="h1">Volume &amp; OEM quotations</h1>'
            '<p class="lede">Tell us what you’re building and the quantities involved. ' + T.brand(16) + ' quotes standard catalog SKUs and custom OEM builds, answered within one business day.</p></div></div>'
            '<section style="padding-top:clamp(22px,3vw,36px)"><div class="wrap" style="max-width:920px">'
            '<div class="card card-pad" data-form-box>'
            '<form data-tm-form novalidate data-success="Quote request received — your regional office will reply within one business day."><div class="form-grid">'
            '<div class="fg" data-req><label>Company / organization <span class="req">*</span></label><input class="input" type="text" autocomplete="organization"><span class="err">Enter your company</span></div>'
            '<div class="fg" data-req><label>Contact name <span class="req">*</span></label><input class="input" type="text" autocomplete="name"><span class="err">Enter a contact name</span></div>'
            '<div class="fg" data-req><label>Business email <span class="req">*</span></label><input class="input" type="email" autocomplete="email"><span class="err">Enter a valid email</span></div>'
            '<div class="fg" data-req><label>Country <span class="req">*</span></label><input class="input" type="text" autocomplete="country-name"><span class="err">Enter your country</span></div>'
            '<div class="fg"><label>Product interest</label><select class="input" id="qProduct"><option value="">Select a product (optional)…</option>' + opts + '</select></div>'
            '<div class="fg" data-req><label>Estimated quantity <span class="req">*</span></label><input class="input" type="number" min="1" placeholder="e.g. 250"><span class="err">Enter an estimated quantity</span></div>'
            '<div class="fg full" data-req data-min="10"><label>Requirement details <span class="req">*</span></label>'
            '<textarea class="input" rows="4" placeholder="Platform, capacities, timeline, target delivery region, custom labeling (OEM)…"></textarea>'
            '<span class="err">A few more details help us quote accurately</span></div></div>'
            '<button class="btn btn-primary btn-lg" type="submit" style="margin-top:16px">Submit quote request</button>'
            '<p class="form-note" style="margin-top:10px">Your regional office (Taipei · Dubai · Cologne · San Jose) replies within one business day. Prototype: nothing is sent from your browser.</p>'
            '</form></div></div></section>')
    T.page('quote.html', 'Request a Quote — TwinMOS', 'Request volume or OEM quotations from TwinMOS — answered within one business day.',
           body, active='home', crumbs=[('index.html', 'Home'), ('quote.html', 'Request a quote')])

def build_legal():
    body = ('<div class="page-hero"><div class="wrap"><span class="eyebrow">Legal</span><h1 class="h1">Policies &amp; legal</h1>'
            '<p class="lede">Warranty policy, terms of use and privacy in one place. The warranty text below is the operative product policy; terms and privacy are presented as production drafts pending final legal review.</p></div></div>'
            '<section style="padding-top:clamp(22px,3vw,36px)"><div class="wrap" style="max-width:900px">'
            '<div class="tabs" role="tablist">'
            '<button class="tab on" data-tab="legal-warranty" role="tab">Warranty Policy</button>'
            '<button class="tab" data-tab="legal-terms" role="tab">Terms of Use</button>'
            '<button class="tab" data-tab="legal-privacy" role="tab">Privacy Policy</button>'
            '<button class="tab" data-tab="legal-cookies" role="tab">Cookie Policy</button>'
            '<button class="tab" data-tab="legal-more" role="tab">More Policies</button>'
            '<button class="tab" data-tab="legal-eol" role="tab">EOL List</button></div>'
            '<div class="tabpane on" id="legal-warranty"><div class="card card-pad article-body">' + SC.WARRANTY_BODY +
            '<a class="btn btn-primary" href="rma.html">Start an RMA →</a></div></div>'
            '<div class="tabpane" id="legal-terms"><div class="card card-pad article-body">'
            '<h2>Terms of use <span class="chip warn">Production draft</span></h2>'
            '<p>This prototype presents the ' + T.brand(15) + ' web experience; the production terms of use will govern site access, orders, marketplace referrals and content licensing, '
            'and will be finalized by TwinMOS counsel before launch. Nothing on this site constitutes a binding offer; purchases occur on the referenced marketplaces under their own terms.</p>'
            '<p>Product names and trademarks are property of their respective owners; PCIe®, NVMe™, USB® and related marks belong to their standards bodies.</p></div></div>'
            '<div class="tabpane" id="legal-privacy"><div class="card card-pad article-body">'
            '<h2>Privacy policy <span class="chip warn">Production draft</span></h2>'
            '<p>The production privacy policy will describe data collected via forms (contact, quote, RMA, newsletter), analytics and cookies, the lawful bases for processing, '
            'retention periods, and your access and erasure rights under GDPR-class regulations. This prototype stores nothing server-side: preferences (compare tray, cookie consent, locale) '
            'live in your browser’s localStorage only.</p></div></div>'
            '<div class="tabpane" id="legal-cookies"><div class="card card-pad article-body">'
            '<h2 id="cookies">Cookie policy &amp; preferences <span class="chip warn">Production draft</span></h2>'
            '<p>Cookies keep this site working and help us understand how it is used. Categories:</p>'
            '<div class="fcheck" style="display:flex;flex-direction:column;gap:10px;margin:14px 0">'
            '<label class="fcheck"><input type="checkbox" checked disabled> <b>Strictly necessary</b> — session, locale and consent state. Always on.</label>'
            '<label class="fcheck"><input type="checkbox" checked> <b>Analytics</b> — aggregate, cookieless usage statistics (Plausible-class in production).</label>'
            '<label class="fcheck"><input type="checkbox"> <b>Marketing</b> — campaign measurement; loaded only after consent.</label></div>'
            '<p class="form-note">In this prototype the toggles are illustrative; the production site stores granular consent and re-prompts after 12 months. '
            'Consent memory on the prototype lives in your browser only.</p>'
            '<button class="btn btn-primary btn-sm" id="cookiePrefsSave">Save preferences</button></div></div>'
            '<div class="tabpane" id="legal-more"><div class="card card-pad article-body">'
            '<h2>Additional policies <span class="chip warn">Production drafts</span></h2>'
            '<p>The full production legal hub carries 34 policy pages. These ship with the production build; the summaries below follow the governing content plan.</p>'
            '<div class="grid g2" style="margin-top:14px;gap:14px">'
            + ''.join('<div class="b-cell" style="min-height:0"><b>%s</b><p style="font-size:13.5px;margin:4px 0 0">%s</p></div>' % (H.escape(t), H.escape(d[:150]))
                      for t, d in PB_C.corpus_cards('14-legal', names=('accessibility', 'security', 'supply-chain', 'modern-slavery', 'conflict-minerals', 'counterfeit', 'trademark', 'acceptable-use', 'recalls')))
            + '</div></div></div>'
            '<div class="tabpane" id="legal-eol"><div class="card card-pad article-body">'
            '<h2 id="eol">End-of-Life product list</h2>'
            '<p>' + T.brand(15) + ' announces product discontinuations on its website three (3) months before a product line ends, and continues support while component materials remain available '
            'and reasonable demand exists. The live EOL list will be maintained here in production.</p>'
            '<p class="form-note">Current catalog (no EOL): all ' + str(_n()) + ' products listed in the <a href="shop.html">catalog</a>.</p></div></div>'
            '</div></section>')
    T.page('legal.html', 'Legal & Warranty Policy — TwinMOS', 'TwinMOS warranty policy (lifetime DRAM, 5-year NVMe/flash, 3-year SATA SSD), terms and privacy.',
           body, active='support', crumbs=[('index.html', 'Home'), ('legal.html', 'Legal')])

def build_partners():
    body = ('<div class="page-hero"><div class="wrap"><span class="eyebrow">Partners</span><h1 class="h1" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">Grow with the ' + T.brand(32) + ' channel</h1>'
            '<p class="lede">Distributors, resellers and system integrators in 93+ countries build on ' + T.brand(16) + ' supply. Regional offices keep logistics local; the partner portal keeps pricing, stock and RMA handling in one place.</p></div></div>'
            '<section style="padding-top:clamp(22px,3vw,36px)"><div class="wrap"><div class="grid g3">'
            '<div class="card card-pad"><span class="chip">Tier 1</span><h3 class="h3" style="margin-top:10px">Distributors</h3>'
            '<p>Regional exclusivity options, container-level pricing, marketing development funds and dedicated account management from the nearest office.</p></div>'
            '<div class="card card-pad"><span class="chip">Tier 2</span><h3 class="h3" style="margin-top:10px">Resellers &amp; retail</h3>'
            '<p>Shop-in-shop assets, launch kits and demo units; marketplace listings supported with verified content.</p></div>'
            '<div class="card card-pad"><span class="chip">Tier 3</span><h3 class="h3" style="margin-top:10px">System integrators</h3>'
            '<p>Project pricing, compatibility pre-validation for your fleet images, and OEM labeling for larger builds.</p></div></div>'
            '<div class="section-head" style="margin-top:clamp(30px,4vw,50px)"><div><span class="eyebrow">Onboarding</span>'
            '<h2 class="h2">From application to first container</h2></div></div>'
            '<div class="steps">'
            '<div class="step"><b>Apply</b><span>Company profile, territories and volumes via the application form — 48-business-hour review.</span></div>'
            '<div class="step"><b>Agreement &amp; tiers</b><span>Terms, credit line and territory definition with the regional manager.</span></div>'
            '<div class="step"><b>Onboard</b><span>Portal access, price lists, marketing assets and product training in week one.</span></div>'
            '<div class="step"><b>Grow</b><span>Quarterly business reviews, MDF-backed campaigns and new-line launches.</span></div></div>'
            '<div class="note-box" style="margin-top:18px">🎓 Partner training resources, the events calendar and regional hubs (MEA / Africa / CIS) open with the production portal; MDF claim tracking lands in Phase 10 of the roadmap.</div>'
            '<div class="section-head" style="margin-top:clamp(30px,4vw,50px)"><div><span class="eyebrow">Partner portal</span>'
            '<h2 class="h2">Inside the portal <span class="chip warn" style="vertical-align:middle">Demo</span></h2></div></div>'
            '<div class="portal-shell"><div class="portal-top"><span>🔐 Partner Portal — demo dashboard (illustrative data)</span></div>'
            '<div class="portal-grid"><div class="portal-cell"><b>142</b><span>SKUs available to channel</span></div>'
            '<div class="portal-cell"><b>98.2%</b><span>Fill rate, last 90 days</span></div>'
            '<div class="portal-cell"><b>4.1 days</b><span>Avg. RMA turnaround</span></div>'
            '<div class="portal-cell"><b>27</b><span>Active campaigns</span></div></div></div>'
            '<div class="grid g2 partner-cols" style="margin-top:clamp(24px,3vw,36px)">'
            '<div class="card card-pad" data-form-box><h3 class="h3">Partner sign-in</h3>'
            '<form data-tm-form novalidate data-success="Demo sign-in accepted — in production this opens your personalized dashboard."><div class="form-grid">'
            '<div class="fg full" data-req><label>Partner email <span class="req">*</span></label><input class="input" type="email" placeholder="you@company.com"><span class="err">Enter a valid email</span></div>'
            '<div class="fg full" data-req><label>Password <span class="req">*</span></label><input class="input" type="password" placeholder="••••••••"><span class="err">Enter your password</span></div></div>'
            '<button class="btn btn-primary" type="submit" style="margin-top:12px">Sign in</button>'
            '<p class="form-note" style="margin-top:10px">Prototype: any credentials validate locally; no account data exists.</p></form></div>'
            '<div class="card card-pad" data-form-box><h3 class="h3">Apply to the program</h3>'
            '<form data-tm-form novalidate data-success="Application received — the channel team will contact you."><div class="form-grid">'
            '<div class="fg" data-req><label>Company <span class="req">*</span></label><input class="input" type="text"><span class="err">Enter your company</span></div>'
            '<div class="fg" data-req><label>Country <span class="req">*</span></label><input class="input" type="text"><span class="err">Enter your country</span></div>'
            '<div class="fg" data-req><label>Business email <span class="req">*</span></label><input class="input" type="email"><span class="err">Enter a valid email</span></div>'
            '<div class="fg" data-req><label>Channel type <span class="req">*</span></label><select class="input"><option value="">Select…</option>'
            '<option>Distributor</option><option>Reseller / retail</option><option>System integrator</option><option>Marketplace seller</option></select>'
            '<span class="err">Select a channel type</span></div></div>'
            '<button class="btn btn-accent" type="submit" style="margin-top:12px">Apply now</button></form></div></div>'
            '</div></section>')
    T.page('partners.html', 'Partner Program — TwinMOS', 'TwinMOS partner program: distributor, reseller and SI tiers with a partner portal.',
           body, active='company', crumbs=[('index.html', 'Home'), ('partners.html', 'Partners')])

def build_search():
    body = ('<div class="page-hero"><div class="wrap"><span class="eyebrow">Search</span><h1 class="h1">Results for "<span id="searchQ"></span>"</h1>'
            '<p class="lede">Searching all ' + str(_n()) + ' catalog products and the media &amp; articles library.</p></div></div>'
            '<section style="padding-top:clamp(22px,3vw,36px)"><div class="wrap" id="searchMount"></div></section>')
    T.page('search.html', 'Search — TwinMOS', 'Search TwinMOS products and articles.', body, active='home',
           crumbs=[('index.html', 'Home'), ('search.html', 'Search')])

def build_404():
    body = ('<section style="min-height:60vh;display:flex;align-items:center"><div class="wrap" style="text-align:center">'
            '<div class="grad-text" style="font-size:clamp(80px,14vw,150px);font-weight:800;line-height:1">404</div>'
            '<h1 class="h2">This page went out of stock</h1>'
            '<p class="lede" style="margin:0 auto 26px">The address you followed doesn’t exist on this prototype. Everything else, though, is very much in stock.</p>'
            '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">'
            '<a class="btn btn-primary" href="index.html">Back to home</a>'
            '<a class="btn btn-ghost" href="shop.html">Browse products</a>'
            '<a class="btn btn-ghost" href="search.html?q=ddr5">Try a search</a></div></div></section>')
    T.page('404.html', 'Page not found — TwinMOS', '404 — page not found.', body)

def build_sitemap():
    rows = ''.join('<li style="padding:6px 0"><a href="%s">%s</a></li>' % (h, t) for h, t in SC.SITEMAP_LINKS)
    body = ('<div class="page-hero"><div class="wrap"><span class="eyebrow">Sitemap</span><h1 class="h1">All pages</h1></div></div>'
            '<section style="padding-top:clamp(22px,3vw,36px)"><div class="wrap">'
            '<ul style="columns:2;gap:40px" class="card card-pad">' + rows + '</ul></div></section>')
    T.page('sitemap.html', 'Sitemap — TwinMOS', 'Prototype sitemap.', body)

def build_technology():
    topics = PB_C.tech_topics(SC)
    cards = ''.join(
        '<a class="card card-pad" href="%s" style="text-decoration:none">'
        '<span class="chip">Engineering</span>'
        '<b style="display:block;color:var(--ink);margin:10px 0 6px;line-height:1.4">%s</b>'
        '<span class="form-note">%s…</span><span class="link-arrow" style="display:inline-block;margin-top:10px">%s</span></a>'
        % (t[2] and ('article.html?id=' + t[2]) or 'news.html',
           H.escape(t[0]), H.escape(t[1][:110]),
           t[2] and 'Read the explainer →' or 'Browse articles →')
        for t in topics)
    body = ('<div class="page-hero"><div class="wrap"><span class="eyebrow">Technology &amp; R&amp;D</span><h1 class="h1">27+ years of memory engineering</h1>'
            '<p class="lede">Every ' + T.brand(16) + ' module starts in the Taipei R&amp;D lab — from DRAM silicon choices and NAND controller tuning to graphene thermal design and JEDEC compliance. '
            'This hub collects the engineering stories behind the products, written by the team that builds them.</p></div></div>'
            '<section style="padding-top:clamp(22px,3vw,36px)"><div class="wrap">'
            '<div class="section-head"><div><span class="eyebrow">Deep dives</span><h2 class="h2">How the hardware works</h2></div>'
            '<a class="link-arrow" href="news.html">All articles</a></div>'
            '<div class="grid g3">' + (cards or '<p class="form-note">Technology library coming soon.</p>') + '</div></div></section>'
            '<section style="padding-top:0"><div class="wrap"><div class="grid g3">'
            '<div class="b-cell"><span class="big">1998</span><p>Continuous memory engineering since the first TwinMOS modules.</p></div>'
            '<div class="b-cell"><span class="big">JEDEC</span><p>Stand-body compliant DRAM and platform validation across every generation.</p></div>'
            '<div class="b-cell"><span class="big">Gen 5</span><p>14,000 MB/s CoreX Pro engineering — thermal, signal and firmware tuned together.</p></div>'
            '</div></div></section>'
            '<section style="padding-top:0"><div class="wrap">'
            '<div class="cta-band">'
            '<img class="cta-watermark" src="' + T.logo_src() + '" alt="" aria-hidden="true">'
            '<div class="cta-copy"><h2 class="h2" style="color:#fff;margin-bottom:6px">Engineering questions?</h2>'
            '<p style="margin:0;max-width:56ch">Whitepapers and full application notes ship with the production technology hub. For OEM and platform-specific engineering, talk to the team directly.</p></div>'
            '<a class="btn btn-lg" style="background:#fff;color:#0A2540" href="contact.html">Contact engineering</a></div></div></section>')
    T.page('technology.html', 'Technology & R&D — TwinMOS', 'TwinMOS technology hub: DRAM, NAND, controllers, thermal design and PCIe Gen 5 engineering.',
           body, active='company', crumbs=[('index.html', 'Home'), ('technology.html', 'Technology & R&D')])

# ---------------------------------------------------------------- learn hub (corpus 08-learn)
_LEARN_CATS = [('guide', 'Guide', 'Buying guide'), ('explainer', 'Explainer', 'Explainer'),
               ('benchmark', 'Benchmark', 'Benchmark'), ('blog', 'Blog', 'Blog')]

# ---------------------------------------------------------------- knowledge hub (corpus 08-learn)
def _learn_counts():
    by = {c: sum(1 for a in SC.ARTICLES if a['cat'] == c and a['id'] != 'glossary')
          for _k, c, _l in _LEARN_CATS}
    by['terms'] = len(getattr(SC, 'GLOSSARY', []))
    return by

def _lcard(a, blurb=''):
    """Hub card: title + blurb (corpus best-for / explainer line) + meta with reading time."""
    note = blurb or (a['desc'][:130] + ('…' if len(a['desc']) > 130 else ''))
    meta = ' · '.join([x for x in (a['date'], '%d min read' % a.get('mins', 3)) if x])
    return ('<a class="card card-pad learn-card" href="article.html?id=%s">'
            '<b>%s</b><span class="form-note">%s</span>'
            '<span class="learn-meta">%s</span></a>'
            % (a['id'], H.escape(a['title']), H.escape(note), meta))

def _learn_hub_nav(current):
    """Sibling-hub cross navigation band shared by every sub-hub page."""
    links = [('learn-guides.html', 'Buying guides'), ('learn-explained.html', 'Technology explainers'),
             ('learn-benchmarks.html', 'Benchmarks'), ('learn-glossary.html', 'Glossary A–Z'),
             ('learn-blog.html', 'Tech insights'), ('learn.html', 'Knowledge hub home')]
    cells = ''.join('<a%s href="%s">%s</a>' % (' class="on"' if h == current else '', h, l)
                    for h, l in links if h != current)
    return ('<section style="padding-top:clamp(26px,3vw,40px)"><div class="wrap">'
            '<div class="learn-band" role="navigation" aria-label="Knowledge hub sections">'
            '<b style="flex:none">Keep exploring</b>' + cells + '</div></div></section>')

def _learn_cta(title, text, cta1, cta2):
    return ('<section style="padding-top:clamp(26px,3vw,40px);padding-bottom:clamp(34px,4vw,56px)"><div class="wrap">'
            '<div class="cta-band">'
            '<img class="cta-watermark" src="' + T.logo_src() + '" alt="" aria-hidden="true">'
            '<div class="cta-copy"><h2 class="h2" style="color:#fff;margin-bottom:6px">%s</h2>'
            '<p style="margin:0;max-width:56ch">%s</p></div>%s%s</div></div></section>'
            % (title, text, cta1, cta2))

def build_learn():
    """Knowledge hub home: destinations, learning paths, essentials (corpus 08-learn)."""
    by_id = {a['id']: a for a in SC.ARTICLES}
    cnt = _learn_counts()
    n_total = cnt['Guide'] + cnt['Explainer'] + cnt['Benchmark'] + cnt['Blog']

    tiles = [
        ('learn-guides.html', 'Buying guides', cnt['Guide'],
         'Choose the right RAM or SSD for any build, budget or fleet.',
         ['How to choose RAM', 'DDR4 vs DDR5', 'Best RAM for gaming']),
        ('learn-explained.html', 'Technology explainers', cnt['Explainer'],
         'The technology behind the spec sheet — DDR5, NVMe, NAND, ECC.',
         ['What is DDR5?', 'What is NVMe?', 'CAS latency']),
        ('learn-benchmarks.html', 'Benchmarks', cnt['Benchmark'],
         'Real-world test data with the full methodology published.',
         ['CoreX Pro vs competitors', 'Real-world gaming']),
        ('learn-glossary.html', 'Glossary A–Z', cnt['terms'],
         'Quick definitions for every term from AHCI to XMP.',
         ['113 terms', 'Linked to explainers']),
        ('learn-blog.html', 'Tech insights &amp; blog', cnt['Blog'],
         'Product launches, event coverage and engineering commentary.',
         ['COMPUTEX 2025 recap', 'Launch deep-dives']),
        ('gaming.html#stories', 'Stories &amp; builds', 'Community',
         'Rigs, studios and fleets powered by TwinMOS hardware.',
         ['VOLTX builds', 'From the desk']),
    ]
    tiles_html = ''.join(
        '<a class="card card-pad lsec-tile" href="%s"><div class="lsec-top"><b>%s</b>'
        '<span class="chip">%s</span></div><span class="form-note">%s</span>'
        '<span class="lsec-links">%s</span><span class="link-arrow">Explore %s →</span></a>'
        % (h, t, n, d, ''.join('<i>%s</i>' % e for e in ex), t.replace(' &amp;', ''))
        for h, t, n, d, ex in tiles)

    paths = [
        ('Build your first PC', 'New builder', [
            ('how-to-choose-ram', 'Pick your memory'),
            ('how-to-choose-an-ssd', 'Pick your storage'),
            ('budget-pc-build-guide', 'Put it together'),
            ('best-ram-for-gaming', 'Level up the RAM')],
         'learn-guides.html', 'All buying guides'),
        ('Upgrade a laptop', 'Notebook owner', [
            ('so-dimm-vs-udimm', 'Know your module type'),
            ('best-ssd-for-laptops', 'Choose the drive'),
            ('what-is-hmb', 'Understand DRAM-less designs')],
         'learn-guides.html', 'All buying guides'),
        ('Creator workstation', 'Video · 3D · design', [
            ('best-ram-for-content-creators', 'Memory for big timelines'),
            ('pcie-gen3-vs-gen4-vs-gen5', 'Pick your interface tier'),
            ('benchmark-content-creation', 'See the real numbers')],
         'learn-benchmarks.html', 'All benchmarks'),
        ('Enterprise &amp; fleet', 'IT · procurement', [
            ('enterprise-fleet-upgrade-guide', 'Plan the rollout'),
            ('what-is-mtbf', 'Read the reliability math'),
            ('power-loss-protection', 'Protect the data')],
         'learn-guides.html', 'Business &amp; fleet guides'),
    ]
    paths_html = ''
    for name, who, steps, foot_href, foot_label in paths:
        rows = ''.join('<a class="lpath-step" href="article.html?id=%s"><i>%d</i><span><em>%s</em>%s</span></a>'
                       % (sid, i + 1, H.escape(by_id[sid]['title']) if sid in by_id else sid, lbl)
                       for i, (sid, lbl) in enumerate(steps))
        paths_html += ('<div class="card card-pad lpath"><div class="lpath-h"><b>%s</b><span class="chip">%s</span></div>'
                       '%s<a class="link-arrow lpath-more" href="%s">%s →</a></div>'
                       % (name, who, rows, foot_href, foot_label))

    feat = by_id.get('how-to-choose-ram')
    feat_html = ''
    if feat:
        feat_html = ('<a class="card learn-feat" href="article.html?id=how-to-choose-ram">'
                     '<span class="chip ok">Start here</span>'
                     '<b>%s</b><span class="form-note">%s…</span>'
                     '<span class="learn-meta">Complete buyer\'s guide · %s · %d min read</span></a>'
                     % (H.escape(feat['title']), H.escape(feat['desc'][:180]), feat['date'], feat.get('mins', 6)))

    picks = [by_id[i] for i in ('ddr4-vs-ddr5', 'what-is-ddr5', 'nvme-vs-sata-ssd', 'pcie-gen3-vs-gen4-vs-gen5') if i in by_id]
    picks_html = ''.join('<a class="learn-pick" href="article.html?id=%s"><b>%s</b><span>%s →</span></a>'
                         % (p['id'], H.escape(p['title']), p['cat']) for p in picks)

    stats = ('<div class="cb-cell"><b>%d</b><span>Buying guides</span></div>'
             '<div class="cb-cell"><b>%d</b><span>Technology explainers</span></div>'
             '<div class="cb-cell"><b>%d</b><span>Benchmarks</span></div>'
             '<div class="cb-cell"><b>%d</b><span>Blog posts</span></div>'
             '<div class="cb-cell"><b>%d</b><span>Glossary terms</span></div>'
             % (cnt['Guide'], cnt['Explainer'], cnt['Benchmark'], cnt['Blog'], cnt['terms']))

    body = ('<div class="page-hero"><div class="wrap"><span class="eyebrow">Knowledge hub</span>'
            '<h1 class="h1">Learn memory &amp; storage</h1>'
            '<p class="lede">Buying guides, technology explainers, benchmarks and an A–Z glossary from the '
            + T.brand(15) + ' engineering team — from &ldquo;DDR4 or DDR5?&rdquo; to what on-die ECC actually does. '
            'Everything written by the people who build the hardware.</p>'
            '<form class="lsearch" action="search.html" method="get" role="search">'
            '<input type="search" name="q" placeholder="Search guides, explainers, terms — try "DDR5" or "NVMe"…" aria-label="Search the knowledge hub">'
            '<button class="btn btn-primary" type="submit">Search</button></form></div></div>'

            '<section style="padding-top:clamp(22px,3vw,36px)"><div class="wrap">'
            '<div class="cb-stats learn-stats learn-stats5">' + stats + '</div></div></section>'

            '<section style="padding-top:clamp(26px,3vw,40px)"><div class="wrap">'
            '<div class="section-head"><div><span class="eyebrow">Browse by section</span>'
            '<h2 class="h2">Where do you want to go?</h2></div></div>'
            '<div class="grid g3 lsec-grid">' + tiles_html + '</div></div></section>'

            '<section style="padding-top:clamp(26px,3vw,40px)"><div class="wrap">'
            '<div class="section-head"><div><span class="eyebrow">Guided paths</span>'
            '<h2 class="h2">Learning paths, step by step</h2></div>'
            '<span class="form-note">Curated sequences — start at step 1, come back any time.</span></div>'
            '<div class="grid g4 lpath-grid">' + paths_html + '</div></div></section>'

            '<section style="padding-top:clamp(26px,3vw,40px)"><div class="wrap">'
            '<div class="section-head"><div><span class="eyebrow">Start here</span>'
            '<h2 class="h2">The essentials</h2></div></div>'
            '<div class="learn-essentials">'
            + feat_html +
            '<div class="learn-side">'
            '<a class="card card-pad learn-gloss" href="learn-glossary.html"><span class="chip">Glossary</span>'
            '<b>A–Z of memory &amp; storage</b><span class="form-note">%d quick definitions across the whole stack — each linked to the full explainer where one exists.</span>'
            '<span class="link-arrow" style="margin-top:10px;display:inline-block">Open the glossary</span></a>'
            + picks_html +
            '</div></div></div></section>'

            '<section style="padding-top:0;padding-bottom:clamp(34px,4vw,56px)"><div class="wrap">'
            '<div class="cta-band">'
            '<img class="cta-watermark" src="' + T.logo_src() + '" alt="" aria-hidden="true">'
            '<div class="cta-copy"><h2 class="h2" style="color:#fff;margin-bottom:6px">Still choosing?</h2>'
            '<p style="margin:0;max-width:56ch">Put the guides to work — check compatibility with your exact machine, then find the nearest authorized channel.</p></div>'
            '<a class="btn btn-lg" style="background:#fff;color:#0A2540" href="compatibility.html">Compatibility finder</a>'
            '<a class="btn btn-lg btn-ghost" style="color:#fff;border-color:rgba(255,255,255,.35)" href="where-to-buy.html">Where to buy</a></div></div></section>')
    T.page('learn.html', 'Knowledge Hub — Learn Memory & Storage — TwinMOS',
           'TwinMOS Knowledge Hub: %d buying guides, DDR5/NVMe technology explainers, benchmarks, an A–Z glossary and learning paths — written by the memory engineering team.' % n_total,
           body, active='support', crumbs=[('index.html', 'Home'), ('support.html', 'Support'), ('learn.html', 'Knowledge hub')])

def _learn_sub_head(fname, label, title, lede, chips):
    return ('<div class="page-hero"><div class="wrap"><span class="eyebrow">Knowledge hub · %s</span>'
            '<h1 class="h1">%s</h1><p class="lede">%s</p>'
            '<div class="loc-chips" style="margin-top:14px">%s</div></div></div>'
            % (label, title, lede, ''.join('<span class="chip">%s</span>' % c for c in chips)))

def build_learn_guides():
    """Buying-guides sub-hub: corpus-authored groups with best-for lines."""
    hub = getattr(SC, 'LEARN_HUBS', {}).get('guides', {})
    secs = ''
    for glabel, sub, rows in hub.get('groups', []):
        by_id = {a['id']: a for a in SC.ARTICLES}
        cards = ''.join(_lcard(by_id[s], bf) for _t, s, bf in rows if s in by_id)
        secs += ('<section style="padding-top:clamp(26px,3vw,40px)"><div class="wrap">'
                 '<div class="section-head"><div><span class="eyebrow">%s</span><h2 class="h2">%s</h2></div>'
                 '<span class="form-note">%d guides</span></div>'
                 '<div class="grid g3">%s</div></div></section>'
                 % (H.escape(sub or 'Best for'), H.escape(glabel), len(rows), cards))
    body = (_learn_sub_head('learn-guides.html', 'Buying guides', 'Memory &amp; storage buying guides',
                            hub.get('lede', ''), ['%d guides' % sum(len(r[2]) for r in hub.get('groups', [])),
                                                  'Use-case first', 'Written by engineers'])
            + secs
            + _learn_hub_nav('learn-guides.html')
            + _learn_cta('Narrow it down in seconds',
                         'Every guide assumes nothing — but the compatibility finder is faster when you already know your machine.',
                         '<a class="btn btn-lg" style="background:#fff;color:#0A2540" href="compatibility.html">Compatibility finder</a>',
                         '<a class="btn btn-lg btn-ghost" style="color:#fff;border-color:rgba(255,255,255,.35)" href="where-to-buy.html">Where to buy</a>'))
    T.page('learn-guides.html', 'Buying Guides — Memory & Storage — TwinMOS',
           'TwinMOS buying guides: how to choose RAM and SSDs for gaming, laptops, creator workstations, PC builds and enterprise fleets — with best-for guidance for every use case.',
           body, active='support',
           crumbs=[('index.html', 'Home'), ('learn.html', 'Knowledge hub'), ('learn-guides.html', 'Buying guides')])

def build_learn_explained():
    """Explainers sub-hub: majors (DRAM / SSD / specialized) with corpus sub-groups."""
    hub = getattr(SC, 'LEARN_HUBS', {}).get('explained', {})
    by_id = {a['id']: a for a in SC.ARTICLES}
    n = sum(len(i) for _m, gr in hub.get('majors', []) for _g, i in gr)
    secs = ''
    for maj, grps in hub.get('majors', []):
        inner = ''
        for glabel, items in grps:
            cards = ''.join(_lcard(by_id[s], b) for _t, s, b in items if s in by_id)
            inner += ('<div class="lgrp"><div class="lgrp-h"><b>%s</b><span class="chip">%d</span></div>'
                      '<div class="grid g3">%s</div></div>' % (H.escape(glabel), len(items), cards))
        secs += ('<section style="padding-top:clamp(26px,3vw,40px)"><div class="wrap">'
                 '<div class="section-head"><div><span class="eyebrow">Topic</span><h2 class="h2">%s</h2></div></div>'
                 '%s</div></section>' % (H.escape(maj), inner))
    body = (_learn_sub_head('learn-explained.html', 'Explainers', 'Technology explainers',
                            hub.get('lede', ''), ['%d explainers' % n, 'Fundamentals first', 'Jargon-free'])
            + secs
            + _learn_hub_nav('learn-explained.html')
            + _learn_cta('Prefer specs to stories?',
                         'See how the engineering behind these technologies is validated — standards, testing platforms and R&amp;D.',
                         '<a class="btn btn-lg" style="background:#fff;color:#0A2540" href="technology.html">Technology &amp; R&amp;D</a>',
                         '<a class="btn btn-lg btn-ghost" style="color:#fff;border-color:rgba(255,255,255,.35)" href="learn-glossary.html">Open the glossary</a>'))
    T.page('learn-explained.html', 'Technology Explainers — Memory & Storage — TwinMOS',
           'TwinMOS technology explainers: DDR5 architecture, NVMe, PCIe generations, NAND flash, ECC, wear leveling and more — the memory and storage concepts behind the spec sheet, demystified.',
           body, active='support',
           crumbs=[('index.html', 'Home'), ('learn.html', 'Knowledge hub'), ('learn-explained.html', 'Technology explainers')])

def build_learn_benchmarks():
    """Benchmarks sub-hub: methodology philosophy, grouped results, test rig, caveats."""
    hub = getattr(SC, 'LEARN_HUBS', {}).get('benchmarks', {})
    by_id = {a['id']: a for a in SC.ARTICLES}
    phil = ''.join('<div class="card card-pad"><b>%s</b><span class="form-note">%s</span></div>' % (H.escape(h), H.escape(p))
                   for h, p in hub.get('philosophy', []))
    secs = ''
    n = 0
    for glabel, items in hub.get('groups', []):
        cards = ''.join(_lcard(by_id[s], b) for _t, s, b in items if s in by_id)
        n += len(items)
        secs += ('<div class="lgrp"><div class="lgrp-h"><b>%s</b><span class="chip">%d</span></div>'
                 '<div class="grid g3">%s</div></div>' % (H.escape(glabel), len(items), cards))
    rig = ''.join('<div class="lrig-kv"><span>%s</span><b>%s</b></div>' % (H.escape(k), H.escape(v)) for k, v in hub.get('rig', []))
    caveats = ''.join('<li>%s</li>' % H.escape(c) for c in hub.get('caveats', []))
    body = (_learn_sub_head('learn-benchmarks.html', 'Benchmarks', 'Performance benchmarks',
                            hub.get('lede', ''), ['%d published runs' % n, 'Methodology included', 'Reproducible'])
            + '<section style="padding-top:clamp(22px,3vw,36px)"><div class="wrap">'
              '<div class="section-head"><div><span class="eyebrow">Methodology</span><h2 class="h2">How we test</h2></div></div>'
              '<div class="grid g3">' + phil + '</div></div></section>'
            + '<section style="padding-top:clamp(26px,3vw,40px)"><div class="wrap">'
              '<div class="section-head"><div><span class="eyebrow">Results</span><h2 class="h2">Benchmark library</h2></div></div>'
              + secs + '</div></section>'
            + '<section style="padding-top:clamp(26px,3vw,40px)"><div class="wrap"><div class="grid g2">'
              '<div class="card card-pad"><span class="eyebrow">Test platform</span><div class="lrig">' + rig + '</div></div>'
              '<div class="card card-pad"><span class="eyebrow">Read the numbers right</span>'
              '<ul class="lcav">' + caveats + '</ul>'
              '<span class="form-note">Use benchmarks as directional guidance, not absolute guarantees. '
              'Community reproductions welcome — share your results with us.</span></div>'
              '</div></div></section>'
            + _learn_hub_nav('learn-benchmarks.html')
            + _learn_cta('Compare the products themselves',
                         'Numbers convinced you? Line up candidates side by side, or jump straight to the catalog.',
                         '<a class="btn btn-lg" style="background:#fff;color:#0A2540" href="compare.html">Open the compare tray</a>',
                         '<a class="btn btn-lg btn-ghost" style="color:#fff;border-color:rgba(255,255,255,.35)" href="shop.html">Browse products</a>'))
    T.page('learn-benchmarks.html', 'Benchmarks — Real-World Performance — TwinMOS',
           'TwinMOS benchmark library: CoreX Pro Gen5 and VOLTX DDR5 tested against competitors in gaming, content-creation and productivity workloads — with published methodology and test configurations.',
           body, active='support',
           crumbs=[('index.html', 'Home'), ('learn.html', 'Knowledge hub'), ('learn-benchmarks.html', 'Benchmarks')])

def build_learn_glossary():
    """Glossary sub-hub: A–Z letter index + live filter + term cards linked to explainers."""
    terms = getattr(SC, 'GLOSSARY', [])
    by_letter = {}
    for t in terms:
        by_letter.setdefault(t['l'], []).append(t)
    letters = sorted(by_letter)
    idx = ''.join('<a class="lidx-a" href="#gL%s" data-letter="%s">%s</a>' % (l, l, l) for l in letters)
    secs = ''
    for l in letters:
        defs = ''.join(
            '<div class="lterm" data-search="%s"><dt><b>%s</b>%s</dt><dd>%s</dd></div>'
            % (H.escape((t['t'] + ' ' + t['d']).lower()), H.escape(t['t']),
               ('<a class="lterm-ref" href="article.html?id=%s">Read the explainer →</a>' % t['ref']) if t['ref'] else '',
               H.escape(t['d']))
            for t in by_letter[l])
        secs += ('<section class="lsec-letter" id="gL%s" data-letter="%s"><div class="wrap">'
                 '<div class="lgrp-h"><b>%s</b><span class="chip">%d terms</span></div>'
                 '<dl class="lterms">%s</dl></div></section>' % (l, l, l, len(by_letter[l]), defs))
    empty = '<div class="empty-state lterm-empty" hidden><h3>No matching terms</h3><p>Try a shorter query — or ask us to add the term.</p></div>'
    body = (_learn_sub_head('learn-glossary.html', 'Glossary', 'Technology glossary, A–Z',
                            'Every term you will meet on a memory or storage spec sheet — %d definitions, each linked to the full explainer where one exists.' % len(terms),
                            ['%d terms' % len(terms), 'A–Z jump', 'Linked to explainers'])
            + '<section style="padding-top:clamp(22px,3vw,36px)"><div class="wrap">'
              '<div class="lidx-bar"><nav class="lidx" aria-label="Glossary letters">' + idx + '</nav>'
              '<div class="lsearch lsearch-sm"><input type="search" id="glossQ" placeholder="Filter terms — try "latency"…" aria-label="Filter glossary terms">'
              '<span class="chip" id="glossCount">%d</span></div></div></div></section>'
            + secs + empty
            + _learn_hub_nav('learn-glossary.html')
            + _learn_cta('A term piqued your interest?',
                         'Explainers take every glossary entry to full depth — and the buying guides turn the theory into a purchase.',
                         '<a class="btn btn-lg" style="background:#fff;color:#0A2540" href="learn-explained.html">Read the explainers</a>',
                         '<a class="btn btn-lg btn-ghost" style="color:#fff;border-color:rgba(255,255,255,.35)" href="learn-guides.html">Buying guides</a>'))
    T.page('learn-glossary.html', 'Glossary A–Z — Memory & Storage Terms — TwinMOS',
           'A–Z TwinMOS glossary of memory and storage terminology: DDR, DIMM, NVMe, NAND, TBW, MTBF, XMP and %d more terms with plain-language definitions.' % max(0, len(terms) - 8),
           body, active='support',
           crumbs=[('index.html', 'Home'), ('learn.html', 'Knowledge hub'), ('learn-glossary.html', 'Glossary A–Z')])

def build_learn_blog():
    """Blog sub-hub: launch/event posts, coming-soon topics, categories, subscribe."""
    hub = getattr(SC, 'LEARN_HUBS', {}).get('blog', {})
    posts = [a for a in SC.ARTICLES if a['cat'] == 'Blog']
    cards = ''.join(_lcard(a) for a in posts)
    coming = ''.join('<li><span class="chip">Coming soon</span> %s</li>' % H.escape(c) for c in hub.get('coming', []))
    cats = ''.join('<div class="card card-pad lcat"><b>%s</b><span class="form-note">%s</span></div>'
                   % (H.escape(c), H.escape(d)) for c, d in hub.get('cats', []))
    body = (_learn_sub_head('learn-blog.html', 'Blog', 'Tech insights &amp; blog',
                            hub.get('lede', ''), ['%d posts' % len(posts), 'Weekly cadence', 'From the team'])
            + '<section style="padding-top:clamp(22px,3vw,36px)"><div class="wrap">'
              '<div class="section-head"><div><span class="eyebrow">Latest</span><h2 class="h2">Recent posts</h2></div>'
              '<a class="link-arrow" href="news.html">Product news &amp; events</a></div>'
              '<div class="grid g3">' + cards + '</div></div></section>'
            + '<section style="padding-top:clamp(26px,3vw,40px)"><div class="wrap"><div class="grid g2">'
              '<div class="card card-pad"><span class="eyebrow">In the pipeline</span><ul class="lcoming">' + coming + '</ul>'
              '<span class="form-note">The blog is updated weekly — follow along or pitch a topic.</span></div>'
              '<div class="card card-pad"><span class="eyebrow">Coverage</span><div class="grid g2 lcat-grid">' + cats + '</div></div>'
              '</div></div></section>'
            + _learn_hub_nav('learn-blog.html')
            + _learn_cta('Never miss a launch',
                         'Join the newsletter for monthly digests, or get volume pricing when the next big thing ships.',
                         '<a class="btn btn-lg" style="background:#fff;color:#0A2540" href="news.html">Newsroom</a>',
                         '<a class="btn btn-lg btn-ghost" style="color:#fff;border-color:rgba(255,255,255,.35)" href="quote.html">Get a quote</a>'))
    T.page('learn-blog.html', 'Tech Insights & Blog — TwinMOS',
           'TwinMOS tech insights: product launch deep-dives, COMPUTEX event coverage and engineering commentary on memory and storage trends.',
           body, active='support',
           crumbs=[('index.html', 'Home'), ('learn.html', 'Knowledge hub'), ('learn-blog.html', 'Tech insights &amp; blog')])

def build_all(products):
    set_products(products)
    build_home(); build_shop(); build_product(); build_compatibility(); build_compare()
    build_buy(); build_gaming(); build_solutions(); build_support(); build_rma(); build_learn()
    build_learn_guides(); build_learn_explained(); build_learn_benchmarks()
    build_learn_glossary(); build_learn_blog()
    build_news(); build_article(); build_technology(); build_about(); build_careers(); build_contact()
    build_quote(); build_legal(); build_partners(); build_search(); build_404(); build_sitemap()
