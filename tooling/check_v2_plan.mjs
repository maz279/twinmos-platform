import fs from 'node:fs';

const p = 'C:\\Software_Project\\TwinMOS_Corporate_Website\\TwinMOS_Corporate_Website\\audit\\Audit_report\\TwinMOS_Revised_Implementation_Plan_v2_2026-10-12.md';
const content = fs.readFileSync(p, 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (/(Phase.*R6|Phase.*6|SIT|UAT|Parallel)/i.test(l)) {
    console.log(`${i+1}: ${l.trim().slice(0, 100)}`);
  }
});
