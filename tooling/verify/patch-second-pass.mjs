import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const repoRoot = resolve(process.cwd());

function patch(rel, fn) {
  const file = resolve(repoRoot, rel);
  const orig = readFileSync(file, 'utf8');
  const res = fn(orig);
  if (orig !== res) {
    writeFileSync(file, res, 'utf8');
    console.log('[PATCHED]', rel);
  } else {
    console.log('[NO CHANGE]', rel);
  }
}

// 1. users.tsx: Import MUTED
patch('apps/admin/src/modules/users.tsx', (s) => {
  if (!s.includes('MUTED')) {
    s = s.replace(/import\s*\{\s*btn,\s*btnGhost,\s*card,\s*Empty,\s*Err,\s*input,\s*Table,\s*td,\s*useAsync,\s*usePanelScroll\s*\}\s*from\s*'\.\.\/ui';/,
      "import { btn, btnGhost, card, Empty, Err, input, MUTED, Table, td, useAsync, usePanelScroll } from '../ui';");
  }
  return s;
});

// 2. audit.tsx: Import MUTED
patch('apps/admin/src/modules/audit.tsx', (s) => {
  if (!s.includes('MUTED')) {
    s = s.replace(/import\s*\{\s*btn,\s*btnGhost,\s*card,\s*Empty,\s*Err,\s*input,\s*Table,\s*td,\s*useAsync\s*\}\s*from\s*'\.\.\/ui';/,
      "import { btn, btnGhost, card, Empty, Err, input, MUTED, Table, td, useAsync } from '../ui';");
  }
  return s;
});

// 3. settings.tsx: Import MUTED
patch('apps/admin/src/modules/settings.tsx', (s) => {
  if (!s.includes('MUTED')) {
    s = s.replace(/import\s*\{\s*btn,\s*btnGhost,\s*Empty,\s*Err,\s*input,\s*useAsync\s*\}\s*from\s*'\.\.\/ui';/,
      "import { btn, btnGhost, Empty, Err, input, MUTED, useAsync } from '../ui';");
  }
  return s;
});

// 4. products.tsx: badge text contrast
patch('apps/admin/src/modules/products.tsx', (s) => {
  s = s.replace(/color:\s*'#0E9F7E'/g, "color: '#065F46'");
  return s;
});

// 5. media.tsx: compliance chip & folder colors
patch('apps/admin/src/modules/media.tsx', (s) => {
  s = s.replace(/color:\s*missing\s*\?\s*'#C2453C'\s*:\s*'#1F9D62'/g, "color: missing ? '#C2453C' : '#0F6B54'");
  s = s.replace(/color:\s*folder\s*===\s*'all'\s*\?\s*'#0E9F7E'\s*:\s*'#475467'/g, "color: folder === 'all' ? '#065F46' : MUTED");
  s = s.replace(/color:\s*folder\s*===\s*'none'\s*\?\s*'#0E9F7E'\s*:\s*'#475467'/g, "color: folder === 'none' ? '#065F46' : MUTED");
  s = s.replace(/color:\s*folder\s*===\s*f\.id\s*\?\s*'#0E9F7E'\s*:\s*'#475467'/g, "color: folder === f.id ? '#065F46' : MUTED");
  return s;
});

// 6. partners.tsx: DistributorEditor select aria-labels
patch('apps/admin/src/modules/partners.tsx', (s) => {
  s = s.replace(/<select\s+style=\{\{\s*\.\.\.input,\s*width:\s*'100%'\s*\}\}\s+value=\{form\.region\}/,
    '<select style={{ ...input, width: \'100%\' }} aria-label="Region" value={form.region}');
  s = s.replace(/<select\s+style=\{\{\s*\.\.\.input,\s*width:\s*'100%'\s*\}\}\s+value=\{form\.status\}/,
    '<select style={{ ...input, width: \'100%\' }} aria-label="Status" value={form.status}');
  return s;
});

// 7. submissions.tsx: table SLA color and fallback
patch('apps/admin/src/modules/submissions.tsx', (s) => {
  s = s.replace(/on_track:\s*'#1F9D62'/g, "on_track: '#15803D'");
  s = s.replace(/color:\s*SLA_COLOR\[s\.slaState\s*\?\?\s*''\]\s*\?\?\s*'#66748A'/g, "color: SLA_COLOR[s.slaState ?? ''] ?? MUTED");
  s = s.replace(/color:\s*replied\s*\?\s*'#1F9D62'\s*:\s*waiting\s*\?\s*'#B45309'\s*:\s*'#93A0B4'/g, "color: replied ? '#15803D' : waiting ? '#B45309' : MUTED");
  s = s.replace(/<span\s+style=\{\{\s*fontSize:\s*11\.5,\s*color:\s*'#93A0B4'\s*\}\}>\{s\.assigneeEmail/g, '<span style={{ fontSize: 11.5, color: MUTED }}>{s.assigneeEmail');
  return s;
});

console.log('[patch-second-pass] Completed.');
