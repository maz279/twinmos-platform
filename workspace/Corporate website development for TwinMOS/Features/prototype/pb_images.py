# -*- coding: utf-8 -*-
"""Prototype builder — module 1: paths, safe joins, image pipeline, icons."""
import os, re, shutil

ROOT   = os.path.dirname(os.path.abspath(__file__))
F_DIR  = os.path.dirname(ROOT)
C_DIR  = os.path.dirname(F_DIR)
WS     = os.path.dirname(C_DIR)
PROD   = os.path.join(WS, 'twinmos_corporate-production', 'public')
FED    = os.path.join(C_DIR, 'Features', 'front_end_design', 'assets', 'img')
OUT    = ROOT
A_CSS  = os.path.join(OUT, 'assets', 'css')
A_JS   = os.path.join(OUT, 'assets', 'js')
A_IMG  = os.path.join(OUT, 'assets', 'img')
A_PROD = os.path.join(A_IMG, 'products')
A_CARD = os.path.join(A_IMG, 'card')
PRODUCTS_JSON = os.path.join(PROD, 'products.json')
LOGO_SRC      = os.path.join(PROD, 'twinmos-logo.png')

CURATED_ASSETS = ('logo.webp', 'hero-voltx-pc.webp', 'voltx-rgb-bg.webp', 'corex-pro.webp',
                  'cat-dram.webp', 'cat-nvme.webp', 'cat-sata.webp', 'cat-portable.webp',
                  'cat-usb.webp', 'cat-microsd.webp', 'cat-psu.webp', 'ezeehub.webp')

LOGO      = 'assets/img/logo.webp'
HERO_HOME = 'assets/img/hero-voltx-pc.webp'
HERO_GAME = 'assets/img/voltx-rgb-bg.webp'
G5_IMG    = 'assets/img/card/corex-pro.webp'  # trimmed variant: no cover-crop of the square canvas
YEAR      = '2026'

PAGES = ('index.html', 'shop.html', 'product.html', 'compatibility.html', 'compare.html',
         'where-to-buy.html', 'gaming.html', 'solutions.html', 'support.html', 'rma.html', 'learn.html',
         'learn-guides.html', 'learn-explained.html', 'learn-benchmarks.html', 'learn-glossary.html',
         'learn-blog.html',
         'news.html', 'article.html', 'technology.html', 'about.html', 'careers.html', 'contact.html',
         'quote.html', 'legal.html', 'partners.html', 'search.html', '404.html', 'sitemap.html')

try:
    from PIL import Image, ImageDraw, ImageFilter, ImageChops
    HAVE_PIL = True
except Exception:
    HAVE_PIL = False

def real(p):
    return os.path.realpath(p)

def safe_join(base, rel):
    """Join rel under base; return the path only if it stays inside base (realpath check)."""
    if not rel or not isinstance(rel, str):
        return None
    rp = real(os.path.join(real(base), rel.lstrip('/\\').replace('\\', '/')))
    bp = real(base)
    return rp if rp == bp or rp.startswith(bp + os.sep) else None

def ensure_dirs():
    for d in (A_CSS, A_JS, A_IMG, A_PROD, A_CARD):
        os.makedirs(d, exist_ok=True)

def _sanitize_name(name):
    return re.sub(r'[^A-Za-z0-9_-]', '', name) or 'asset'

def img_out(src, name, max_px=1000, quality=82):
    """Copy a verified workspace image into the prototype under a sanitized name."""
    if not src or not os.path.isfile(src):
        return None
    name = _sanitize_name(name)
    ext = '.png' if src.lower().endswith('.png') else '.webp'
    dst = os.path.join(A_PROD, name + ext)
    rel = 'assets/img/products/' + name + ext
    if os.path.isfile(dst):
        return rel
    try:
        if HAVE_PIL:
            im = Image.open(src)
            im = im.convert('RGBA') if (ext == '.png' and im.mode in ('P', 'LA')) else im.convert('RGB')
            w, h = im.size
            if max(w, h) > max_px:
                r = max_px / float(max(w, h))
                im = im.resize((int(w * r), int(h * r)), Image.LANCZOS)
            if ext == '.webp':
                im.save(dst, 'WEBP', quality=quality, method=4)
            else:
                im.save(dst, 'PNG', optimize=True)
        else:
            shutil.copyfile(src, dst)
        return rel
    except Exception as e:
        print('  [img FAIL]', os.path.basename(src), e)
        return None

