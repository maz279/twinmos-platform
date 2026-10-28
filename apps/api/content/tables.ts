// CMS content tables in FK-safe load order. Anything not listed (users, sessions,
// audit, submissions, RMA, newsletter, serial registry, sn checks, outbox,
// revisions, comments, partner data) is operational data and never snapshotted.
export const CONTENT_TABLES = [
  'locale', 'setting', 'media_folder', 'media_asset', 'brand', 'category', 'product', 'product_variant',
  'compatibility_rule', 'device_type_label', 'spec_dictionary', 'spec_template',
  'page', 'article', 'news_post', 'faq', 'glossary_term', 'policy_document', 'office', 'testimonial',
  'distributor', 'marketplace_listing', 'job_posting', 'form_definition', 'form_field',
  'nav_menu', 'nav_item', 'redirect', 'translation', 'entity_translation',
];
