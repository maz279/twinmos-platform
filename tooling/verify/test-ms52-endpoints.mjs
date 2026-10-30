async function test() {
  const cases = [
    { url: 'http://localhost:4321/404', expectedStatus: 404, expectedText: 'This page went out of stock' },
    { url: 'http://localhost:4321/410', expectedStatus: 410, expectedText: 'This resource is no longer available' },
    { url: 'http://localhost:4321/500', expectedStatus: 500, expectedText: 'Something went wrong on our end' },
    { url: 'http://localhost:4321/maintenance', expectedStatus: 503, expectedText: 'We will be right back' },
    { url: 'http://localhost:4321/about', expectedStatus: 200, expectedText: 'About', checkCacheTags: true },
    { url: 'http://localhost:4321/contact', expectedStatus: 200, expectedText: 'Contact', checkCacheTags: true },
    { url: 'http://localhost:4321/random-slug-does-not-exist-xyz', expectedStatus: 404, expectedText: '404' },
  ];

  let passed = 0;
  let failed = 0;

  for (const c of cases) {
    try {
      const res = await fetch(c.url, { redirect: 'manual' });
      const text = await res.text();
      const statusOk = res.status === c.expectedStatus;
      const textOk = text.includes(c.expectedText);
      const cacheTag = res.headers.get('Cache-Tag') || res.headers.get('cache-tag');
      const xCacheTags = res.headers.get('X-Cache-Tags') || res.headers.get('x-cache-tags');
      const tagsOk = !c.checkCacheTags || (Boolean(cacheTag) && Boolean(xCacheTags));

      if (statusOk && textOk && tagsOk) {
        console.log(`[PASS] ${c.url} -> status: ${res.status}, tag: ${cacheTag || 'none'}, contains: "${c.expectedText}"`);
        passed++;
      } else {
        console.error(`[FAIL] ${c.url} -> status: ${res.status} (expected ${c.expectedStatus}), textOk: ${textOk}, tagsOk: ${tagsOk}, tag: ${cacheTag}`);
        failed++;
      }
    } catch (e) {
      console.error(`[ERROR] ${c.url} -> ${e.message}`);
      failed++;
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

test();
