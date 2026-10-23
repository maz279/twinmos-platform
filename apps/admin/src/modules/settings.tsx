// Settings — redirects manager + key/value settings (menus live under the
// 'menus' key) + locales list. Admin+ for redirects/settings; super_admin for
// locale activation (docs/04 RBAC).
// 0025: menus get a VISUAL builder (per-group label/URL rows with add/remove/
// reorder — the raw-JSON textarea stays as an escape hatch); redirects gain
// search, from-path format validation, a live "test" link and a count badge;
// locales gain search, an active count and the hreflang note.
import React, { useState } from 'react';
import { SETTINGS_GROUP_DEFAULTS } from '@twinmos/shared';
import MenuEditor from './menu-editor';
import { apiGet, apiSend, fmtDate } from '../api';
import { btn, btnGhost, Empty, Err, input, useAsync } from '../ui';

type Redirect = { id: number; from: string; to: string; code: number };
type Setting = { key: string; value: unknown; updatedAt: string };
type Locale = { code: string; name: string; dir: string; active: boolean };

export default function Settings({ canManage, isSuperAdmin }: { canManage: boolean; isSuperAdmin: boolean }) {
  const [tab, setTab] = useState<'site' | 'redirects' | 'menus' | 'locales'>('site');
  return (
    <div id="site-settings-module">
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1F2A37', letterSpacing: -0.2 }}>Settings</h1>
      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        {(['site', 'redirects', 'menus', 'locales'] as const).map((t) => (
          <button key={t} style={tab === t ? btn : btnGhost} onClick={() => setTab(t)}>
            {t === 'site' ? 'Site Settings' : t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      {!isSuperAdmin && (
        <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', color: '#92400E', padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13 }}>
          Read-only: changing site settings, redirects, menus or locales requires the <b>super admin</b> role.
        </div>
      )}
      {tab === 'site' && <SiteSettings canManage={isSuperAdmin} />}
      {tab === 'redirects' && <Redirects canManage={isSuperAdmin} />}
      {tab === 'menus' && <Menus canManage={isSuperAdmin} />}
      {tab === 'locales' && <Locales isSuperAdmin={isSuperAdmin} />}
    </div>
  );
}

// ---- typed site settings (T4.2.1, T4.2.2 / C1) ------------------------------

type GroupKey = 'site.brand' | 'site.contact' | 'site.social' | 'site.cookie' | 'site.whatsapp' | 'site.figures' | 'seo.defaults' | 'integrations';

function SiteSettings({ canManage }: { canManage: boolean }) {
  const [activeGroup, setActiveGroup] = useState<GroupKey>('site.figures');
  const { data, error: loadErr, loading, reload } = useAsync<{ items: Setting[] }>(() => apiGet('/admin/settings'), []);
  const [busy, setBusy] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [validationErr, setValidationErr] = useState<string | null>(null);

  // Form states for each typed group — initialised from the shared schema
  // defaults so the console never carries a second copy of the defaults.
  const [brand, setBrand] = useState({ ...SETTINGS_GROUP_DEFAULTS['site.brand'] });
  const [contact, setContact] = useState({ ...SETTINGS_GROUP_DEFAULTS['site.contact'] });
  const [social, setSocial] = useState({ ...SETTINGS_GROUP_DEFAULTS['site.social'] });
  const [cookie, setCookie] = useState({ ...SETTINGS_GROUP_DEFAULTS['site.cookie'] });
  const [whatsapp, setWhatsapp] = useState({ ...SETTINGS_GROUP_DEFAULTS['site.whatsapp'] });
  const [figures, setFigures] = useState({ ...SETTINGS_GROUP_DEFAULTS['site.figures'] });
  const [seo, setSeo] = useState({ ...SETTINGS_GROUP_DEFAULTS['seo.defaults'] });
  const [integrations, setIntegrations] = useState({ ...SETTINGS_GROUP_DEFAULTS['integrations'] });

  // Sync with loaded settings
  React.useEffect(() => {
    if (data?.items) {
      for (const item of data.items) {
        if (!item.value || typeof item.value !== 'object') continue;
        const val = item.value as any;
        if (item.key === 'site.brand') setBrand((p) => ({ ...p, ...val }));
        if (item.key === 'site.contact') setContact((p) => ({ ...p, ...val }));
        if (item.key === 'site.social') setSocial((p) => ({ ...p, ...val }));
        if (item.key === 'site.cookie') setCookie((p) => ({ ...p, ...val }));
        if (item.key === 'site.whatsapp') setWhatsapp((p) => ({ ...p, ...val }));
        if (item.key === 'site.figures') setFigures((p) => ({ ...p, ...val }));
        if (item.key === 'seo.defaults') setSeo((p) => ({ ...p, ...val }));
        if (item.key === 'integrations') setIntegrations((p) => ({ ...p, ...val }));
      }
    }
  }, [data]);

  const GROUPS: Array<{ key: GroupKey; label: string; desc: string }> = [
    { key: 'site.figures', label: 'Figures & N-Years', desc: 'Countries, founding year, product count (calculates dynamic "N years")' },
    { key: 'site.brand', label: 'Brand & Identity', desc: 'Company name, tagline, logo, favicon' },
    { key: 'site.social', label: 'Social Media', desc: 'Single source for footer and Organization Schema.org JSON-LD' },
    { key: 'site.whatsapp', label: 'WhatsApp Chat', desc: 'WhatsApp hotline with validated wa.me/<digits> format' },
    { key: 'site.contact', label: 'Contact Info', desc: 'Primary & departmental email addresses, telephone, address' },
    { key: 'site.cookie', label: 'Cookie Consent', desc: 'Consent modal text and privacy links' },
    { key: 'seo.defaults', label: 'SEO Defaults', desc: 'Default meta title, template, description and OG cover' },
    { key: 'integrations', label: 'Integrations', desc: 'Cloudflare Turnstile site key and analytics toggle' },
  ];

  function validate(group: GroupKey): string | null {
    if (group === 'site.brand') {
      if (!brand.name.trim()) return 'Brand name is required.';
      if (brand.foundingYear < 1900 || brand.foundingYear > 2100) return 'Founding year must be between 1900 and 2100.';
    }
    if (group === 'site.contact') {
      if (!contact.email.trim() || !contact.email.includes('@')) return 'A valid primary contact email is required.';
      if (!contact.phone.trim()) return 'Contact phone number is required.';
    }
    if (group === 'site.social') {
      for (const [net, url] of Object.entries(social)) {
        if (url && !/^https?:\/\//i.test(url.trim())) return `Invalid URL for ${net}: must begin with http:// or https://.`;
      }
    }
    if (group === 'site.whatsapp') {
      const digitsOnly = whatsapp.phoneNumber.trim().replace(/\D/g, '');
      if (digitsOnly.length < 7 || digitsOnly.length > 15) return 'Phone number must have between 7 and 15 digits.';
      if (!/^(https:\/\/)?wa\.me\/\d{7,15}$/.test(whatsapp.waUrl.trim())) {
        return 'WhatsApp URL must follow the wa.me/<digits> format (e.g. wa.me/886226590880).';
      }
    }
    if (group === 'site.figures') {
      if (!figures.countriesCount.trim()) return 'Countries count is required (e.g. "93+").';
      if (figures.foundingYear < 1900 || figures.foundingYear > 2100) return 'Founding year must be between 1900 and 2100.';
      if (figures.productCount < 1) return 'Product count must be at least 1.';
    }
    if (group === 'integrations') {
      if (!integrations.turnstileSiteKey.trim()) return 'Turnstile site key cannot be empty.';
    }
    return null;
  }

  async function saveGroup(groupKey: GroupKey) {
    const err = validate(groupKey);
    setValidationErr(err);
    if (err) return;

    setBusy(true);
    setSaveMsg(null);
    try {
      let payload: unknown;
      if (groupKey === 'site.brand') payload = brand;
      else if (groupKey === 'site.contact') payload = contact;
      else if (groupKey === 'site.social') payload = social;
      else if (groupKey === 'site.cookie') payload = cookie;
      else if (groupKey === 'site.whatsapp') payload = whatsapp;
      else if (groupKey === 'site.figures') payload = figures;
      else if (groupKey === 'seo.defaults') payload = seo;
      else if (groupKey === 'integrations') payload = integrations;

      await apiSend('PUT', '/admin/settings', { key: groupKey, value: payload });
      setSaveMsg(`Saved "${groupKey}" successfully! Cache invalidated under 'site' tag.`);
      reload();
    } catch (e: any) {
      setValidationErr(e?.detail || e?.message || 'Failed to save setting group');
    } finally {
      setBusy(false);
    }
  }

  const currentYear = new Date().getFullYear();
  const computedYears = Math.max(1, currentYear - (figures.foundingYear || 1998));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, marginTop: 12 }}>
      {/* Group Navigation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {GROUPS.map((g) => (
          <button
            key={g.key}
            style={{
              ...(activeGroup === g.key ? btn : btnGhost),
              textAlign: 'left',
              padding: '10px 12px',
              fontSize: 13,
            }}
            onClick={() => {
              setActiveGroup(g.key);
              setValidationErr(null);
              setSaveMsg(null);
            }}
          >
            <div style={{ fontWeight: 700 }}>{g.label}</div>
            <div style={{ fontSize: 11, opacity: 0.8, fontWeight: 400 }}>{g.key}</div>
          </button>
        ))}
      </div>

      {/* Group Editor Panel */}
      <div style={{ border: '1px solid #E6EBF1', borderRadius: 12, background: '#fff', padding: 20 }}>
        {loadErr ? <Err error={loadErr} /> : null}
        {loading && <p>Loading settings…</p>}

        {validationErr && (
          <div style={{ background: '#FDE8E8', border: '1px solid #F8B4B4', color: '#9B1C1C', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
            <b>Validation Error:</b> {validationErr}
          </div>
        )}

        {saveMsg && (
          <div style={{ background: '#DEF7EC', border: '1px solid #31C48D', color: '#03543F', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
            ✓ {saveMsg}
          </div>
        )}

        {/* 1. site.figures */}
        {activeGroup === 'site.figures' && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 4px', color: '#1F2A37' }}>Key Figures & Dynamic Years</h2>
            <p style={{ fontSize: 12.5, color: '#66748A', margin: '0 0 16px' }}>
              Centralized corporate statistics. The founding year computes every "N years" claim dynamically across headers, footers and SEO Organization schema.
            </p>

            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 13, color: '#166534' }}>
              <b>Live Dynamic Preview:</b> Founded in <b>{figures.foundingYear}</b> &rarr; <b>{computedYears} years</b> in business ("{computedYears}-year").
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Founding Year</label>
                <input
                  type="number"
                  aria-label="Founding Year"
                  style={{ ...input, width: '100%' }}
                  value={figures.foundingYear}
                  onChange={(e) => setFigures({ ...figures, foundingYear: Number(e.target.value) })}
                  disabled={!canManage}
                />
                <span style={{ fontSize: 11, color: '#66748A' }}>Default 1998</span>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Countries Presence</label>
                <input
                  type="text"
                  aria-label="Countries Presence"
                  style={{ ...input, width: '100%' }}
                  value={figures.countriesCount}
                  onChange={(e) => setFigures({ ...figures, countriesCount: e.target.value })}
                  disabled={!canManage}
                />
                <span style={{ fontSize: 11, color: '#66748A' }}>e.g. "93+"</span>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Total Products Count (Fixes "45" vs "39")</label>
                <input
                  type="number"
                  aria-label="Total Products Count"
                  style={{ ...input, width: '100%' }}
                  value={figures.productCount}
                  onChange={(e) => setFigures({ ...figures, productCount: Number(e.target.value) })}
                  disabled={!canManage}
                />
                <span style={{ fontSize: 11, color: '#66748A' }}>Catalog truth: {figures.productCount} active products</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. site.brand */}
        {activeGroup === 'site.brand' && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 4px', color: '#1F2A37' }}>Brand & Identity</h2>
            <p style={{ fontSize: 12.5, color: '#66748A', margin: '0 0 16px' }}>Corporate branding, logos and standard descriptors.</p>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Brand Name</label>
                <input aria-label="Brand Name" style={{ ...input, width: '100%' }} value={brand.name} onChange={(e) => setBrand({ ...brand, name: e.target.value })} disabled={!canManage} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Tagline</label>
                <input aria-label="Tagline" style={{ ...input, width: '100%' }} value={brand.tagline} onChange={(e) => setBrand({ ...brand, tagline: e.target.value })} disabled={!canManage} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Logo Asset Path</label>
                <input aria-label="Logo Asset Path" style={{ ...input, width: '100%' }} value={brand.logoUrl} onChange={(e) => setBrand({ ...brand, logoUrl: e.target.value })} disabled={!canManage} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Favicon Asset Path</label>
                <input aria-label="Favicon Asset Path" style={{ ...input, width: '100%' }} value={brand.faviconUrl} onChange={(e) => setBrand({ ...brand, faviconUrl: e.target.value })} disabled={!canManage} />
              </div>
            </div>
          </div>
        )}

        {/* 3. site.social */}
        {activeGroup === 'site.social' && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 4px', color: '#1F2A37' }}>Social Media Links</h2>
            <p style={{ fontSize: 12.5, color: '#66748A', margin: '0 0 16px' }}>
              Single source of truth: feeds both the interactive footer links and the Organization Schema.org sameAs JSON-LD graph.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Facebook</label>
                <input aria-label="Facebook URL" style={{ ...input, width: '100%' }} value={social.facebook} onChange={(e) => setSocial({ ...social, facebook: e.target.value })} disabled={!canManage} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Instagram</label>
                <input aria-label="Instagram URL" style={{ ...input, width: '100%' }} value={social.instagram} onChange={(e) => setSocial({ ...social, instagram: e.target.value })} disabled={!canManage} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>LinkedIn</label>
                <input aria-label="LinkedIn URL" style={{ ...input, width: '100%' }} value={social.linkedin} onChange={(e) => setSocial({ ...social, linkedin: e.target.value })} disabled={!canManage} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>X (formerly Twitter)</label>
                <input aria-label="X Profile URL" style={{ ...input, width: '100%' }} value={social.x} onChange={(e) => setSocial({ ...social, x: e.target.value })} disabled={!canManage} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>YouTube</label>
                <input aria-label="YouTube Channel URL" style={{ ...input, width: '100%' }} value={social.youtube} onChange={(e) => setSocial({ ...social, youtube: e.target.value })} disabled={!canManage} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Pinterest</label>
                <input aria-label="Pinterest URL" style={{ ...input, width: '100%' }} value={social.pinterest} onChange={(e) => setSocial({ ...social, pinterest: e.target.value })} disabled={!canManage} />
              </div>
            </div>
          </div>
        )}

        {/* 4. site.whatsapp */}
        {activeGroup === 'site.whatsapp' && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 4px', color: '#1F2A37' }}>WhatsApp Business Chat</h2>
            <p style={{ fontSize: 12.5, color: '#66748A', margin: '0 0 16px' }}>
              WhatsApp hotline configuration. Strictly enforces the <code>wa.me/&lt;digits&gt;</code> format.
            </p>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Phone Digits (7–15 numbers)</label>
                <input
                  aria-label="WhatsApp Phone Digits"
                  style={{ ...input, width: '100%' }}
                  value={whatsapp.phoneNumber}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '');
                    setWhatsapp({
                      ...whatsapp,
                      phoneNumber: clean,
                      waUrl: `https://wa.me/${clean}`,
                    });
                  }}
                  disabled={!canManage}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Direct WhatsApp URL (wa.me/&lt;digits&gt;)</label>
                <input aria-label="Direct WhatsApp URL" style={{ ...input, width: '100%' }} value={whatsapp.waUrl} onChange={(e) => setWhatsapp({ ...whatsapp, waUrl: e.target.value })} disabled={!canManage} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Default Chat Greeting Message</label>
                <input aria-label="Default Chat Greeting Message" style={{ ...input, width: '100%' }} value={whatsapp.defaultMessage} onChange={(e) => setWhatsapp({ ...whatsapp, defaultMessage: e.target.value })} disabled={!canManage} />
              </div>
            </div>
          </div>
        )}

        {/* 5. site.contact */}
        {activeGroup === 'site.contact' && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 4px', color: '#1F2A37' }}>Corporate Contact Information</h2>
            <p style={{ fontSize: 12.5, color: '#66748A', margin: '0 0 16px' }}>Official telephone, emails and physical corporate addresses.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Primary Email</label>
                <input aria-label="Primary Email" style={{ ...input, width: '100%' }} value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} disabled={!canManage} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Support Email</label>
                <input aria-label="Support Email" style={{ ...input, width: '100%' }} value={contact.supportEmail} onChange={(e) => setContact({ ...contact, supportEmail: e.target.value })} disabled={!canManage} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Sales Email</label>
                <input aria-label="Sales Email" style={{ ...input, width: '100%' }} value={contact.salesEmail} onChange={(e) => setContact({ ...contact, salesEmail: e.target.value })} disabled={!canManage} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Phone Number</label>
                <input aria-label="Phone Number" style={{ ...input, width: '100%' }} value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} disabled={!canManage} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Address</label>
                <input aria-label="Physical Address" style={{ ...input, width: '100%' }} value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} disabled={!canManage} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Country</label>
                <input aria-label="Country" style={{ ...input, width: '100%' }} value={contact.country ?? ''} onChange={(e) => setContact({ ...contact, country: e.target.value })} disabled={!canManage} />
              </div>
            </div>
          </div>
        )}

        {/* 6. site.cookie */}
        {activeGroup === 'site.cookie' && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 4px', color: '#1F2A37' }}>Cookie Policy & Consent Banner</h2>
            <p style={{ fontSize: 12.5, color: '#66748A', margin: '0 0 16px' }}>GDPR and ePrivacy consent banner configuration.</p>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Banner Title</label>
                <input aria-label="Cookie Banner Title" style={{ ...input, width: '100%' }} value={cookie.title} onChange={(e) => setCookie({ ...cookie, title: e.target.value })} disabled={!canManage} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Banner Description</label>
                <textarea aria-label="Cookie Banner Description" style={{ ...input, width: '100%', minHeight: 70 }} value={cookie.description} onChange={(e) => setCookie({ ...cookie, description: e.target.value })} disabled={!canManage} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Cookie Policy Page URL</label>
                <input aria-label="Cookie Policy Page URL" style={{ ...input, width: '100%' }} value={cookie.policyUrl} onChange={(e) => setCookie({ ...cookie, policyUrl: e.target.value })} disabled={!canManage} />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" aria-label="Default to essential cookies only" checked={cookie.essentialOnlyDefault} onChange={(e) => setCookie({ ...cookie, essentialOnlyDefault: e.target.checked })} disabled={!canManage} />
                  Default to essential cookies only (Privacy-by-default)
                </label>
              </div>
            </div>
          </div>
        )}

        {/* 7. seo.defaults */}
        {activeGroup === 'seo.defaults' && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 4px', color: '#1F2A37' }}>SEO Defaults</h2>
            <p style={{ fontSize: 12.5, color: '#66748A', margin: '0 0 16px' }}>Global metadata fallback for pages without custom SEO overrides.</p>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Title Template (%s)</label>
                <input aria-label="Title Template" style={{ ...input, width: '100%' }} value={seo.titleTemplate} onChange={(e) => setSeo({ ...seo, titleTemplate: e.target.value })} disabled={!canManage} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Default Page Title</label>
                <input aria-label="Default Page Title" style={{ ...input, width: '100%' }} value={seo.defaultTitle} onChange={(e) => setSeo({ ...seo, defaultTitle: e.target.value })} disabled={!canManage} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Default Description</label>
                <textarea aria-label="Default Description" style={{ ...input, width: '100%', minHeight: 70 }} value={seo.defaultDescription} onChange={(e) => setSeo({ ...seo, defaultDescription: e.target.value })} disabled={!canManage} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Default OpenGraph Cover Image URL</label>
                <input aria-label="Default OpenGraph Cover Image URL" style={{ ...input, width: '100%' }} value={seo.defaultOgImage} onChange={(e) => setSeo({ ...seo, defaultOgImage: e.target.value })} disabled={!canManage} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Default Robots Directive</label>
                <input aria-label="Default Robots Directive" style={{ ...input, width: '100%' }} value={seo.defaultRobots} onChange={(e) => setSeo({ ...seo, defaultRobots: e.target.value })} disabled={!canManage} />
              </div>
            </div>
          </div>
        )}

        {/* 8. integrations */}
        {activeGroup === 'integrations' && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 4px', color: '#1F2A37' }}>External Integrations</h2>
            <p style={{ fontSize: 12.5, color: '#66748A', margin: '0 0 16px' }}>Cloudflare Turnstile bot protection and web analytics switches.</p>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Cloudflare Turnstile Site Key</label>
                <input aria-label="Cloudflare Turnstile Site Key" style={{ ...input, width: '100%' }} value={integrations.turnstileSiteKey} onChange={(e) => setIntegrations({ ...integrations, turnstileSiteKey: e.target.value })} disabled={!canManage} />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" aria-label="Enable Analytics Tracking" checked={integrations.analyticsEnabled} onChange={(e) => setIntegrations({ ...integrations, analyticsEnabled: e.target.checked })} disabled={!canManage} />
                  Enable Analytics Tracking
                </label>
              </div>
              {integrations.analyticsEnabled && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Google Analytics Measurement ID</label>
                  <input aria-label="Google Analytics Measurement ID" style={{ ...input, width: '100%' }} placeholder="G-XXXXXXXXXX" value={integrations.googleAnalyticsId} onChange={(e) => setIntegrations({ ...integrations, googleAnalyticsId: e.target.value })} disabled={!canManage} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20, paddingTop: 14, borderTop: '1px solid #E6EBF1' }}>
          <button style={btn} disabled={busy || !canManage} onClick={() => saveGroup(activeGroup)}>
            {busy ? 'Saving…' : `Save ${GROUPS.find((g) => g.key === activeGroup)?.label}`}
          </button>
          <button style={btnGhost} disabled={busy} onClick={() => reload()}>
            Reset to Server
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- redirects ------------------------------------------------------------

