import fs from 'node:fs';

const res = await fetch('http://localhost:4321/support');
const html = await res.text();
console.log('Support page status:', res.status);
console.log('Forms on support page:');
const matches = html.match(/<form[^>]*>/g) || [];
matches.forEach(m => console.log('  ', m));
