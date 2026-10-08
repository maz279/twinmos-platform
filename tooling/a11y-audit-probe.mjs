import { chromium } from '@playwright/test';

const PAGES = [
  'http://localhost:4321/',
  'http://localhost:4321/shop.html',
  'http://localhost:4321/quote.html',
  'http://localhost:4321/contact.html',
  'http://localhost:4321/rma.html',
  'http://localhost:4321/support.html',
  'http://localhost:4321/careers.html',
  'http://localhost:4321/partners.html',
  'http://localhost:4321/compatibility.html',
];

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('=== STARTING AUTOMATED A11Y AUDIT ===\n');

  for (const url of PAGES) {
    console.log(`--- Auditing: ${url} ---`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    // 1. Global Page Checks (from a11y-snippets.md #4)
    const globals = await page.evaluate(() => ({
      lang: document.documentElement.lang || 'MISSING',
      title: document.title || 'MISSING',
      viewport: document.querySelector('meta[name="viewport"]')?.content || 'MISSING',
      h1Count: document.querySelectorAll('h1').length,
    }));
    console.log(`  Globals: lang="${globals.lang}", title="${globals.title.slice(0, 40)}...", h1Count=${globals.h1Count}`);

    // 2. Orphaned Form Inputs (from a11y-snippets.md #1)
    const orphanedInputs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input, select, textarea'))
        .filter(i => {
          // ignore hidden or type="hidden"
          if (i.type === 'hidden' || i.style.display === 'none' || i.style.visibility === 'hidden') return false;
          const hasId = i.id && document.querySelector(`label[for="${i.id}"]`);
          const hasAria = i.getAttribute('aria-label') || i.getAttribute('aria-labelledby');
          return !hasId && !hasAria && !i.closest('label');
        })
        .map(i => ({ tag: i.tagName, id: i.id, name: i.name, type: i.type, placeholder: i.placeholder }));
    });
    console.log(`  Orphaned Form Inputs: ${orphanedInputs.length}`);
    if (orphanedInputs.length > 0) {
      console.log('    Details:', JSON.stringify(orphanedInputs.slice(0, 3)));
    }

    // 3. Images Missing Alt attribute
    const missingAlt = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img'))
        .filter(img => !img.hasAttribute('alt'))
        .map(img => img.src.slice(-40));
    });
    console.log(`  Images missing alt: ${missingAlt.length}`);

    // 4. Buttons without accessible names
    const emptyButtons = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button, a[role="button"]'))
        .filter(b => {
          const text = (b.innerText || b.textContent || '').trim();
          const ariaLabel = b.getAttribute('aria-label') || b.getAttribute('aria-labelledby') || b.title;
          return !text && !ariaLabel;
        })
        .map(b => ({ class: b.className, html: b.outerHTML.slice(0, 80) }));
    });
    console.log(`  Buttons without accessible name: ${emptyButtons.length}`);
    if (emptyButtons.length > 0) {
      console.log('    Details:', JSON.stringify(emptyButtons.slice(0, 3)));
    }

    // 5. Tap Targets under 24px (relaxed minimum probe)
    const smallTargets = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button, a, input, select'))
        .filter(el => {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return false;
          return rect.width < 24 || rect.height < 24;
        })
        .map(el => ({ tag: el.tagName, text: el.textContent?.slice(0, 20), size: `${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}` }));
    });
    console.log(`  Small tap targets (<24px): ${smallTargets.length}`);
    console.log('');
  }

  // Admin Console A11Y Audit
  console.log('--- Auditing Admin Console: http://localhost:4173/#/m/products ---');
  await page.goto('http://localhost:4173/#/m/products', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Check if sign-in is required
  const onLogin = (await page.locator('text=Staff sign-in').count()) > 0;
  if (onLogin) {
    console.log('  Signing in to Admin Console...');
    await page.fill('input[type="email"], input[name="email"]', 'admin@twinmos.dev');
    await page.fill('input[type="password"], input[name="password"]', 'admin');
    await page.locator('button:has-text("Sign in")').click();
    await page.waitForSelector('nav, .site-header', { timeout: 15000 });
  }

  const adminGlobals = await page.evaluate(() => {
    const orphaned = Array.from(document.querySelectorAll('input, select, textarea'))
      .filter(i => {
        if (i.type === 'hidden' || i.style.display === 'none') return false;
        const hasId = i.id && document.querySelector(`label[for="${i.id}"]`);
        const hasAria = i.getAttribute('aria-label') || i.getAttribute('aria-labelledby');
        return !hasId && !hasAria && !i.closest('label');
      })
      .map(i => ({ tag: i.tagName, id: i.id, placeholder: i.placeholder, className: i.className }));
    return {
      lang: document.documentElement.lang || 'MISSING',
      title: document.title || 'MISSING',
      orphanedInputs: orphaned.length,
      orphanedList: orphaned,
      emptyButtons: Array.from(document.querySelectorAll('button'))
        .filter(b => {
          const text = (b.innerText || b.textContent || '').trim();
          const ariaLabel = b.getAttribute('aria-label') || b.getAttribute('aria-labelledby') || b.title;
          return !text && !ariaLabel;
        }).length,
    };
  });
  console.log(`  Admin Globals: lang="${adminGlobals.lang}", title="${adminGlobals.title}"`);
  console.log(`  Admin Orphaned Form Inputs: ${adminGlobals.orphanedInputs}`);
  if (adminGlobals.orphanedList.length) console.log('    Details:', JSON.stringify(adminGlobals.orphanedList));
  console.log(`  Admin Empty Buttons: ${adminGlobals.emptyButtons}`);

  await browser.close();
  console.log('\n=== A11Y AUDIT COMPLETE ===');
}

run().catch(err => {
  console.error('Audit script error:', err);
  process.exit(1);
});
