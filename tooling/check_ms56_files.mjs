import fs from 'node:fs';
import path from 'node:path';

console.log('--- Checking tooling/verify/ ---');
const verifyFiles = fs.readdirSync('tooling/verify');
verifyFiles.forEach(f => {
  if (/ms5|bridge|content|block|search/i.test(f)) {
    console.log('tooling/verify/' + f);
  }
});

console.log('\n--- Checking tooling/gates/ ---');
const gateFiles = fs.readdirSync('tooling/gates');
gateFiles.forEach(f => {
  console.log('tooling/gates/' + f);
});
