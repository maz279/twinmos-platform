import { readFileSync, writeFileSync } from 'node:fs';

let content = readFileSync('apps/web/src/pages/index.astro', 'utf8');

// The bodyHtml is a JS string with escaped quotes \" and newlines \n
const bodyMatch = content.match(/const bodyHtml = "([\s\S]*?)";\s*---/);
let html = '';
if (bodyMatch) {
  html = JSON.parse(`"${bodyMatch[1]}"`);
} else {
  html = content;
}

const extract = (src: string, startTag: string, endTag: string) => {
  const start = src.indexOf(startTag);
  if (start === -1) return null;
  const end = src.indexOf(endTag, start);
  if (end === -1) return null;
  return src.slice(start, end + endTag.length);
};

const header = extract(html, '<header class="site-header">', '</header>');
const drawer = extract(html, '<div class="drawer" id="drawer">', '</div></div>');
const search = extract(html, '<div class="search-overlay" id="searchOverlay"', '</div></div></div>');
const footer = extract(html, '<footer class="site-footer">', '</footer>');
const cookie = extract(html, '<div class="cookie-bar" id="cookieBar"', '</div>');
const main = extract(html, '<main id="main">', '</main>');

console.log('Parsed HTML length:', html.length);
console.log('Header length:', header?.length);
console.log('Drawer length:', drawer?.length);
console.log('Search length:', search?.length);
console.log('Footer length:', footer?.length);
console.log('Cookie length:', cookie?.length);
console.log('Main length:', main?.length);

if (header) writeFileSync('tooling/sample-header.html', header);
if (footer) writeFileSync('tooling/sample-footer.html', footer);
if (drawer) writeFileSync('tooling/sample-drawer.html', drawer);
if (search) writeFileSync('tooling/sample-search.html', search);
if (cookie) writeFileSync('tooling/sample-cookie.html', cookie);
if (main) writeFileSync('tooling/sample-main.html', main);
