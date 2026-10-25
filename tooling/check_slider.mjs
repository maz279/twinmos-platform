import fs from 'node:fs';
import path from 'node:path';

function searchInDir(dir, pattern) {
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (!['node_modules', 'dist', '.git'].includes(item.name)) {
        searchInDir(full, pattern);
      }
    } else if (/\.(js|ts|astro|mjs)$/.test(item.name)) {
      const txt = fs.readFileSync(full, 'utf8');
      if (pattern.test(txt)) {
        console.log(`Match in ${full}`);
      }
    }
  }
}

console.log('Searching for slider / carousel / pause in apps/web and packages/shared...');
searchInDir('C:\\Software_Project\\TwinMOS_Corporate_Website\\TwinMOS_Corporate_Website\\twinmso_codebase\\apps\\web', /(?:slider|carousel|auto-rotat|pause.*control|WCAG 2\.2\.2)/i);
searchInDir('C:\\Software_Project\\TwinMOS_Corporate_Website\\TwinMOS_Corporate_Website\\twinmso_codebase\\packages\\shared', /(?:slider|carousel|auto-rotat|pause)/i);
