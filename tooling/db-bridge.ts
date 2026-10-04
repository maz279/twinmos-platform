// Bridge so tooling/*.mjs scripts can import the workspace TS packages under
// node --experimental-strip-types (no workspace resolution in plain node ESM).
export { createDb, article, newsPost, faq, page, product, productVariant, brand, category, compatibilityRule, distributor, marketplaceListing, jobPosting } from '../packages/db/src/index.ts';
