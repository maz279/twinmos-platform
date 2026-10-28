# Content snapshot — truth corrections

Applied by `tooling/content/clean-snapshot.mjs` against twinmos_mirror/authoritative_facts.md (www.twinmos.com crawl 2026-09-23).
The content owner reviews this list before go-live; withheld rows stay in the snapshot as drafts where the table supports it.

| Table | Change | Reason |
|---|---|---|
| article | cleared approver on 98 row(s) | approver names are invented personas, not real sign-offs |
| distributor | cleared approver on 35 row(s) | approver names are invented personas, not real sign-offs |
| faq | cleared approver on 197 row(s) | approver names are invented personas, not real sign-offs |
| glossary_term | cleared approver on 113 row(s) | approver names are invented personas, not real sign-offs |
| office | cleared approver on 5 row(s) | approver names are invented personas, not real sign-offs |
| page | cleared approver on 28 row(s) | approver names are invented personas, not real sign-offs |
| product | cleared approver on 39 row(s) | approver names are invented personas, not real sign-offs |
| office | replaced 10 rows with the 5 offices listed on twinmos.com | removed Dhaka (prohibited contamination), Hong Kong (not an office), and wrong Dubai/Taipei/San Jose/Cologne addresses — twinmos_mirror/authoritative_facts.md (www.twinmos.com crawl 2026-09-23) |
| office | USA office published exactly as on twinmos.com | the address (12345 Silicon Valley Blvd) reads like a placeholder on the live site itself — listed in CLAIMS_REVIEW.md for the content owner |
| testimonial | unpublished 3 testimonial(s) | quoted people are not verifiable; publishing invented endorsements is prohibited (roadmap §2.3 rule 8) |
| job_posting | unpublished 3 posting(s) | roles and salary bands have no source; HR must publish real openings |
| product | VOLTX-DDR5-U-DIMM-FOR-DESKTOP: removed price 89.99 | price not published on twinmos.com |
| product | VOLTX-DDR5-SO-DIMM-FOR-LAPTOP: removed price 89.99 | price not published on twinmos.com |
| product | VOLTX-RGB-DDR5-U-DIMM-FOR-DESKTOP: removed price 89.99 | price not published on twinmos.com |
| product | 3200MHZ-DDR4-SO-DIMM-FOR-LAPTOP: removed short spec "Part No." | label fragment scraped as a spec |
| product | DDR3-1600MHZ-SO-DIMM-FOR-NOTEBOOK: removed warranty "E2E warranty probe" | e2e test residue |
| distributor | removed 7 named companies (Redington Gulf, ASBIS Middle East, CompuMe Egypt, Supertron Infotech, Synnex Technology, Bluechip Computer, ASI Corporation) | no named distributor appears on twinmos.com; Supertron is explicitly flagged unverified in the fact base |
| marketplace_listing | removed 4 listing(s) | store URLs were never verified (verified_at null) |
| setting | site.contact phone/email | +886 2 2659 0880 / info@ are not on twinmos.com — twinmos_mirror/authoritative_facts.md (www.twinmos.com crawl 2026-09-23) |
| setting | site.cookie.policyUrl → /legal?tab=privacy | old anchor matched no policy tab |
| setting | site.whatsapp number | twinmos.com WhatsApp link uses +886 970 368 077 |
| setting | integrations.turnstileSiteKey cleared | placeholder key 0x4AAAAAAAx disabled the captcha widget; the deploy-time key (PUBLIC_TURNSTILE_SITE_KEY) applies instead |
| setting | site.figures.productCount = published catalogue size | was 40 against a 39-SKU catalogue |
| policy_document | privacy-policy: cleared legal approval (approver "H. Lin, Legal Counsel") | sign-off by a person who does not exist in the client records; Terms (105 chars) and Warranty (124 chars) bodies are one-sentence stubs |
| policy_document | privacy: cleared legal approval (approver "H. Lin, Legal Counsel") | sign-off by a person who does not exist in the client records; Terms (105 chars) and Warranty (124 chars) bodies are one-sentence stubs |
| policy_document | privacy: archived duplicate | duplicate of privacy-policy |
| policy_document | terms-of-service: cleared legal approval (approver "H. Lin, Legal Counsel") | sign-off by a person who does not exist in the client records; Terms (105 chars) and Warranty (124 chars) bodies are one-sentence stubs |
| policy_document | warranty-policy: cleared legal approval (approver "H. Lin, Legal Counsel") | sign-off by a person who does not exist in the client records; Terms (105 chars) and Warranty (124 chars) bodies are one-sentence stubs |
| policy_document | warranty: cleared legal approval (approver "H. Lin, Legal Counsel") | sign-off by a person who does not exist in the client records; Terms (105 chars) and Warranty (124 chars) bodies are one-sentence stubs |
| policy_document | warranty: archived duplicate | duplicate of warranty-policy |
| nav_item | added "Warranty registration" → /support/warranty next to each "Warranty & RMA" link (3 menus) | entry point for the warranty registration & lookup feature (BRD §F8.3) |
