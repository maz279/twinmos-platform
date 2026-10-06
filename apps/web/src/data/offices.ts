// P3.5 (audit Tier-3, DRY): the five TwinMOS offices were copy-pasted across
// solutions.html (#footprint), contact.html ("Find your region") and
// where-to-buy.html (#offices) — three divergent copies of the same facts.
// Single source of truth here; each page renders its own card variant from
// these records. Values verified against the authoritative fact base
// (twinmos_mirror/authoritative_facts.md — the /contact office table).
export type Office = {
  flag: string;        // emoji flag chip
  role: string;        // short location role ("Taiwan", "Dubai", …)
  title: string;       // card headline ("HQ & R&D Center", …)
  entity: string;      // legal entity name on the address line
  address: string;     // full street address (single source — edit HERE only)
  note: string;        // one-line description for card variants that show one
};

export const OFFICES: Office[] = [
  {
    flag: '🇹🇼', role: 'Taiwan', title: 'HQ & R&D Center',
    entity: 'TwinMOS Technologies Ltd.',
    address: '5F.-5, No. 29, Sec. 1, Minsheng E. Rd., Zhongshan Dist., Taipei City 104619, Taiwan (R.O.C.)',
    note: 'Product design, validation and quality system — TÜV SÜD ISO 9001 certified since 2002.',
  },
  {
    flag: '🇦🇪', role: 'Dubai', title: 'International Office (MEA/CIS)',
    entity: 'TwinMOS Technologies',
    address: 'C-9, DAFZA (Dubai Airport Free Zone), Dubai, UAE',
    note: 'Coverage for the Middle East, Africa and CIS markets.',
  },
  {
    flag: '🇨🇳', role: 'China', title: 'Manufacturing Facility',
    entity: 'TwinMOS Technologies Co., Ltd.',
    address: 'No. 5, Tech Road, Dongguan, Guangdong, China',
    note: 'Volume production of modules and drives, alongside additional lines in Hsinchu and Xinjiang.',
  },
  {
    flag: '🇩🇪', role: 'Europe', title: 'European Office',
    entity: 'TwinMOS Europe GmbH',
    address: 'Schanzenstraße 23, 51063 Cologne, Germany',
    note: 'European channel, logistics and regional quoting.',
  },
  {
    flag: '🇺🇸', role: 'USA', title: 'US Office',
    entity: 'TwinMOS America Inc.',
    address: '12345 Silicon Valley Blvd, Suite 100, San Jose, CA 95123, USA',
    note: 'North-American presence and regional partner support.',
  },
];

/** Shared contact block (footer-style) — single source for email/hours. */
export const OFFICE_CONTACT = {
  email: 'sales@twinmos.com',
  phone: '+886-970-368-077',
  hours: 'Mon–Fri, 9am–5pm (Taipei)',
};

// ---- P3.5 render helpers: per-page card variants from the single source ----
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** where-to-buy #offices + contact "Find your region" variant (address cards). */
export function officeAddressCards(): string {
  return OFFICES.map((o) =>
    `<div class="card office"><span class="of-flag">${o.flag}</span><span class="of-role">${esc(o.role)}</span><b>${esc(o.title)}</b><address><i style="opacity:.75;font-style:normal">${esc(o.entity)}</i><br>${esc(o.address)}</address></div>`
  ).join('');
}

/** solutions #footprint variant (chip + headline + note cards). */
export function officeFootprintCards(): string {
  const PLACE: Record<string, string> = {
    Taiwan: 'Taipei, Taiwan', Dubai: 'Dubai, UAE (DAFZA)', China: 'Dongguan, China',
    Europe: 'Cologne, Germany', USA: 'San Jose, USA',
  };
  return OFFICES.map((o) => {
    const headline = o.role === 'Taiwan' ? 'Headquarters & R&D Center'
      : o.role === 'China' ? 'Manufacturing facility'
      : o.role === 'Dubai' ? 'International office — MEA'
      : o.role === 'USA' ? o.entity
      : o.entity;
    return `<div class="card card-pad"><span class="chip">${esc(PLACE[o.role] ?? o.role)}</span><b style="display:block;color:var(--ink);margin:10px 0 4px;font-size:15.5px">${esc(headline)}</b><span class="form-note">${esc(o.note)}</span></div>`;
  }).join('');
}