def make_card_variants(rels):
    """Trim transparent margins from catalog cutouts into assets/img/card/ variants.

    The source cutouts sit on 1200x1200 square canvases with the product roughly
    centered; card grids use these trimmed variants so the visible product — not
    the empty canvas — sizes the rendered image inside a compact 4/3 well.
    Originals stay untouched (PDP gallery / mega menu rely on the square canvas).
    """
    made, skipped = 0, 0
    os.makedirs(A_CARD, exist_ok=True)
    for rel in rels:
        src = safe_join(OUT, rel)
        if not src or not os.path.isfile(src):
            print('  [card MISS]', rel)
            continue
        dst = os.path.join(A_CARD, os.path.basename(src))
        try:
            im = Image.open(src).convert('RGBA')
            bbox = im.getchannel('A').getbbox()
            if not bbox:
                skipped += 1
                continue
            crop = im.crop(bbox)
            # uniform breathing margin so drop-shadows never touch the well edge
            m = max(6, int(round(0.045 * max(crop.size))))
            padded = Image.new('RGBA', (crop.width + 2 * m, crop.height + 2 * m), (0, 0, 0, 0))
            padded.paste(crop, (m, m), crop)
            padded.save(dst, 'WEBP', quality=86, method=4)
            made += 1
        except Exception as e:
            print('  [card FAIL]', os.path.basename(src), e)
    print('  card variants: %d trimmed, %d empty, dest=assets/img/card/' % (made, skipped))
    return made

def site_asset(filename):
    """Copy a curated, verified asset from the design package into the prototype."""
    src = safe_join(FED, filename)
    if not src or not os.path.isfile(src):
        return None
    dst = os.path.join(A_IMG, filename)
    if not os.path.isfile(dst):
        try:
            if HAVE_PIL and filename.endswith(('.webp', '.png')) and os.path.getsize(src) > 400_000:
                im = Image.open(src)
                w, h = im.size
                if max(w, h) > 1200:
                    r = 1200.0 / max(w, h)
                    im = im.resize((int(w * r), int(h * r)), Image.LANCZOS)
                if filename.endswith('.webp'):
                    im.convert('RGB').save(dst, 'WEBP', quality=84, method=4)
                else:
                    im.convert('RGB').save(dst, 'PNG', optimize=True)
            else:
                shutil.copyfile(src, dst)
        except Exception:
            shutil.copyfile(src, dst)
    return 'assets/img/' + filename

def import_curated():
    missing = []
    for name in CURATED_ASSETS:
        if not site_asset(name):
            missing.append(name)
    return missing

