# ADR-017: Translation Workflow and Vendor Selection

| Field | Value |
|-------|-------|
| **ADR Number** | ADR-017 |
| **Date** | 2026-04-15 |
| **Status** | Accepted — Partial (Vendor TBD Phase 2) |
| **Deciders** | Engineering Lead, Project Owner |
| **Source** | Tech Stack §11 |

---

## 1. Context

TwinMOS requires professional translation for 8 non-English locales across a 287+ page content set:

| Phase | New Locales | Translation Need |
|-------|------------|-----------------|
| Phase 1 | EN | Content authored by TwinMOS marketing team |
| Phase 2 | AR, BN, HI | Professional translation required — critical markets |
| Phase 3 | RU, ZH-CN, FR | Professional translation required |
| Phase 4 | ES, PT, DE | Professional translation required |

**Content volume (at full localisation):**
- ~287 pages × 8 locales = ~2,300 content units
- 100+ product pages with spec tables, descriptions, feature highlights
- Legal pages (Privacy Policy, Terms, Warranty) × 9 locales
- Navigation + UI strings × 9 locales (Astro i18n JSON files)

**Translation quality requirements:**
- Arabic (AR): **Highest priority** — TwinMOS's largest non-English market; right-to-left; technical memory/storage terminology must be accurate; Gulf Arabic preferred (UAE market)
- Bengali (BN): B2B distributor audience; formal register
- Hindi (HI): Consumer + B2B; formal register
- Russian (RU), Chinese ZH-CN, French (FR): Standard professional quality
- Spanish (ES), Portuguese (PT), German (DE): Phase 4

---

## 2. Decision

**Phase 1:** English only. No translation workflow needed.

**Phase 2:** 
1. **DeepL API** for machine translation draft of all Phase 2 locales (AR, BN, HI)
2. **Professional human review** for all three locales by native-speaking translators (critical for Arabic market)
3. **Strapi CSV export/import** as the translation exchange format (no TMS vendor in Phase 2)
4. Translation vendor TBD at Phase 2 planning sprint — shortlist: Phrase TMS, Lokalise, or direct freelance translators via Upwork/ProZ

**Phase 3+:**
1. **Translation Management System (TMS) evaluation** — Phrase TMS or Lokalise — based on Phase 2 volume experience
2. **DeepL API** for draft translation of new content (reduces cost by 60–70% vs human-only)
3. Human review by professional translators for all locales

---

## 3. Rationale

### Why DeepL (Not Google Translate) for Machine Translation

| | DeepL API | Google Cloud Translation |
|--|-----------|------------------------|
| Translation quality (EN→AR) | Superior | Good |
| Translation quality (EN→ZH) | Superior | Good |
| GDPR | EU company (German) | US company |
| Glossary support | **Yes** (custom terminology) | Yes |
| Formality control | **Yes** | Limited |
| Cost | $4.99/mo (500k chars) | $20/1M chars |

DeepL consistently outperforms Google Translate on technical content (product descriptions, spec terminology) in independent benchmarks. The Arabic translation quality difference is significant for TwinMOS's primary expansion market.

DeepL's **glossary feature** allows defining a custom glossary of TwinMOS terminology:
- "DDR5" → "DDR5" (not translated)
- "NVMe" → "NVMe" (not translated)
- "VOLTX" → "VOLTX" (brand, not translated)
- Product model numbers → unchanged

This prevents machine translation from incorrectly translating brand names and technical acronyms.

### Why Strapi CSV Export/Import (Phase 2, Not TMS)

**Strapi's `import-export-entries` plugin** supports CSV export of all content with locale columns. The workflow:
1. Marketing team exports products/pages to CSV from Strapi admin
2. CSV sent to translators (via email or shared drive)
3. Translators fill in AR/BN/HI columns
4. CSV re-imported to Strapi — locale versions created automatically

**Why not a TMS in Phase 2:**
- TMS setup costs time and money before Phase 2 content volume justifies it
- Phase 2 is 3 locales × ~150 pages = manageable with CSV workflow
- Phase 2 translation is a one-time content load (existing content), not continuous flow
- TMS evaluation at Phase 2 lets the team make an informed decision based on real volume

**When to adopt a TMS:**
- When new content is being created faster than CSV workflow can handle
- When translators need context (screenshots, glossary enforcement)
- When translation memory (re-use of previously translated segments) provides meaningful cost savings
- Target: Phase 3 if content volume exceeds 500 new segments/month

### Why Professional Human Review (Not Machine-Only) for Arabic

Arabic translation quality for consumer marketing content cannot rely on machine translation alone:
- **Gulf Arabic vs Modern Standard Arabic (MSA):** DeepL defaults to MSA; UAE consumers expect Gulf dialect nuances in marketing copy
- **Technical register:** Memory specifications ("DDR5 5200MHz CL36") need consistent translation conventions
- **Cultural adaptation:** Product benefit statements ("turbo-charged performance") require cultural equivalents

The recommended approach:
1. DeepL draft (~$0.01/word equivalent through API)
2. Professional native Arabic reviewer: ~$0.03–0.06/word (proofreading rate, not full translation)
3. Combined cost: ~$0.04–0.07/word vs full human translation at $0.12–0.20/word
4. Quality: Near-equivalent to full human translation at 50–60% lower cost

---

## 4. Alternatives Considered

### TMS Platforms