function Redirects({ canManage }: { canManage: boolean }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [code, setCode] = useState('301');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [q, setQ] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const { data, error: loadError, loading, reload } = useAsync<{ items: Redirect[] }>(() => apiGet('/admin/redirects'), []);

  const items = (data?.items ?? []).filter((r) =>
    !q.trim() || r.from.toLowerCase().includes(q.trim().toLowerCase()) || r.to.toLowerCase().includes(q.trim().toLowerCase()));

  function validate(): string | null {
    if (!from.startsWith('/')) return '"From" must start with "/" (a site-relative path).';
    if (!to.startsWith('/') && !/^https?:\/\//.test(to)) return '"To" must start with "/" or be a full http(s) URL.';
    if (from === to) return 'Source and destination are the same.';
    return null;
  }

  async function add() {
    const v = validate();
    setFormError(v);
    if (v) return;
    setBusy(true); setError(null);
    try {
      await apiSend('POST', '/admin/redirects', { from: from.trim(), to: to.trim(), code: Number(code) });
      setFrom(''); setTo(''); reload();
    } catch (e) { setError(e); } finally { setBusy(false); }
  }
  async function remove(id: number) {
    setBusy(true); setError(null);
    try { await apiSend('DELETE', `/admin/redirects/${id}`, {}); reload(); }
    catch (e) { setError(e); } finally { setBusy(false); }
  }

  const WEB = (import.meta.env.VITE_API_URL ?? '').replace(/\/api\/v1$/, '') || '';
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '0 0 10px', flexWrap: 'wrap' }}>
        <input style={{ ...input, width: 220 }} placeholder="Search from / to…" value={q} onChange={(e) => setQ(e.target.value)} />
        <span style={{ fontSize: 12.5, color: '#66748A' }}>{data?.items.length ?? 0} redirect{(data?.items.length ?? 0) === 1 ? '' : 's'} configured</span>
      </div>
      {canManage && (
        <div style={{ display: 'flex', gap: 8, margin: '10px 0', flexWrap: 'wrap' }}>
          <input style={input} placeholder="/old-path" value={from} onChange={(e) => { setFrom(e.target.value); setFormError(null); }} />
          <input style={{ ...input, flex: '1 1 220px' }} placeholder="/new-path or https://…" value={to} onChange={(e) => { setTo(e.target.value); setFormError(null); }} />
          <select style={input} value={code} onChange={(e) => setCode(e.target.value)} title="301 permanent · 302 temporary · 308 permanent, keep method">
            <option>301</option><option>302</option><option>308</option>
          </select>
          <button style={btn} disabled={busy || !from || !to} onClick={add}>Add</button>
        </div>
      )}
      {formError && <p role="alert" style={{ color: '#C2453C', background: '#FDECEA', borderRadius: 8, padding: '6px 10px', fontSize: 13 }}>{formError}</p>}
      {error ? <Err error={error} /> : null}
      {loadError ? <Err error={loadError} /> : loading ? <p>Loading…</p> : data ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead><tr>{['From', 'To', 'Code', 'Hits', ''].map((h, i) => <th key={`${h || 'col'}-${i}`} style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid #E6EBF1' }}>{h}</th>)}</tr></thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id}>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7', fontFamily: 'ui-monospace, monospace', fontSize: 12.5 }}>{r.from}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7', fontFamily: 'ui-monospace, monospace', fontSize: 12.5 }}>{r.to}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7' }}><b>{r.code}</b></td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7' }}>
                  <a href={WEB + r.from} target="_blank" rel="noopener" style={{ fontSize: 12, color: '#0F766E' }} title="Open the source path and watch it redirect">test ↗</a>
                </td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7' }}>
                  {canManage && <button style={btnGhost} disabled={busy} onClick={() => remove(r.id)}>Delete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      {data && items.length === 0 && <Empty text={q ? 'No redirects match.' : 'No redirects configured.'} />}
    </div>
  );
}

// ---- menus: real nav_menu tree editor (T4.7.6) ---------------------------

function Menus({ canManage }: { canManage: boolean }) {
  return <MenuEditor canManage={canManage} />;
}

// ---- locales ---------------------------------------------------------------

function Locales({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const [q, setQ] = useState('');
  const { data, error, loading, reload } = useAsync<{ items: Locale[] }>(() => apiGet('/admin/locales'), []);
  const [busy, setBusy] = useState(false);
  async function toggle(code: string, active: boolean) {
    setBusy(true);
    try { await apiSend('PATCH', `/admin/locales/${code}`, { active }); reload(); }
    finally { setBusy(false); }
  }
  const items = (data?.items ?? []).filter((l) =>
    !q.trim() || l.code.includes(q.trim().toLowerCase()) || l.name.toLowerCase().includes(q.trim().toLowerCase()));
  const active = (data?.items ?? []).filter((l) => l.active).length;
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '0 0 10px', flexWrap: 'wrap' }}>
        <input style={{ ...input, width: 200 }} placeholder="Search code or name…" value={q} onChange={(e) => setQ(e.target.value)} />
        <span style={{ fontSize: 12.5, color: '#66748A' }}>
          <b>{active}</b> of {data?.items.length ?? 0} active — active locales receive hreflang alternates in the site build
          {(data?.items ?? []).some((l) => l.dir === 'rtl' && l.active) ? ' (includes RTL — verified in the P4 parity audit)' : ''}.
        </span>
      </div>
      {error ? <Err error={error} /> : loading ? <p>Loading…</p> : data ? (
        <table style={{ borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead><tr>{['Code', 'Name', 'Direction', 'Active', ''].map((h, i) => <th key={`${h || 'col'}-${i}`} style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid #E6EBF1' }}>{h}</th>)}</tr></thead>
          <tbody>
            {items.map((l) => (
              <tr key={l.code} style={{ background: l.active ? undefined : '#FAFBFC' }}>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7' }}><b>{l.code}</b></td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7' }}>{l.name}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7' }}>{l.dir === 'rtl' ? <b style={{ color: '#B45309' }}>rtl</b> : 'ltr'}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7' }}>{l.active ? '✓' : '—'}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7' }}>
                  {isSuperAdmin && <button style={btnGhost} disabled={busy} onClick={() => toggle(l.code, !l.active)}>{l.active ? 'Deactivate' : 'Activate'}</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      {data && items.length === 0 && <Empty text="No locales match." />}
    </div>
  );
}
