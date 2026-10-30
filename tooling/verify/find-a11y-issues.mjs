import fs from 'node:fs';
import path from 'node:path';

const srcDir = 'C:/Software_Project/TwinMOS_Corporate_Website/TwinMOS_Corporate_Website/twinmso_codebase/apps/admin/src';

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      scanDir(p);
    } else if (f.endsWith('.tsx')) {
      const content = fs.readFileSync(p, 'utf8');
      const lines = content.split('\n');
      lines.forEach((l, idx) => {
        if (l.includes('#66748A') || l.includes('#93A0B4') || l.includes('#98A2B3')) {
          console.log(`[COLOR] ${path.relative(srcDir, p)}:${idx + 1}: ${l.trim().slice(0, 80)}`);
        }
        if (l.includes('<select') && !l.includes('aria-label') && !l.includes('aria-labelledby')) {
          console.log(`[SELECT] ${path.relative(srcDir, p)}:${idx + 1}: ${l.trim().slice(0, 80)}`);
        }
        if (l.includes('<input') && l.includes('type="date"') && !l.includes('aria-label')) {
          console.log(`[DATE] ${path.relative(srcDir, p)}:${idx + 1}: ${l.trim().slice(0, 80)}`);
        }
      });
    }
  }
}

scanDir(srcDir);