| Platform | Monthly Cost | Key Features | Decision |
|----------|-------------|-------------|---------|
| **Phrase TMS** | ~$200/mo (Starter) | Industry-standard; CAT tool; translation memory; API; DeepL integration | **Phase 3 candidate** |
| **Lokalise** | ~$120/mo (Essential) | Modern UI; API-first; GitHub/Strapi integration; good for developers | **Phase 3 candidate** |
| **Transifex** | ~$300/mo | Enterprise focus; overkill for current scale | Not suitable |
| **Crowdin** | $25–$250/mo | Developer-focused; GitHub integration; good free tier for OSS | **Phase 3 candidate** |
| **Weblate** | $0 self-hosted | Open source; self-hosted; developer UI | Phase 3 consideration |

### Translation Approaches

| Approach | Cost | Quality | Scalability |
|----------|------|---------|-------------|
| **Machine only (DeepL/Google)** | Very low | Adequate for product specs, not marketing | High |
| **Machine + human review (chosen)** | Medium | Good to very good | Medium-high |
| **Full human translation** | High | Highest | Low (slow turnaround) |
| **In-house bilingual staff** | Depends on headcount | Variable | Low (single person bottleneck) |

### Translation Vendor Types

| Type | Cost/word | Turnaround | Chosen? |
|------|-----------|-----------|---------|
| **Large agency** | $0.15–$0.25 | 5–10 days | No (cost) |
| **Boutique specialist (tech)** | $0.10–0.18 | 3–7 days | Phase 3 evaluation |
| **Freelance (ProZ, Upwork)** | $0.06–0.12 | 2–5 days | **Phase 2 approach** |
| **Community/crowdsource** | $0–0.03 | Unpredictable | Not suitable for commercial content |

---

## 5. Consequences

### Phase 2 Workflow

```
Strapi Content (EN)
  → Export CSV (strapi-plugin-import-export-entries)
  → DeepL API: auto-translate to AR/BN/HI draft
  → Freelance translators: review and correct AR (priority), BN, HI
  → Import corrected CSV back to Strapi
  → Strapi creates locale versions of all content
  → Astro rebuild generates /ar/, /bn/, /hi/ routes
```

**Estimated Phase 2 translation cost (one-time):**
- ~150 pages × 500 words avg = 75,000 words × 3 locales = 225,000 words
- DeepL API draft: ~$4.99/mo (within 500k char limit)
- Arabic review (freelance): 75,000 words × $0.06 = ~$4,500
- Bengali + Hindi review: 150,000 words × $0.04 = ~$6,000
- **Total Phase 2 translation budget:** ~$10,500–$12,000 (one-time)

### Ongoing Content Translation (Phase 3+)

New content (news articles, new products) will be translated on a rolling basis:
- New product launches: 3–5 pages × 8 locales = 24–40 translations
- News articles: 2–4 per month × 8 locales = 16–32 translations
- TMS adoption at Phase 3 enables translation memory (previously translated segments reused) reducing cost by 20–40%

### Positive
- DeepL glossary protects brand names and technical terms from mistranslation
- CSV workflow is understandable by non-technical marketing staff
- Phase 2 delay of TMS decision avoids over-engineering at Phase 2 content volume
- DeepL + human review cost is 50–60% lower than full human translation

### Negative / Trade-offs
- **No translation memory in Phase 2:** Similar content in multiple pages translated separately by freelancers. **Mitigation:** Provide translators with a style guide and approved glossary document
- **Manual CSV workflow is error-prone:** Import/export mistakes could corrupt locale versions. **Mitigation:** Test import in staging before production; backup Strapi database before bulk import
- **TMS vendor not decided:** Phrase, Lokalise, Crowdin all remain candidates. **This is intentional** — evaluation at Phase 2 is based on real volume data

---

## 6. Implementation Notes

**DeepL API integration (Phase 2 content prep script):**
```typescript
// scripts/translate-draft.ts
import * as deepl from 'deepl-node';

const translator = new deepl.Translator(process.env.DEEPL_API_KEY!);

// Custom glossary for TwinMOS technical terms
const glossary = await translator.createGlossary(
  'TwinMOS Technical Terms',
  'en', 'ar',
  new deepl.GlossaryEntries({ entries: {
    'DDR5': 'DDR5', 'NVMe': 'NVMe', 'VOLTX': 'VOLTX',
    'TwinMOS': 'TwinMOS', 'DRAM': 'DRAM', 'SSD': 'SSD',
  }}),
);

// Translate exported CSV content
const result = await translator.translateText(
  sourceTexts,
  'en', 'ar',
  { glossary, formality: 'default', tagHandling: 'html' }
);
```

**Strapi i18n locale setup (from `astro.config.ts` + Strapi):**
```typescript
// astro.config.ts — Phase 2 locale addition
i18n: {
  defaultLocale: 'en',
  locales: ['en', 'ar', 'bn', 'hi'],  // Phase 2
  routing: { prefixDefaultLocale: false },
},
```

**Phase 2 Strapi locale activation:**
```
Strapi Admin → Settings → Internationalization → Add locale
→ Arabic (ar) ✅
→ Bengali (bn) ✅  
→ Hindi (hi) ✅
```

---

## 7. Related ADRs

- ADR-009: i18n Strategy (Strapi + Astro hybrid i18n)
- ADR-005: MeiliSearch (Arabic tokenisation for search)
- Tech Stack §11: Internationalisation
