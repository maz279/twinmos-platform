# Reconciles findings.jsonl (as logged when found) with the final state verified
# in iterations 1-5. Writes evidence/zt-2026-10-28/findings-final.json and prints
# the markdown appendix for docs/reports/ZERO_TRUST_AUDIT_2026-10-28.md.
import io
import json
import re

E = 'evidence/zt-2026-10-28/'
V = {  # id: (final status, how it was verified)
    '001': ('fixed', 'clean-clone typecheck/build green (iter 4, 5)'),
    '002': ('fixed', 'clean-clone web build without API (iter 4, 5)'),
    '003': ('fixed', 'nginx -t + edge running in lab (iter 1-5)'),
    '004': ('fixed', 'compose content job loads the reviewed snapshot (lab iter 1-5)'),
    '005': ('OPEN', 'no GitHub credentials on this host: branch not pushed, CI never ran on GitHub'),
    '006': ('fixed', 'records withdrawn; report-lint fails on invented sign-offs / premature events'),
    '007': ('fixed', 'prod overlay edge starts in lab (iter 1-5)'),
    '008': ('fixed', 'per-file cert mounts, lab edge (iter 1-5)'),
    '009': ('fixed', 'prod overlay edge starts in lab (iter 1-5)'),
    '010': ('fixed', 'tools OPS-01'),
    '011': ('fixed', 'admin SPA served by the edge; provision + CMS checks drive it (iter 1-5)'),
    '012': ('fixed', 'loopback healthz; container healthy'),
    '013': ('fixed', 'provision: partner invite, verify, set-password (iter 1-5)'),
    '014': ('fixed', 'p1-fixpack / p1-security-governance / security-pack tests'),
    '015': ('fixed', 'API 659/659 in a clean clone (iter 4, 5)'),
    '016': ('fixed', '4 moderate advisories are dev-only (drizzle-kit/esbuild) and absent from the API image'),
    '017': ('fixed', 'snapshot corrections (apps/api/content/CORRECTIONS.md)'),
    '018': ('fixed', 'testimonials unpublished'),
    '019': ('fixed', 'job postings unpublished'),
    '020': ('fixed', 'prices + test residue removed; catalog-data.js regenerated'),
    '021': ('fixed', 'contact data = fact base'),
    '022': ('fixed', 'persona approvers cleared; republish needs a real approver (CMS-07a)'),
    '023': ('fixed', 'named distributors removed'),
    '024': ('fixed', 'seed re-run leaves MFA/password (iter-0 before/after; seed.ts)'),
    '025': ('fixed', 'tools RMA checks (POST /rma/track, public timeline only)'),
    '026': ('fixed', 'tools RMA rate-limit check'),
    '027': ('fixed', 'tools RMA-02/02b + warranty.e2e'),
    '028': ('fixed', 'tools FORM checks; API tests'),
    '029': ('fixed', 'tools FORM-06; p2 test'),
    '030': ('fixed', 'tools SN checks'),
    '031': ('fixed', 'tools compatibility check'),
    '032': ('fixed', 'tools search cap check'),
    '033': ('fixed', 'tools NL checks; phase-d tests'),
    '034': ('fixed', 'tools ART checks'),
    '035': ('fixed', 'crawl: 0 link issues (iter 2-5)'),
    '036': ('fixed (content sign-off open)', 'rebuilt 175/230 blocks from the approved prototype; the rest are data-bound widgets'),
    '037': ('fixed', 'snapshot'),
    '038': ('partly: news empty until authored', 'fallback news removed; news_post is empty'),
    '039': ('fixed', 'CMS-02 seeded page saves'),
    '040': ('fixed', 'renderer + crawl'),
    '041': ('fixed (sign-off open)', 'claims removed; 73 figures listed in CLAIMS_REVIEW.md for the content owner'),
    '042': ('fixed', 'serial check form + tools SN'),
    '043': ('fixed', 'fixtures removed'),
    '044': ('OPEN', 'localisation not delivered (8 locales inactive); live ms62 suites fail honestly'),
    '045': ('fixed', 'tools SN-04'),
    '046': ('fixed', 'tools WTY-01/02; warranty.e2e'),
    '047': ('fixed', 'trusted client IP + registration flow'),
    '048': ('fixed', 'tools NL checks'),
    '049': ('fixed', 'block contract (node check)'),
    '050': ('fixed', 'editor+ only'),
    '051': ('fixed', 'tools WTY-03b; shared helpers'),
    '052': ('fixed', 'formType per page; RMA through the site form path'),
    '053': ('fixed', 'partner sign-in form'),
    '054': ('fixed', 'legal tabs + ?tab='),
    '055': ('OPEN', 'no legally approved policy texts (Terms/Warranty are stubs): needs counsel'),
    '056': ('fixed', 'sanitised bodies; jsonForScript'),
    '057': ('fixed', 'FORM_BLOCK_TYPES'),
    '058': ('fixed', 'single CSP; POST forms; Turnstile reset'),
    '059': ('fixed', 'inferFields; invite warning'),
    '060': ('fixed', 'p5/p13 tests on clientIp'),
    '061': ('fixed', 'ms65 test'),
    '062': ('fixed', 'ms64 runs in a clean clone'),
    '063': ('fixed', 'gated on TEST_WEB_ORIGIN'),
    '064': ('fixed', 'harness corrected'),
    '065': ('fixed', 'tools WTY-02; warranty.e2e'),
    '066': ('mitigated: business decision open', "disputes alert support; proof-of-purchase approval is the client's call"),
    '067': ('fixed', 'warranty.e2e'),
    '068': ('fixed', 'partial unique index; warranty.e2e'),
    '069': ('fixed', 'migration 0035'),
    '070': ('fixed', 'one transaction'),
    '071': ('fixed', 'mail sent after the answer'),
    '072': ('fixed', 'single-use vote token'),
    '073': ('fixed', 'analytics / referrer / Turnstile reset'),
    '074': ('fixed', 'warranty.e2e SN country'),
    '075': ('fixed', 'serial delete'),
    '076': ('fixed', 'DSAR covers registrations'),
    '077': ('fixed', 'MEDIA-01 failed on the pre-fix lab (iter-3-plant), passes iter 4-5'),
    '078': ('fixed', 'backup + restore --drill on the PG18 lab: PASS (iter 4, 5)'),
    '079': ('partly: RPO 24 h', 'literal key removed; WAL archiving not configured'),
    '080': ('fixed', 'security-pack S-13'),
    '081': ('fixed', 'seed logic'),
    '082': ('fixed: unverified until pushed', 'workflow rewritten; it only runs on GitHub'),
    '083': ('OPEN', 'needs a zone-level custom AOP certificate in Cloudflare'),
    '084': ('fixed', 'nginx -t'),
    '085': ('accepted', 'base compose only'),
    '086': ('fixed', 'NL-10 leaked on the ea175dc lab (iter-4-plant-nl10.txt); passes iter 5'),
    '087': ('fixed', 'PG18 migration test'),
    '088': ('fixed', 'renderer guard + nested editor'),
    '089': ('fixed', 'load-content'),
    '090': ('fixed', 'node validator check'),
    '091': ('OPEN', 'cutover gate: import the factory serial registry'),
    '092': ('fixed (sign-off open)', 'claim filter rules; snapshot re-applied to the lab and re-crawled (iter-5b); owner confirms per-product terms'),
}

rows = [json.loads(l) for l in io.open(E + 'findings.jsonl', encoding='utf-8') if l.strip()]
final = []
for r in rows:
    st, how = V[r['id'][3:]]
    final.append({**r, 'sev': r.get('sev') or r.get('severity'), 'final': st, 'verified_by': how})
io.open(E + 'findings-final.json', 'w', encoding='utf-8', newline='\n').write(json.dumps(final, indent=1, ensure_ascii=False) + '\n')

out = ['| ID | Sev | Finding | Final status | Verified by |', '|---|---|---|---|---|']
for f in final:
    # the report is linted like any other: name no invented persona, even to quote it
    t = re.sub(r'\b(Victoria Sterling|Tariq Al-Mansoor|Tariq Al-Hashimi|Marcus Brody|Elena Rostova|David Vance)\b', 'an invented persona', f['title']).replace('|', '/')
    t = t if len(t) <= 150 else t[:147] + '…'
    out.append(f"| {f['id']} | {f['sev']} | {t} | {f['final']} | {f['verified_by']} |")
print('\n'.join(out))
