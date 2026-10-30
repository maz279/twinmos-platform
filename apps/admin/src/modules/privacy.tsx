// Privacy operations console (MS6.1 / T6.1.1 - T6.1.5 / PRIV-01 / Z-26).
// Exclusively accessible to super_admin.
// Provides interactive operations for:
// 1. Complete DSAR data export across 10 tables (T6.1.2)
// 2. Verified erasure & anonymization leaving zero PII in audit logs (T6.1.3, Z-26)
// 3. Multi-table automated retention sweeps that fail loudly on SQL errors (T6.1.1, RET-01)
import React, { useState } from 'react';
import { useDialogA11y } from '../dialog-a11y';
import { apiSend, fmtDate, ApiError } from '../api';
import { btn, btnGhost, card, Empty, Err, input, Table, td, INK, MUTED, TEAL, TEAL_DK, RED, GREEN, LINE, PAGE } from '../ui';
import { useToast } from '../toast';
import type { ModProps } from '../nav';

type Tab = 'export' | 'erase' | 'retention';

interface DsarExportData {
  email: string;
  targetHash: string;
  exportedAt: string;
  records: {
    users: any[];
    sessions: any[];
    subscribers: any[];
    submissions: any[];
    formNotes: any[];
    applications: any[];
    rmas: any[];
    rmaEvents: any[];
    partnerOrgs: any[];
    partnerMembers: any[];
    auditLogs: any[];
  };
}

interface DsarEraseSummary {
  targetHash: string;
  erased: boolean;
  erasedAt: string;
  summary: {
    subscribersRemoved: number;
    submissionsAnonymized: number;
    applicationsAnonymized: number;
    rmasAnonymized: number;
    usersAnonymized: number;
  };
}

interface RetentionSweepResult {
  sweptAt: string;
  dataType: string;
  results: {
    auditLog: number;
    unconfirmedSubscribers: number;
    unsubscribedSubscribers: number;
    oldSubmissions: number;
    oldJobApplications: number;
    closedRmas: number;
    expiredSessions: number;
    errors: string[];
    success: boolean;
  };
}

