import fs from 'node:fs';

const p = 'C:\\Software_Project\\TwinMOS_Corporate_Website\\TwinMOS_Corporate_Website\\twinmso_codebase\\apps\\web\\src\\components\\blocks\\BlockDispatcher.astro';
const content = fs.readFileSync(p, 'utf8');
const lines = content.split('\n');

lines.forEach((l, idx) => {
  if (/(?:b\.type === 'form'|b\?.type === 'form'|getDeliveryFormDefinition|form-container|<form)/i.test(l)) {
    console.log(`L${idx+1}: ${l.trim().slice(0, 100)}`);
  }
});
