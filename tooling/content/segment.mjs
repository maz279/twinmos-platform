// Segments a prototype page's <main> into the same ordered component list the
// CMS block inventory was built from (port of the audit's 07_inventory.cjs
// segmentation, minus classification): each entry is the component element plus
// its attached section head and intro paragraphs. Used by rebuild-blocks.mjs to
// pair every stored CMS block with the prototype DOM it was cut from.
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';

const cls = (el) => ((el.getAttribute && el.getAttribute('class')) || '').trim();
const SPECIAL_WRAP = /(about-cols|contact-cols|rma-cols|reach-in|gstat-in)/;

export function desc(el) {
  const id = el.id ? '#' + el.id : '';
  const c = cls(el) ? '.' + cls(el).split(/\s+/).join('.') : '';
  return el.tagName.toLowerCase() + id + c;
}

export function segmentPage(htmlPath) {
  const raw = readFileSync(htmlPath, 'utf8').replace(/<br\s*\/?>/g, '<br> ');
  const dom = new JSDOM(raw);
  const d = dom.window.document;
  const main = d.querySelector('main');
  const out = [];
  if (!main) return { document: d, segments: out };
  const push = (comp, top, head, intro) => out.push({ el: comp, top, head, intro, component: desc(comp), sectionId: top.id || '' });
  for (const top of main.children) {
    if (top.matches('.page-hero')) { push(top, top, null, []); continue; }
    if (top.tagName === 'SCRIPT') { push(top, top, null, []); continue; }
    if (top.matches('nav.about-nav')) { push(top, top, null, []); continue; }
    if (top.matches('div.wrap') && top.querySelector('.breadcrumb')) { push(top, top, null, []); continue; }
    if (top.matches('.wty-strip')) { push(top.querySelector('.wty-in'), top, null, []); continue; }
    if (top.matches('.empty-state')) { push(top, top, null, []); continue; }
    if (top.tagName !== 'SECTION') { push(top, top, null, []); continue; }
    let comps = [];
    for (const ch of top.children) {
      const c = cls(ch);
      if (/\bwrap\b/.test(c) && !ch.id && !SPECIAL_WRAP.test(c) && !ch.querySelector(':scope > .grad-text')) comps.push(...ch.children);
      else comps.push(ch);
    }
    const merged = [];
    for (let i = 0; i < comps.length; i++) {
      const c0 = comps[i];
      if (c0.matches('.tabs') && comps[i + 1] && comps[i + 1].matches('.tabpane')) {
        const w = d.createElement('div'); w.className = '__tabbed';
        c0.parentNode.insertBefore(w, c0); w.appendChild(c0);
        while (comps[i + 1] && comps[i + 1].matches('.tabpane')) { w.appendChild(comps[i + 1]); i++; }
        merged.push(w);
      } else merged.push(c0);
    }
    comps = merged;
    if (top.matches('.lsec-letter')) { push(top, top, null, []); continue; }
    let head = null, attached = false, intro = [];
    for (const comp of comps) {
      if (comp.matches('.section-head')) { head = comp; attached = false; intro = []; continue; }
      if (comp.matches('.lsearch, .reach-orbit')) continue;
      if (head && !attached && comp.matches('p.form-note, p.lede')) { intro.push(comp); continue; }
      push(comp, top, head && !attached ? head : null, head && !attached ? intro : []);
      if (head) attached = true;
    }
  }
  return { document: d, segments: out };
}