def make_icons():
    if not HAVE_PIL or not os.path.isfile(LOGO_SRC):
        print('  [icons] logo source unavailable, skipped')
        return
    try:
        im = Image.open(LOGO_SRC).convert('RGBA')
        im = im.crop(im.getbbox())
        w, h = im.size
        side = max(w, h)
        canvas = Image.new('RGBA', (side, side), (10, 37, 64, 255))
        canvas.paste(im, ((side - w) // 2, (side - h) // 2), im)
        for px in (192, 512):
            canvas.resize((px, px), Image.LANCZOS).save(os.path.join(A_IMG, 'icon-%d.png' % px), 'PNG', optimize=True)
        canvas.resize((64, 64), Image.LANCZOS).save(os.path.join(A_IMG, 'favicon.png'), 'PNG', optimize=True)
        print('  wrote icons (192/512/favicon)')
    except Exception as e:
        print('  [icons FAIL]', e)

def make_transparent_logo():
    """Generate the site logo with a TRANSPARENT background from the source.

    The production twinmos-logo.png ships on an opaque white rectangle. Every
    dark-surface logo (footer, gaming header) is produced via the CSS filter
    `brightness(0) invert(1)`, which only works on transparent assets — on the
    white-box original it renders a solid white slab. This runs on every build,
    so all 21 pages, the header, footer, drawer and inline wordmarks share one
    regenerated asset (fix once, applies everywhere).
    """
    if not HAVE_PIL or not os.path.isfile(LOGO_SRC):
        print('  [logo] source unavailable, kept existing asset')
        return
    try:
        im = Image.open(LOGO_SRC).convert('RGBA')
        out = []
        for r, g, b, _a in im.getdata():
            d = 255 - min(r, g, b)                     # 0 at pure white
            a = 0 if d <= 10 else min(255, int((d - 10) * 1.06))
            if a == 0:
                out.append((0, 0, 0, 0))
            elif a >= 250:
                out.append((r, g, b, 255))
            else:
                # un-blend the white background out of anti-aliased edge pixels
                f = a / 255.0
                un = lambda c: max(0, min(255, int((c - 255 * (1 - f)) / f)))
                out.append((un(r), un(g), un(b), a))
        logo = Image.new('RGBA', im.size)
        logo.putdata(out)
        logo = logo.crop(logo.getbbox())               # trim transparent margins
        logo.save(os.path.join(A_IMG, 'logo.webp'), 'WEBP', quality=95, method=6)
        print('  wrote transparent logo %dx%d' % logo.size)
    except Exception as e:
        print('  [logo FAIL]', e)

# ---------------------------------------------------------------- hero banners
# Kingston/ADATA-style banners: gradient studio scene + product blended with
# glow and shadow into ONE image, so headline and art share a single picture.

_BN_W, _BN_H = 1920, 1080
_BN_PAL = {
    'navy':  (((4, 16, 31), (14, 66, 112)),   (0, 163, 224)),
    'gen5':  (((3, 13, 24), (15, 84, 112)),   (0, 224, 255)),
    'voltx': (((11, 11, 20), (53, 32, 107)),  (178, 107, 255)),
    'cyan':  (((4, 20, 27), (13, 86, 102)),   (34, 211, 238)),
    'neon':  (((7, 7, 14), (42, 24, 80)),     (0, 240, 255)),
    'neon2': (((10, 6, 16), (74, 18, 64)),    (255, 61, 154)),
    'gold':  (((6, 18, 33), (24, 58, 92)),      (233, 176, 64)),
}

def _bn_gradient(c1, c2):
    """Diagonal gradient canvas via a tiny 3x3 bilinear source."""
    sq = Image.new('RGB', (3, 3))
    px = sq.load()
    for y in range(3):
        for x in range(3):
            t = (x + y) / 4.0
            px[x, y] = tuple(int(a + (b - a) * t) for a, b in zip(c1, c2))
    return sq.resize((_BN_W, _BN_H), Image.BICUBIC).convert('RGBA')

def _bn_ellipse(size, rgb, alpha):
    """Soft radial ellipse (already feathered)."""
    pad = size // 4
    layer = Image.new('RGBA', (size + pad * 2, size + pad * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.ellipse((pad, pad, pad + size, pad + size), fill=rgb + (alpha,))
    return layer.filter(ImageFilter.GaussianBlur(size // 7))

def _bn_white_to_alpha(im):
    """Turn a near-white background into transparency (keeps the product)."""
    rgba = im.convert('RGBA')
    r, g, b, a = rgba.split()
    lum = Image.merge('RGB', (r, g, b)).convert('L')
    inv = lum.point(lambda v: 255 - v)          # 0 at white, high at dark
    alpha = inv.point(lambda v: 0 if v < 18 else min(255, int((v - 18) * 2.6)))
    rgba.putalpha(ImageChops.multiply(a, alpha))
    return rgba

def _bn_photo_fade(im, width, height, fade_frac=0.42, zoom=1.0):
    """Cover-crop a photo to widthxheight with a left-edge alpha fade.

    zoom > 1 crops tighter around the subject so two banners sharing a
    source photo still read as different compositions.
    """
    ratio = max(width / im.width, height / im.height) * zoom
    im2 = im.resize((int(im.width * ratio) + 1, int(im.height * ratio) + 1), Image.LANCZOS)
    left = (im2.width - width) // 2
    top = (im2.height - height) // 2
    im2 = im2.crop((left, top, left + width, top + height)).convert('RGBA')
    mask = Image.new('L', (width, 1), 255)
    mp = mask.load()
    fade = int(width * fade_frac)
    for x in range(fade):
        mp[x, 0] = int(255 * (x / max(1, fade - 1)) ** 1.4)
    mask = mask.resize((width, height))
    im2.putalpha(mask)
    return im2

def bake_hero_banner(slide, out_path):
    """Compose ONE blended banner: scene gradient + glows + grid + art + scrim."""
    (c1, c2), accent = _BN_PAL.get(slide.get('accent', 'navy'), _BN_PAL['navy'])
    canvas = _bn_gradient(c1, c2)

    # ambient glows
    g1 = _bn_ellipse(1150, accent, 80)
    canvas.alpha_composite(g1, (_BN_W - g1.width // 2 - 240, -g1.height // 2 - 150))
    g2 = _bn_ellipse(760, (255, 255, 255), 26)
    canvas.alpha_composite(g2, (_BN_W // 3, _BN_H - g2.height // 2 - 120))

    # faint tech grid, stronger toward the art side
    grid = Image.new('RGBA', (_BN_W, _BN_H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grid)
    step = 64
    for x in range(0, _BN_W, step):
        gd.line((x, 0, x, _BN_H), fill=(255, 255, 255, 9), width=1)
    for y in range(0, _BN_H, step):
        gd.line((0, y, _BN_W, y), fill=(255, 255, 255, 9), width=1)
    gmask = _bn_ellipse(1500, (255, 255, 255), 255).convert('L').point(lambda v: v // 2)
    gmask = gmask.resize((_BN_W, _BN_H))
    grid.putalpha(ImageChops.multiply(grid.split()[3], gmask))
    canvas.alpha_composite(grid)

    src = Image.open(os.path.join(OUT, slide['img']))
    if slide.get('mode') == 'photo':
        art = _bn_photo_fade(src, int(_BN_W * 0.66), _BN_H, 0.46, float(slide.get('zoom', 1.0)))
        canvas.alpha_composite(art, (_BN_W - art.width, 0))
        tint = Image.new('RGBA', (_BN_W, _BN_H), accent + (26,))
        canvas.alpha_composite(tint)
    else:
        art = _bn_white_to_alpha(src)
        art_h = int(_BN_H * 0.66)
        art = art.resize((int(art.width * art_h / art.height) or 1, art_h), Image.LANCZOS)
        art = art.crop(art.getbbox()) if art.getbbox() else art
        art_h = min(int(_BN_H * 0.72), art.height)
        art = art.resize((int(art.width * art_h / art.height) or 1, art_h), Image.LANCZOS)
        # soften cut edges so the silhouette melts into the scene
        a = art.split()[3].filter(ImageFilter.GaussianBlur(1.4))
        art.putalpha(a)
        # grade the product toward the scene accent (kills "pasted sticker" feel)
        grade = Image.new('RGBA', art.size, accent + (255,))
        art = Image.composite(Image.blend(art, grade, 0.10), art, art.split()[3].point(lambda v: v // 3))
        cx = int(_BN_W * 0.735)
        cy = int(_BN_H * 0.5)
        # ambient wrap: wide halo + tighter inner glow behind the product
        halo = _bn_ellipse(int(art.width * 1.7), accent, 90)
        canvas.alpha_composite(halo, (cx - halo.width // 2, cy - halo.height // 2))
        inner = _bn_ellipse(int(art.width * 1.2), accent, 110)
        canvas.alpha_composite(inner, (cx - inner.width // 2, cy - inner.height // 2))
        # soft contact shadow under the product
        shadow = _bn_ellipse(int(art.width * 1.15), (0, 0, 0), 150)
        canvas.alpha_composite(shadow, (cx - shadow.width // 2, cy + art.height // 2 - shadow.height // 3))
        canvas.alpha_composite(art, (cx - art.width // 2, cy - art.height // 2))

    # left scrim so overlay text always reads (fast: tiny strip, upscaled)
    strip_w = 64
    strip = Image.new('RGBA', (strip_w, 4), (0, 0, 0, 0))
    stp = strip.load()
    for x in range(strip_w):
        t = x / (strip_w - 1)
        a = int(122 * max(0.0, 1 - t / 0.62) ** 1.25) if t < 0.62 else 0
        for y in range(4):
            stp[x, y] = (3, 10, 20, a)
    scrim = strip.resize((_BN_W, _BN_H), Image.BICUBIC)
    canvas.alpha_composite(scrim)

    canvas.convert('RGB').save(out_path, 'WEBP', quality=84, method=5)


def make_gaming_wallpapers():
    """Bake downloadable VOLTX wallpapers (universal JPG) into assets/img/wallpapers/.

    Two desktop 1920x1080 designs + one vertical 1080x1920 mobile variant, composed
    from the same palette/glow helpers as the hero banners, trimmed product cutouts
    from assets/img/card/, and the logo (white-fill version for dark backgrounds).
    Returns [(title, w, h, rel_path)] for the gaming page download cards.
    """
    if not HAVE_PIL:
        return []
    out_dir = os.path.join(A_IMG, 'wallpapers')
    os.makedirs(out_dir, exist_ok=True)

    def _grad(w, h, c1, c2):
        sq = Image.new('RGB', (3, 3))
        px = sq.load()
        for y in range(3):
            for x in range(3):
                t = (x + y) / 4.0
                px[x, y] = tuple(int(a + (b - a) * t) for a, b in zip(c1, c2))
        return sq.resize((w, h), Image.BICUBIC).convert('RGBA')

    # white version of the wordmark for dark backgrounds
    try:
        logo = Image.open(os.path.join(A_IMG, 'logo.webp')).convert('RGBA')
        white = Image.new('RGBA', logo.size, (255, 255, 255, 0))
        white.paste(Image.new('RGBA', logo.size, (255, 255, 255, 255)), (0, 0), logo.split()[3])
    except Exception:
        white = None

    def _art(rel, target_h):
        p = os.path.join(A_CARD, os.path.basename(rel)) if os.path.isfile(
            os.path.join(A_CARD, os.path.basename(rel))) else safe_join(OUT, rel)
        im = Image.open(p).convert('RGBA')
        r = target_h / float(im.height)
        return im.resize((max(1, int(im.width * r)), target_h), Image.LANCZOS)

    def bake(fname, size, pal, accent, art_rel, art_h, art_box, logo_w=210):
        w, h = size
        canvas = _grad(w, h, pal[0], pal[1])
        glow = _bn_ellipse(int(max(w, h) * 0.62), accent, 70)
        canvas.alpha_composite(glow, ((w - glow.width) // 2, (h - glow.height) // 2))
        art = _art(art_rel, art_h)
        canvas.alpha_composite(art, art_box(art, w, h))
        if white is not None:
            lw = logo_w
            lh = max(1, int(white.height * lw / float(white.width)))
            canvas.alpha_composite(white.resize((lw, lh), Image.LANCZOS), (56, h - lh - 52))
        canvas.convert('RGB').save(os.path.join(out_dir, fname), 'JPEG', quality=88, optimize=True)
        return 'assets/img/wallpapers/' + fname

    made = [
        ('VOLTX Dark', 1920, 1080,
         bake('voltx-dark-1920x1080.jpg', (1920, 1080), ((8, 8, 13), (26, 16, 48)),
              (108, 74, 255), 'assets/img/voltx-rgb-elem.webp', 620,
              lambda a, w, h: (w - a.width - 150, (h - a.height) // 2))),
        ('CoreX Neon', 1920, 1080,
         bake('corex-neon-1920x1080.jpg', (1920, 1080), ((3, 13, 24), (10, 52, 70)),
              (0, 224, 255), 'assets/img/corex-pro.webp', 560,
              lambda a, w, h: (w - a.width - 170, (h - a.height) // 2))),
        ('VOLTX Mobile', 1080, 1920,
         bake('voltx-mobile-1080x1920.jpg', (1080, 1920), ((8, 8, 13), (22, 15, 42)),
              (0, 240, 255), 'assets/img/rgb-ram.webp', 760,
              lambda a, w, h: ((w - a.width) // 2, (h - a.height) // 2 - 120))),
    ]
    print('  wallpapers baked: %d -> assets/img/wallpapers/' % len(made))
    return made

def bake_article_heroes(mapping):
    """Bake wide article-hero banners from catalog cutouts.

    Article heroes are 21/9 photo-style banners; cover-cropping a transparent
    square canvas either clips the product or floats it in an empty band. Each
    hero is composed instead: soft brand gradient + centered trimmed product
    (from assets/img/card/) + faint accent glow. Mutates and returns the mapping
    with baked paths under assets/img/bn/.
    """
    if not HAVE_PIL:
        return mapping
    bn_dir = os.path.join(A_IMG, 'bn')
    os.makedirs(bn_dir, exist_ok=True)
    W, H = 1680, 720
    for art_id, rel in list(mapping.items()):
        src = safe_join(OUT, rel)
        if not src or not os.path.isfile(src):
            continue
        # prefer the trimmed variant so the product, not its canvas, is placed
        card = os.path.join(A_CARD, os.path.basename(rel))
        if os.path.isfile(card):
            src = card
        try:
            im = Image.open(src).convert('RGBA')
            strip = Image.new('RGB', (1, H))
            top, bottom = (242, 250, 254), (222, 236, 246)   # #F2FAFE → #DEECF6
            for y in range(H):
                t = y / float(H - 1)
                strip.putpixel((0, y), tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3)))
            rgba = strip.resize((W, H)).convert('RGBA')
            glow = _bn_ellipse(int(W * 0.34), (196, 222, 244), 110)
            rgba.alpha_composite(glow, ((W - glow.width) // 2, (H - glow.height) // 2))
            # scale product to ~64% of banner height, keep aspect
            ph = int(H * 0.64)
            r = ph / float(im.height)
            pw = int(im.width * r)
            if pw > int(W * 0.82):                      # very wide: cap width instead
                r = (W * 0.82) / float(im.width)
                pw, ph = int(im.width * r), int(im.height * r)
            art = im.resize((pw, ph), Image.LANCZOS)
            sh = Image.new('RGBA', rgba.size, (0, 0, 0, 0))
            sh.paste(art, ((W - pw) // 2, (H - ph) // 2), art)
            shadow = Image.new('RGBA', rgba.size, (0, 0, 0, 0))
            sp = sh.split()[3].point(lambda v: int(v * 0.22))
            shadow.putalpha(sp)
            shadow = shadow.filter(ImageFilter.GaussianBlur(18))
            rgba.alpha_composite(shadow, (0, 26))
            rgba.alpha_composite(sh, (0, 0))
            name = 'art-%s.webp' % _sanitize_name(art_id)
            rgba.convert('RGB').save(os.path.join(bn_dir, name), 'WEBP', quality=86, method=4)
            mapping[art_id] = 'assets/img/bn/' + name
        except Exception as e:
            print('  [art-hero FAIL]', art_id, e)
    print('  article heroes baked:', len([v for v in mapping.values() if '/bn/art-' in v]))
    return mapping

def bake_hero_banners(slides, prefix):
    """Bake banners for a slide list; returns {slide-index: web path}."""
    if not HAVE_PIL:
        return {}
    out = {}
    bn_dir = os.path.join(A_IMG, 'bn')
    os.makedirs(bn_dir, exist_ok=True)
    for i, s in enumerate(slides):
        name = '%s-%d.webp' % (prefix, i)
        path = os.path.join(bn_dir, name)
        try:
            bake_hero_banner(s, path)
            out[i] = 'assets/img/bn/' + name
            s['img'] = out[i]
        except Exception as e:
            print('  [banner FAIL]', prefix, i, e)
    return out
