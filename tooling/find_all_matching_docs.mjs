import fs from 'node:fs';
import path from 'node:path';

function walk(dir) {
  let res = [];
  try {
    for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, d.name);
      if (d.isDirectory()) {
        if (!['.git', 'node_modules', '.cache', 'dist', 'coverage', 'litespeed', 'wp-content'].includes(d.name)) {
          res.push(...walk(full));
        }
      } else {
        if (/\.(md|txt|pdf|docx|json)$/i.test(d.name)) {
          res.push(full);
        }
      }
    }
  } catch (e) {}
  return res;
}

const all = walk('C:\\Software_Project\\TwinMOS_Corporate_Website');
console.log(`Total doc files found: ${all.length}`);
for (const f of all) {
  const bn = path.basename(f);
  if (/(?:06|R6|Migration|SIT|UAT|Parallel)/i.test(bn)) {
    console.log(f);
  }
}