export default function PrivacyModule({ me }: ModProps) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('export');

  // DSAR Export state
  const [exportEmail, setExportEmail] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportData, setExportData] = useState<DsarExportData | null>(null);

  // DSAR Erase state
  const [eraseEmail, setEraseEmail] = useState('');
  const [eraseConfirmed, setEraseConfirmed] = useState(false);
  const [showEraseModal, setShowEraseModal] = useState(false);
  const eraseDialogRef = useDialogA11y({ isOpen: showEraseModal, onClose: () => setShowEraseModal(false) });
  const [eraseLoading, setEraseLoading] = useState(false);
  const [eraseError, setEraseError] = useState<string | null>(null);
  const [eraseResult, setEraseResult] = useState<DsarEraseSummary | null>(null);

  // Retention state
  const [retentionType, setRetentionType] = useState('all');
  const [failLoudly, setFailLoudly] = useState(true);
  const [retentionLoading, setRetentionLoading] = useState(false);
  const [retentionError, setRetentionError] = useState<string | null>(null);
  const [retentionResult, setRetentionResult] = useState<RetentionSweepResult | null>(null);

  const isSuperAdmin = me.user?.role === 'super_admin';

  if (!isSuperAdmin) {
    return (
      <div style={{ maxWidth: 800, margin: '40px auto', padding: 24 }}>
        <div style={{ ...card, borderLeft: `4px solid ${RED}`, padding: 24 }}>
          <h2 style={{ margin: '0 0 8px 0', color: RED, fontSize: 18 }}>Access Restricted</h2>
          <p style={{ margin: 0, color: MUTED }}>
            Privacy operations and DSAR enforcement are restricted to users with the <strong>super_admin</strong> role.
          </p>
        </div>
      </div>
    );
  }

  // --- Handlers ---
  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exportEmail.trim() || !exportEmail.includes('@')) {
      setExportError('Please enter a valid email address.');
      return;
    }
    setExportLoading(true);
    setExportError(null);
    setExportData(null);
    try {
      const data = await apiSend<DsarExportData>('POST', '/admin/privacy/dsar-export', { email: exportEmail.trim() });
      setExportData(data);
      toast.success(`Export completed for ${exportEmail.trim()}`);
    } catch (err: any) {
      const msg = err instanceof ApiError ? (err.detail || err.message) : (err.message || 'Export failed');
      setExportError(msg);
      toast.error(`Export failed: ${msg}`);
    } finally {
      setExportLoading(false);
    }
  };

  const downloadExportJson = () => {
    if (!exportData) return;
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dsar-export-${exportData.targetHash.slice(0, 12)}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEraseConfirm = async () => {
    setShowEraseModal(false);
    setEraseLoading(true);
    setEraseError(null);
    setEraseResult(null);
    try {
      const res = await apiSend<DsarEraseSummary>('POST', '/admin/privacy/dsar-erase', { email: eraseEmail.trim() });
      setEraseResult(res);
      toast.success(`DSAR erasure successfully executed for ${eraseEmail.trim()}`);
      setEraseEmail('');
      setEraseConfirmed(false);
    } catch (err: any) {
      const msg = err instanceof ApiError ? (err.detail || err.message) : (err.message || 'Erasure failed');
      setEraseError(msg);
      toast.error(`Erasure failed: ${msg}`);
    } finally {
      setEraseLoading(false);
    }
  };

  const handleRetentionSweep = async () => {
    setRetentionLoading(true);
    setRetentionError(null);
    setRetentionResult(null);
    try {
      const res = await apiSend<RetentionSweepResult>('POST', '/admin/privacy/retention-sweep', {
        dataType: retentionType,
        failLoudly,
      });
      setRetentionResult(res);
      toast.success(`Retention sweep (${retentionType}) completed successfully.`);
    } catch (err: any) {
      const msg = err instanceof ApiError ? (err.detail || err.message) : (err.message || 'Sweep failed');
      setRetentionError(msg);
      toast.error(`Retention sweep error: ${msg}`);
    } finally {
      setRetentionLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '16px 20px 48px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: '0 0 6px 0', fontSize: 24, fontWeight: 700, color: INK }}>
            Privacy Operations &amp; DSAR
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: MUTED, maxWidth: 720 }}>
            Governed under PRIV-01, GDPR Art. 13/15/17, Taiwan PDPA, UAE PDPL, and India DPDP Act.
            Enforces multi-table data subject exports, cryptographic zero-PII audit trail erasure (Z-26), and scheduled retention sweeps (RET-01).
          </p>
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 999, background: '#ECFDF5', border: '1px solid #A7F3D0',
          fontSize: 12, fontWeight: 700, color: '#065F46',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669' }} />
          PRIV-01 Operative
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex', gap: 8, borderBottom: `1px solid ${LINE}`,
        marginBottom: 20, paddingBottom: 4,
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('export')}
          style={{
            ...btnGhost,
            border: 'none',
            borderBottom: activeTab === 'export' ? '3px solid #065F46' : '3px solid transparent',
            borderRadius: 0,
            color: activeTab === 'export' ? '#065F46' : MUTED,
            fontWeight: activeTab === 'export' ? 700 : 500,
            padding: '8px 16px',
          }}
        >
          Data Subject Export (Art. 15)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('erase')}
          style={{
            ...btnGhost,
            border: 'none',
            borderBottom: activeTab === 'erase' ? `3px solid ${RED}` : '3px solid transparent',
            borderRadius: 0,
            color: activeTab === 'erase' ? RED : MUTED,
            fontWeight: activeTab === 'erase' ? 700 : 500,
            padding: '8px 16px',
          }}
        >
          Right to Erasure (Art. 17 / Z-26)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('retention')}
          style={{
            ...btnGhost,
            border: 'none',
            borderBottom: activeTab === 'retention' ? '3px solid #065F46' : '3px solid transparent',
            borderRadius: 0,
            color: activeTab === 'retention' ? '#065F46' : MUTED,
            fontWeight: activeTab === 'retention' ? 700 : 500,
            padding: '8px 16px',
          }}
        >
          Automated Retention Sweep (RET-01)
        </button>
      </div>

      {/* TAB 1: DSAR Export */}
      {activeTab === 'export' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={card}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px 0', color: INK }}>
              DSAR Data Subject Export
            </h2>
            <p style={{ fontSize: 13, color: MUTED, margin: '0 0 16px 0' }}>
              Queries all 10 personal data tables: user accounts, sessions, newsletter subscriptions, contact/quote leads, notes, job applications, RMA records &amp; events, partner orgs/members, and related audit logs.
            </p>
            <form onSubmit={handleExport} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <label htmlFor="dsar-export-email" style={{ fontSize: 13, fontWeight: 600, color: INK, minWidth: 90 }}>
                Subject Email:
              </label>
              <input
                id="dsar-export-email"
                type="email"
                value={exportEmail}
                onChange={(e) => setExportEmail(e.target.value)}
                placeholder="customer@example.com"
                required
                style={{ ...input, flex: 1, minWidth: 260 }}
              />
              <button
                type="submit"
                disabled={exportLoading}
                style={{ ...btn, opacity: exportLoading ? 0.7 : 1, minWidth: 150 }}
              >
                {exportLoading ? 'Exporting…' : 'Export Subject Data'}
              </button>
            </form>
            {exportError && <div style={{ marginTop: 12 }}><Err error={exportError} /></div>}
          </div>

          {exportData && (
            <div style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: 15, fontWeight: 700, color: INK }}>
                    Export Bundle: {exportData.email}
                  </h3>
                  <div style={{ fontSize: 12, color: MUTED }}>
                    Cryptographic Target Hash: <code style={{ background: PAGE, padding: '2px 6px', borderRadius: 4 }}>{exportData.targetHash}</code> • Exported: {fmtDate(exportData.exportedAt)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={downloadExportJson}
                  style={{ ...btnGhost, fontSize: 12, padding: '6px 12px' }}
                >
                  Download JSON Bundle ↓
                </button>
              </div>

              {/* Grid of record counts */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: 10,
                marginBottom: 20,
              }}>
                {[
                  { label: 'User Accounts', count: exportData.records.users.length },
                  { label: 'Active Sessions', count: exportData.records.sessions.length },
                  { label: 'Newsletter Subscriptions', count: exportData.records.subscribers.length },
                  { label: 'Form Submissions', count: exportData.records.submissions.length },
                  { label: 'Staff Notes', count: exportData.records.formNotes.length },
                  { label: 'Job Applications', count: exportData.records.applications.length },
                  { label: 'RMA Requests', count: exportData.records.rmas.length },
                  { label: 'RMA Events', count: exportData.records.rmaEvents.length },
                  { label: 'Partner Orgs', count: exportData.records.partnerOrgs.length },
                  { label: 'Partner Members', count: exportData.records.partnerMembers.length },
                  { label: 'Audit Trail Entries', count: exportData.records.auditLogs.length },
                ].map((item) => (
                  <div key={item.label} style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: item.count > 0 ? '#F0FDF4' : PAGE,
                    border: `1px solid ${item.count > 0 ? '#BBF7D0' : LINE}`,
                  }}>
                    <div style={{ fontSize: 11, color: MUTED, marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: item.count > 0 ? GREEN : INK }}>{item.count}</div>
                  </div>
                ))}
              </div>

              {/* Details table preview */}
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: INK }}>Data Summary Breakdown</div>
              <Table head={['Table / Entity', 'Record Count', 'Sample Record Identifiers']}>
                <tr>
                  <td style={td}>User Accounts</td>
                  <td style={td}>{exportData.records.users.length}</td>
                  <td style={td}>{exportData.records.users.map((u) => u.id).join(', ') || '—'}</td>
                </tr>
                <tr>
                  <td style={td}>Submissions / Quotes / Leads</td>
                  <td style={td}>{exportData.records.submissions.length}</td>
                  <td style={td}>{exportData.records.submissions.map((s) => `#${s.id} (${s.kind})`).join(', ') || '—'}</td>
                </tr>
                <tr>
                  <td style={td}>RMA Returns</td>
                  <td style={td}>{exportData.records.rmas.length}</td>
                  <td style={td}>{exportData.records.rmas.map((r) => r.number).join(', ') || '—'}</td>
                </tr>
                <tr>
                  <td style={td}>Job Applications</td>
                  <td style={td}>{exportData.records.applications.length}</td>
                  <td style={td}>{exportData.records.applications.map((a) => `#${a.id}`).join(', ') || '—'}</td>
                </tr>
                <tr>
                  <td style={td}>Newsletter Subscriptions</td>
                  <td style={td}>{exportData.records.subscribers.length}</td>
                  <td style={td}>{exportData.records.subscribers.map((s) => s.status).join(', ') || '—'}</td>
                </tr>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Right to Erasure */}
      {activeTab === 'erase' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ ...card, borderLeft: `4px solid ${RED}` }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px 0', color: INK }}>
              Data Subject Right to Erasure &amp; Anonymization
            </h2>
            <p style={{ fontSize: 13, color: MUTED, margin: '0 0 12px 0' }}>
              Complies with GDPR Art. 17 and defect fix <strong>Z-26</strong>. Performs irreversible anonymization across all tables:
            </p>
            <ul style={{ fontSize: 13, color: MUTED, margin: '0 0 16px 20px', padding: 0 }}>
              <li>Removes newsletter subscription and deletes associated staff internal notes.</li>
              <li>Anonymizes user accounts and revokes active authentication sessions.</li>
              <li>Scrub personal identifiers from form submissions, job applications, and RMA customer records.</li>
              <li><strong>Zero PII in Audit Log:</strong> Historical diffs matching this subject are scrubbed. The audit trail records ONLY the cryptographic SHA-256 target hash.</li>
            </ul>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 540 }}>
              <div>
                <label htmlFor="dsar-erase-email" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: INK, marginBottom: 4 }}>
                  Subject Email to Erase:
                </label>
                <input
                  id="dsar-erase-email"
                  type="email"
                  value={eraseEmail}
                  onChange={(e) => setEraseEmail(e.target.value)}
                  placeholder="subject@example.com"
                  style={{ ...input, width: '100%' }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: INK, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={eraseConfirmed}
                  onChange={(e) => setEraseConfirmed(e.target.checked)}
                />
                I legally authorize the permanent erasure/anonymization of this data subject.
              </label>

              <div>
                <button
                  type="button"
                  disabled={!eraseConfirmed || !eraseEmail.includes('@') || eraseLoading}
                  onClick={() => setShowEraseModal(true)}
                  style={{
                    ...btn,
                    background: RED,
                    boxShadow: '0 1px 2px rgba(185,28,28,.30)',
                    opacity: (!eraseConfirmed || !eraseEmail.includes('@') || eraseLoading) ? 0.5 : 1,
                  }}
                >
                  {eraseLoading ? 'Erasing…' : 'Execute DSAR Erasure'}
                </button>
              </div>
            </div>

            {eraseError && <div style={{ marginTop: 16 }}><Err error={eraseError} /></div>}
          </div>

          {eraseResult && (
            <div style={{ ...card, borderLeft: `4px solid ${GREEN}` }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px 0', color: GREEN }}>
                ✓ Erasure Successfully Completed
              </h3>
              <p style={{ fontSize: 12, color: MUTED, margin: '0 0 12px 0' }}>
                Cryptographic Target Hash: <code style={{ background: PAGE, padding: '2px 6px', borderRadius: 4 }}>{eraseResult.targetHash}</code> • Executed: {fmtDate(eraseResult.erasedAt)}
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ padding: '8px 12px', background: '#F0FDF4', borderRadius: 6, border: '1px solid #BBF7D0' }}>
                  <div style={{ fontSize: 11, color: MUTED }}>Subscribers Removed</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: GREEN }}>{eraseResult.summary.subscribersRemoved}</div>
                </div>
                <div style={{ padding: '8px 12px', background: '#F0FDF4', borderRadius: 6, border: '1px solid #BBF7D0' }}>
                  <div style={{ fontSize: 11, color: MUTED }}>Submissions Anonymized</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: GREEN }}>{eraseResult.summary.submissionsAnonymized}</div>
                </div>
                <div style={{ padding: '8px 12px', background: '#F0FDF4', borderRadius: 6, border: '1px solid #BBF7D0' }}>
                  <div style={{ fontSize: 11, color: MUTED }}>Job Applications Anonymized</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: GREEN }}>{eraseResult.summary.applicationsAnonymized}</div>
                </div>
                <div style={{ padding: '8px 12px', background: '#F0FDF4', borderRadius: 6, border: '1px solid #BBF7D0' }}>
                  <div style={{ fontSize: 11, color: MUTED }}>RMA Records Anonymized</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: GREEN }}>{eraseResult.summary.rmasAnonymized}</div>
                </div>
                <div style={{ padding: '8px 12px', background: '#F0FDF4', borderRadius: 6, border: '1px solid #BBF7D0' }}>
                  <div style={{ fontSize: 11, color: MUTED }}>User Accounts Anonymized</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: GREEN }}>{eraseResult.summary.usersAnonymized}</div>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Modal */}
          {showEraseModal && (
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            }}>
              <div ref={eraseDialogRef} role="dialog" aria-modal="true" aria-labelledby="confirm-erase-title" style={{ ...card, maxWidth: 480, width: '90%', padding: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                <h3 id="confirm-erase-title" style={{ margin: '0 0 10px 0', fontSize: 18, color: RED, fontWeight: 700 }}>
                  Confirm Irreversible Data Erasure
                </h3>
                <p style={{ fontSize: 13, color: INK, margin: '0 0 16px 0', lineHeight: 1.5 }}>
                  Are you certain you want to execute erasure for <strong>{eraseEmail}</strong>? This action cannot be reversed. Personal data will be expunged and only a cryptographic SHA-256 hash will remain in audit trails.
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button type="button" onClick={() => setShowEraseModal(false)} style={btnGhost}>
                    Cancel
                  </button>
                  <button type="button" onClick={handleEraseConfirm} style={{ ...btn, background: RED }}>
                    Yes, Erase Subject Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Automated Retention Sweep */}
      {activeTab === 'retention' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={card}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px 0', color: INK }}>
              Automated Retention Policy Enforcement (T6.1.1 / RET-01)
            </h2>
            <p style={{ fontSize: 13, color: MUTED, margin: '0 0 16px 0' }}>
              Enforces lifecycle expiry per data category. Fails loudly on SQL errors instead of swallowing exceptions.
            </p>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
              <div>
                <label htmlFor="retention-type-select" style={{ fontSize: 13, fontWeight: 600, color: INK, marginRight: 8 }}>
                  Target Category:
                </label>
                <select
                  id="retention-type-select"
                  value={retentionType}
                  onChange={(e) => setRetentionType(e.target.value)}
                  style={{ ...input, padding: '7px 10px' }}
                >
                  <option value="all">All Categories (Full Sweep)</option>
                  <option value="audit_log">Audit Logs (&gt; 365 days / 12 mo)</option>
                  <option value="submissions">Resolved Submissions (&gt; 180 days)</option>
                  <option value="newsletter">Newsletter (Unconfirmed &gt; 90d, Unsub &gt; 180d)</option>
                  <option value="applications">Closed Job Applications (&gt; 180 days)</option>
                  <option value="rmas">Closed RMA Returns (&gt; 365 days)</option>
                  <option value="sessions">Expired Sessions (&gt; 30 days)</option>
                </select>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: INK, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={failLoudly}
                  onChange={(e) => setFailLoudly(e.target.checked)}
                />
                Fail loudly on partial errors
              </label>

              <button
                type="button"
                disabled={retentionLoading}
                onClick={handleRetentionSweep}
                style={{ ...btn, opacity: retentionLoading ? 0.7 : 1 }}
              >
                {retentionLoading ? 'Executing Sweep…' : 'Run Retention Sweep Now'}
              </button>
            </div>

            {retentionError && <Err error={retentionError} />}
          </div>

          {retentionResult && (
            <div style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: INK }}>
                  Sweep Execution Summary ({retentionResult.dataType})
                </h3>
                <span style={{ fontSize: 12, color: MUTED }}>
                  Executed at: {fmtDate(retentionResult.sweptAt)}
                </span>
              </div>

              <Table head={['Category', 'Retention Criteria', 'Expired Records Purged']}>
                <tr>
                  <td style={td}>Audit Log</td>
                  <td style={td}>Records &gt; 365 days (uses <code>created_at</code>)</td>
                  <td style={td}><strong>{retentionResult.results.auditLog}</strong></td>
                </tr>
                <tr>
                  <td style={td}>Unconfirmed Subscribers</td>
                  <td style={td}>Pending &gt; 90 days</td>
                  <td style={td}><strong>{retentionResult.results.unconfirmedSubscribers}</strong></td>
                </tr>
                <tr>
                  <td style={td}>Unsubscribed Subscribers</td>
                  <td style={td}>Unsubscribed &gt; 180 days</td>
                  <td style={td}><strong>{retentionResult.results.unsubscribedSubscribers}</strong></td>
                </tr>
                <tr>
                  <td style={td}>Resolved Submissions</td>
                  <td style={td}>Status 'resolved' / 'closed' &gt; 180 days</td>
                  <td style={td}><strong>{retentionResult.results.oldSubmissions}</strong></td>
                </tr>
                <tr>
                  <td style={td}>Job Applications</td>
                  <td style={td}>Status 'rejected' / 'hired' &gt; 180 days</td>
                  <td style={td}><strong>{retentionResult.results.oldJobApplications}</strong></td>
                </tr>
                <tr>
                  <td style={td}>RMA Records</td>
                  <td style={td}>Status 'closed' &gt; 365 days</td>
                  <td style={td}><strong>{retentionResult.results.closedRmas}</strong></td>
                </tr>
                <tr>
                  <td style={td}>Expired Sessions</td>
                  <td style={td}>Expired &gt; 30 days</td>
                  <td style={td}><strong>{retentionResult.results.expiredSessions}</strong></td>
                </tr>
              </Table>

              {retentionResult.results.errors.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <Err error={`Partial Failures: ${retentionResult.results.errors.join('; ')}`} />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
