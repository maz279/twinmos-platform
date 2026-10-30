import fs from 'node:fs';

const r = JSON.parse(fs.readFileSync('_audit_evidence/comprehensive_audit_report.json', 'utf8'));
console.log('Total audited pages:', r.length);

let totalBrokenImages = 0;
let totalConsoleErrors = 0;
let totalJsErrors = 0;
let totalA11y = 0;
let totalMissingH2s = 0;

for (const p of r) {
  totalBrokenImages += p.brokenImagesCount || 0;
  totalConsoleErrors += p.prodConsoleErrors || 0;
  totalJsErrors += p.prodJsErrors || 0;
  totalA11y += p.a11yViolationsCount || 0;
  totalMissingH2s += p.missingH2s?.length || 0;

  console.log(`[${p.page.padEnd(16)}] ratio=${String(p.textLengthRatio).padEnd(5)} | protoLen=${String(p.protoTextLength).padEnd(6)} prodLen=${String(p.prodTextLength).padEnd(6)} | missingH2=${p.missingH2s?.length || 0} | brokenImgs=${p.brokenImagesCount} | a11y=${p.a11yViolationsCount}`);
  if (p.missingH2s?.length) console.log(`   Missing H2s: ${JSON.stringify(p.missingH2s)}`);
  if (p.brokenImagesCount > 0) console.log(`   Broken Images Count: ${p.brokenImagesCount}`);
  if (p.a11yViolationsCount > 0) console.log(`   A11y: ${JSON.stringify(p.a11yViolations)}`);
}

console.log('\n================ TOTALS ================');
console.log('Total broken images:', totalBrokenImages);
console.log('Total console errors:', totalConsoleErrors);
console.log('Total JS errors:', totalJsErrors);
console.log('Total a11y violations:', totalA11y);
console.log('Total missing H2s:', totalMissingH2s);
