import fs from 'node:fs';
import path from 'node:path';

const inventoryPath = 'tooling/data/inventory_blocks.json';
const outputPath = 'tooling/data/tracked-fixture-pages.json';

if (!fs.existsSync(inventoryPath)) {
  console.error('Inventory not found:', inventoryPath);
  process.exit(1);
}

const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
const pageGroups = {};
for (const item of inventory) {
  if (!pageGroups[item.page]) pageGroups[item.page] = [];
  pageGroups[item.page].push(item);
}

const currentYear = new Date().getFullYear();
const foundingAge = currentYear - 1998;
const pagesCache = {};

for (const [pageKey, blocks] of Object.entries(pageGroups)) {
  const structuredBlocks = blocks.map(invBlock => {
    let sectionHtml = invBlock.source || '';
    sectionHtml = sectionHtml
      .replace(/Interactive prototype\s*[—–-]\s*demo data where marked/gi, '')
      .replace(/Interactive prototype/gi, '')
      .replace(/nothing is sent from your browser/gi, '')
      .replace(/This prototype stores nothing server-side/gi, '')
      .replace(/\b27\+?\s*years?\b/gi, `${foundingAge}+ years`)
      .replace(/\b28\s*years?\b/gi, `${foundingAge} years`)
      .replace(/\b27-year\b/gi, `${foundingAge}-year`)
      .replace(/\b28-year\b/gi, `${foundingAge}-year`);

    const isFormComposite = invBlock.type === 'form' || /contactForm|quoteForm|rmaForm|partnerForm/i.test(invBlock.component);
    let formType;
    if (isFormComposite) {
      if (pageKey === 'contact') formType = 'contact';
      else if (pageKey === 'quote') formType = 'quote';
      else if (pageKey === 'rma') formType = 'rma';
      else if (pageKey === 'partners') formType = 'partner';
      else if (pageKey === 'careers') formType = 'careers';
      else formType = 'contact';
    }

    return {
      id: `${pageKey}-block-${invBlock.order}`,
      type: isFormComposite ? 'form' : invBlock.type,
      ...(formType ? { formType } : {}),
      heading: invBlock.heading || invBlock.secHead || '',
      eyebrow: invBlock.eyebrow || '',
      title: invBlock.heading || invBlock.secHead || '',
      sectionId: invBlock.sectionId || '',
      component: invBlock.component || '',
      html: sectionHtml.trim(),
      meta: {
        order: invBlock.order,
        what: invBlock.what,
        items: invBlock.items,
      },
    };
  });

  const pagePath = pageKey === 'index' ? '/' : `/${pageKey}`;
  const title = `${pageKey.charAt(0).toUpperCase() + pageKey.slice(1).replace(/-/g, ' ')} | TwinMOS`;
  const desc = `TwinMOS Technologies: High-Performance Memory & Storage Solutions.`;

  pagesCache[pageKey] = {
    slug: pageKey,
    locale: 'en',
    title,
    seoTitle: title,
    seoDescription: desc,
    path: pagePath,
    template: pageKey,
    blocks: structuredBlocks,
    status: 'published',
    publishedAt: new Date().toISOString(),
  };
}

fs.writeFileSync(outputPath, JSON.stringify(pagesCache, null, 2), 'utf8');
console.log(`Successfully generated ${Object.keys(pagesCache).length} pages in ${outputPath}`);
