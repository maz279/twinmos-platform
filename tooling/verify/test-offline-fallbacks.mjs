async function test() {
  const cases = [
    { url: 'http://localhost:4321/404', expectedStatus: 404, fallbackAttr: 'offline-404' },
    { url: 'http://localhost:4321/410', expectedStatus: 410, fallbackAttr: 'offline-410' },
    { url: 'http://localhost:4321/500', expectedStatus: 500, fallbackAttr: 'offline-500' },
    { url: 'http://localhost:4321/maintenance', expectedStatus: 503, fallbackAttr: 'offline-maintenance' },
  ];

  let passed = 0;
  let failed = 0;

  for (const c of cases) {
    try {
      const res = await fetch(c.url, { redirect: 'manual' });
      const text = await res.text();
      const statusOk = res.status === c.expectedStatus;
      const fallbackOk = text.includes(`data-fallback="${c.fallbackAttr}"`);

      if (statusOk && fallbackOk) {
        console.log(`[PASS] ${c.url} (API DOWN) -> status: ${res.status}, fallback: ${c.fallbackAttr} verified.`);
        passed++;
      } else {
        console.error(`[FAIL] ${c.url} (API DOWN) -> status: ${res.status} (expected ${c.expectedStatus}), fallbackOk: ${fallbackOk}`);
        failed++;
      }
    } catch (e) {
      console.error(`[ERROR] ${c.url} -> ${e.message}`);
      failed++;
    }
  }

  console.log(`\nOffline Fallback Results: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

test();
