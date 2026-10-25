import fs from 'node:fs';

const p = 'C:\\Software_Project\\TwinMOS_Corporate_Website\\TwinMOS_Corporate_Website\\twinmso_codebase\\apps\\web\\public\\assets\\js\\app.js';
const appJs = fs.readFileSync(p, 'utf8');
const lines = appJs.split('\n');

lines.forEach((l, idx) => {
  if (/(?:slider|carousel|pause|setInterval)/i.test(l)) {
    console.log(`app.js L${idx+1}: ${l.trim().slice(0, 100)}`);
  }
});
