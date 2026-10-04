// Users & Roles Management — super_admin only (docs/04-ADMIN-CMS-SPEC.md §RBAC)
// Endpoints: list users, invite staff, change roles, revoke sessions, ban/unban.
// 0024: security analytics strip (role distribution, MFA coverage, active
// sessions, join trend) + per-user security drawer (sessions, MFA, recent
// audited actions — the IAM access-review visibility loop).
import React, { useMemo, useState } from 'react';
import { apiGet, apiSend, fmtDate } from '../api';
import { btn, btnGhost, card, Empty, Err, input, Table, td, useAsync, usePanelScroll } from '../ui';
import type { ModProps } from '../nav';

type UserRole = 'super_admin' | 'admin' | 'editor' | 'author' | 'viewer';

type UserAccount = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  banned: boolean;
  banReason: string | null;
  banExpires: string | null;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  lastActiveAt?: string | null;
};

type DirectoryAnalytics = {
  total: number;
  byRole: Array<{ role: string; n: number }>;
  mfaCoverage: number;
  emailVerified: number;
  suspended: number;
  activeSessions: number;
  series: Array<{ d: string; n: number }>;
};

type UserActivity = {
  id: string; email: string; name: string; role: string;
  twoFactorEnabled: boolean; banned: boolean; banReason: string | null;
  emailVerified: boolean; createdAt: string; updatedAt: string;
  activeSessions: number;
  activity: Array<{ id: number; action: string; entity: string; entityId: string | null; ip: string | null; at: string }>;
};

const ROLE_COLORS: Record<UserRole, { bg: string; text: string; border: string }> = {
  super_admin: { bg: '#F3E8FF', text: '#7E22CE', border: '#D8B4FE' },
  admin: { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  editor: { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' },
  author: { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' },
  viewer: { bg: '#F1F5F9', text: '#475569', border: '#D9E0E8' },
};

export default function UsersModule({ me }: ModProps) {
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const [inviteOpen, setInviteOpen] = useState(false);
  const [banModalUser, setBanModalUser] = useState<UserAccount | null>(null);
  const [actionError, setActionError] = useState<unknown>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [profileFor, setProfileFor] = useState<string | null>(null);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (roleFilter) p.set('role', roleFilter);
    p.set('page', String(page));
    p.set('limit', String(pageSize));
    const qs = p.toString();
    return qs ? `?${qs}` : '';
  }, [q, roleFilter, page]);

  const { data, error, loading, reload } = useAsync<{ items: UserAccount[]; total?: number; page?: number; limit?: number }>(
    () => apiGet('/admin/users' + query),
    [query],
  );

  async function handleRoleChange(userId: string, newRole: UserRole) {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    setActionError(null); setSuccessMsg(null);
    try {
      await apiSend('PATCH', `/admin/users/${userId}/role`, { role: newRole });
      setSuccessMsg(`Role updated successfully to ${newRole}.`);
      reload();
    } catch (e) {
      setActionError(e);
    }
  }

  async function handleRevokeSessions(u: UserAccount) {
    if (!window.confirm(`Terminate all active sessions for ${u.name || u.email}? The user will be immediately logged out.`)) return;
    setActionError(null); setSuccessMsg(null);
    try {
      const res = await apiSend<{ revoked: boolean; count: number }>('POST', `/admin/users/${u.id}/revoke-sessions`, {});
      setSuccessMsg(`Terminated ${res.count ?? 0} active session(s) for ${u.email}.`);
      reload();
    } catch (e) {
      setActionError(e);
    }
  }

  async function handleUnban(u: UserAccount) {
    if (!window.confirm(`Reactivate account for ${u.name || u.email}?`)) return;
    setActionError(null); setSuccessMsg(null);
    try {
      await apiSend('POST', `/admin/users/${u.id}/unban`, {});
      setSuccessMsg(`Account reactivated for ${u.email}.`);
      reload();
    } catch (e) {
      setActionError(e);
    }
  }

  return (
    <div>
      <SecurityAnalyticsStrip />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1F2A37', letterSpacing: -0.2 }}>Users & Roles</h1>
          <p style={{ color: '#66748A', margin: '4px 0 0' }}>
            Platform staff directory, role governance, MFA enforcement, and active session management.
            {data?.total != null ? ` (${data.total} registered staff account${data.total === 1 ? '' : 's'})` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btnGhost} onClick={reload}>Refresh</button>
          <button style={btn} onClick={() => { setInviteOpen(true); setActionError(null); }}>
            + Invite User
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ ...card, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <input
          style={{ ...input, flex: '1 1 200px' }}
          placeholder="Search by name or email…"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
        />
        <select
          style={{ ...input, width: 160 }}
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Roles</option>
          <option value="super_admin">Super Admin</option>
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="author">Author</option>
          <option value="viewer">Viewer</option>
        </select>
        {(q || roleFilter || page > 1) && (
          <button style={btnGhost} onClick={() => { setQ(''); setRoleFilter(''); setPage(1); }}>Clear</button>
        )}
      </div>

      {actionError ? <div style={{ marginBottom: 16 }}><Err error={actionError} /></div> : null}
      {successMsg ? (
        <div style={{ background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', borderRadius: 8, padding: '10px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} style={{ border: 0, background: 'transparent', cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>
      ) : null}
      {error ? <Err error={error} /> : null}

      {loading ? (
        <p style={{ color: '#66748A', padding: '16px 0' }}>Loading user directory…</p>
      ) : data ? (
        <Table head={['Staff Member', 'Role', 'Status', 'MFA / 2FA', 'Email Verified', 'Last Active', 'Joined', 'Actions']}>
          {data.items.map((u) => {
            const roleStyle = ROLE_COLORS[u.role] ?? ROLE_COLORS.viewer;
            const isMe = me?.user?.id === u.id;
            return (
              <tr key={u.id} onClick={() => setProfileFor(profileFor === u.id ? null : u.id)} style={{ background: profileFor === u.id ? '#F0F9FF' : (u.banned ? '#FEF2F2' : undefined), cursor: 'pointer' }}>
                <td style={td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E6EBF1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#475569', fontSize: 13 }}>
                      {(u.name || u.email).slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>
                        {u.name} {isMe && <span style={{ fontSize: 11, color: '#2563EB', fontWeight: 400 }}>(You)</span>}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748B' }}>{u.email}</div>
                    </div>
                  </div>
                </td>

                <td style={td}>
                  <select
                    disabled={isMe}
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                    style={{
                      background: roleStyle.bg,
                      color: roleStyle.text,
                      border: `1px solid ${roleStyle.border}`,
                      borderRadius: 6,
                      padding: '4px 8px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: isMe ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <option value="super_admin">super_admin</option>
                    <option value="admin">admin</option>
                    <option value="editor">editor</option>
                    <option value="author">author</option>
                    <option value="viewer">viewer</option>
                  </select>
                </td>

                <td style={td}>
                  {u.banned ? (
                    <div>
                      <span style={{ background: '#FEE2E2', color: '#9C3230', border: '1px solid #FCA5A5', borderRadius: 99, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                        Suspended
                      </span>
                      {u.banExpires && (
                        <div style={{ fontSize: 11, color: '#B45309', marginTop: 2 }}>
                          Until {fmtDate(u.banExpires)}
                        </div>
                      )}
                      {u.banReason && (
                        <div style={{ fontSize: 11, color: '#9C3230', marginTop: 2, maxWidth: 160 }} title={u.banReason}>
                          {u.banReason}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span style={{ background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', borderRadius: 99, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                      Active
                    </span>
                  )}
                </td>

                <td style={td}>
                  {u.twoFactorEnabled ? (
                    <span style={{ background: '#E0F2FE', color: '#0369A1', border: '1px solid #BAE6FD', borderRadius: 99, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                      ✓ Enabled
                    </span>
                  ) : (
                    <span style={{ background: '#F1F5F9', color: '#64748B', border: '1px solid #D9E0E8', borderRadius: 99, padding: '2px 8px', fontSize: 11 }}>
                      Disabled
                    </span>
                  )}
                </td>

                <td style={td}>
                  {u.emailVerified ? (
                    <span style={{ color: '#047857', fontSize: 12, fontWeight: 600 }}>✓ Verified</span>
                  ) : (
                    <span style={{ color: '#94A3B8', fontSize: 12 }}>Unverified</span>
                  )}
                </td>

                <td style={{ ...td, color: '#66748A', fontSize: 12 }}>
                  {u.lastActiveAt ? fmtDate(u.lastActiveAt) : 'Never'}
                </td>

                <td style={{ ...td, color: '#64748B', fontSize: 12 }}>
                  {fmtDate(u.createdAt)}
                </td>

                <td style={{ ...td, whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      disabled={isMe}
                      title={isMe ? 'Cannot terminate your own active session from here' : 'Force terminate all active sessions'}
                      style={{
                        ...btnGhost,
                        fontSize: 11,
                        padding: '4px 8px',
                        opacity: isMe ? 0.4 : 1,
                        cursor: isMe ? 'not-allowed' : 'pointer',
                      }}
                      onClick={() => handleRevokeSessions(u)}
                    >
                      Revoke Sessions
                    </button>
                    {!isMe && (
                      u.banned ? (
                        <button
                          style={{ ...btn, background: '#10B981', color: '#fff', fontSize: 11, padding: '4px 8px' }}
                          onClick={() => handleUnban(u)}
                        >
                          Reactivate
                        </button>
                      ) : (
                        <button
                          style={{ ...btnGhost, background: '#FEE2E2', color: '#9C3230', fontSize: 11, padding: '4px 8px' }}
                          onClick={() => setBanModalUser(u)}
                        >
                          Suspend
                        </button>
                      )
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </Table>
      ) : null}

      {data && data.total != null && data.total > pageSize && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 13, color: '#66748A' }}>
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, data.total)} of {data.total} staff accounts
          </span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              style={btnGhost}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              ← Previous
            </button>
            <span style={{ padding: '4px 8px', fontSize: 13, fontWeight: 600 }}>
              Page {page} of {Math.ceil(data.total / pageSize)}
            </span>
            <button
              style={btnGhost}
              disabled={page >= Math.ceil(data.total / pageSize)}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {data && data.items.length === 0 && <Empty text="No staff accounts found." />}

      {/* Invite Modal */}
      {profileFor != null && <UserProfileDrawer id={profileFor} onClose={() => setProfileFor(null)} />}
      {inviteOpen && (
        <InviteModal
          onClose={() => setInviteOpen(false)}
          onSuccess={(msg) => {
            setInviteOpen(false);
            setSuccessMsg(msg);
            reload();
          }}
        />
      )}

      {/* Ban / Suspension Modal */}
      {banModalUser && (
        <BanModal
          user={banModalUser}
          onClose={() => setBanModalUser(null)}
          onSuccess={() => {
            setBanModalUser(null);
            setSuccessMsg(`Account for ${banModalUser.email} has been suspended.`);
            reload();
          }}
        />
      )}
    </div>
  );
}

function InviteModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (msg: string) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('editor');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [createdInfo, setCreatedInfo] = useState<{ email: string; role: string; tempPass?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload: { name: string; email: string; role: UserRole; password?: string } = {
        name,
        email,
        role,
      };
      if (password.trim()) payload.password = password.trim();

      const res = await apiSend<{ user: UserAccount; temporaryPassword?: string }>('POST', '/admin/users/invite', payload);
      if (res.temporaryPassword) {
        setCreatedInfo({ email: res.user.email, role: res.user.role, tempPass: res.temporaryPassword });
      } else {
        onSuccess(`Staff account invited successfully for ${res.user.email} (${res.user.role}).`);
      }
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div style={{ ...card, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Invite Staff Member</h2>
          <button onClick={onClose} style={{ border: 0, background: 'transparent', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>

        {error ? <div style={{ marginBottom: 12 }}><Err error={error} /></div> : null}

        {createdInfo ? (
          <div>
            <div style={{ background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', borderRadius: 8, padding: 14, marginBottom: 16 }}>
              <b>User account created!</b>
              <p style={{ margin: '8px 0 0', fontSize: 13 }}>
                Email: <b>{createdInfo.email}</b><br />
                Role: <b>{createdInfo.role}</b>
              </p>
              {createdInfo.tempPass && (
                <div style={{ marginTop: 12 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#065F46' }}>Generated Temporary Password:</label>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <input
                      readOnly
                      value={createdInfo.tempPass}
                      style={{ ...input, fontFamily: 'monospace', fontWeight: 700, flex: 1, background: '#fff' }}
                    />
                    <button
                      type="button"
                      style={{ ...btn, minWidth: 80 }}
                      onClick={() => {
                        if (navigator.clipboard?.writeText) {
                          navigator.clipboard.writeText(createdInfo.tempPass || '').then(() => {
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }).catch(() => {
                            alert('Password: ' + createdInfo.tempPass);
                          });
                        } else {
                          alert('Password: ' + createdInfo.tempPass);
                        }
                      }}
                    >
                      {copied ? 'Copied! ✓' : 'Copy'}
                    </button>
                  </div>
                  <span style={{ fontSize: 11, color: '#047857', display: 'block', marginTop: 4 }}>
                    An invitation email containing login instructions has been dispatched. You may also copy the temporary password directly:
                  </span>
                </div>
              )}
            </div>
            <button style={{ ...btn, width: '100%' }} onClick={() => onSuccess(`Staff account created for ${createdInfo.email}.`)}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Full Name *</label>
                <input
                  required
                  style={{ ...input, width: '100%' }}
                  placeholder="e.g. Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Corporate Email *</label>
                <input
                  required
                  type="email"
                  style={{ ...input, width: '100%' }}
                  placeholder="e.g. jane@twinmos.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Role *</label>
                <select
                  style={{ ...input, width: '100%' }}
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                >
                  <option value="viewer">Viewer (Read-only)</option>
                  <option value="author">Author (Draft content)</option>
                  <option value="editor">Editor (Publish content, view audit)</option>
                  <option value="admin">Admin (Manage catalog, media, partners, RMA)</option>
                  <option value="super_admin">Super Admin (Full governance & settings)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                  Initial Password <span style={{ fontWeight: 400, color: '#64748B' }}>(optional — auto-generated if blank)</span>
                </label>
                <input
                  type="password"
                  minLength={10}
                  style={{ ...input, width: '100%' }}
                  placeholder="Min 10 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                <button type="button" style={btnGhost} onClick={onClose}>Cancel</button>
                <button type="submit" style={btn} disabled={busy || !name || !email}>
                  {busy ? 'Creating…' : 'Create Account'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function BanModal({ user, onClose, onSuccess }: { user: UserAccount; onClose: () => void; onSuccess: () => void }) {
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('0');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const expiresIn = Number(duration);
      await apiSend('POST', `/admin/users/${user.id}/ban`, {
        reason: reason.trim() || undefined,
        expiresIn: expiresIn > 0 ? expiresIn : undefined,
      });
      onSuccess();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div style={{ ...card, width: '100%', maxWidth: 440 }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 18, color: '#9C3230' }}>Suspend Account</h2>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748B' }}>
          Suspending <b>{user.name || user.email}</b> will immediately terminate all active sessions and block sign-in until reactivated.
        </p>

        {error ? <div style={{ marginBottom: 12 }}><Err error={error} /></div> : null}

        <form onSubmit={submit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Suspension Duration</label>
              <select
                style={{ ...input, width: '100%' }}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              >
                <option value="0">Permanent (Until manual reactivation)</option>
                <option value="3600">1 Hour (Temporary security hold)</option>
                <option value="86400">24 Hours</option>
                <option value="604800">7 Days</option>
                <option value="2592000">30 Days</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Suspension Reason</label>
              <textarea
                style={{ ...input, width: '100%', minHeight: 80 }}
                placeholder="e.g. Security audit hold, departure, or credential compromise…"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <button type="button" style={btnGhost} onClick={onClose}>Cancel</button>
              <button type="submit" style={{ ...btn, background: '#DC2626', color: '#fff' }} disabled={busy}>
                {busy ? 'Suspending…' : 'Confirm Suspension'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---- 0024: security analytics strip ------------------------------------------

function SecurityAnalyticsStrip() {
  const { data, error, loading } = useAsync<DirectoryAnalytics>(() => apiGet('/admin/users/analytics'), []);
  if (loading) return null;
  if (error || !data) return null;
  const kpi = (label: string, value: string, sub: string, tone = '#1F2A37') => (
    <div style={{ border: '1px solid #E6EBF1', borderRadius: 10, background: '#fff', padding: '10px 14px' }}>
      <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.9, textTransform: 'uppercase', color: '#93A0B4' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: tone, marginTop: 2 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: '#66748A' }}>{sub}</div>
    </div>
  );
  const maxJoins = Math.max(1, ...data.series.map((x) => x.n));
  return (
    <details style={{ border: '1px solid #E6EBF1', borderRadius: 12, background: '#fff', padding: '10px 16px', marginTop: 12 }}>
      <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 800, color: '#1F2A37', userSelect: 'none' }}>
        Security — <span style={{ color: '#66748A', fontWeight: 400 }}>
          {data.total} staff · {data.mfaCoverage}% MFA · {data.activeSessions} active session{data.activeSessions === 1 ? '' : 's'}{data.suspended ? ` · ${data.suspended} suspended` : ''}
        </span>
      </summary>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10, marginTop: 12 }}>
        {kpi('Staff', String(data.total), data.byRole.map((r) => r.n + ' ' + r.role).join(' · '))}
        {kpi('MFA coverage', data.mfaCoverage + '%', Math.round(data.total * (1 - data.mfaCoverage / 100)) + ' without MFA', data.mfaCoverage === 100 ? '#1F9D62' : '#B45309')}
        {kpi('Active sessions', String(data.activeSessions), 'live login sessions')}
        {kpi('Suspended', String(data.suspended), data.suspended ? 'accounts blocked' : 'none')}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16, marginTop: 14 }}>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.9, textTransform: 'uppercase', color: '#93A0B4', marginBottom: 6 }}>Role distribution</div>
          {data.byRole.map((r) => (
            <div key={r.role} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 30px', alignItems: 'center', gap: 8, padding: '3px 0' }}>
              <span style={{ fontSize: 12, color: '#66748A' }}>{r.role}</span>
              <span style={{ background: '#F1F4F8', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                <span style={{ display: 'block', width: (r.n / Math.max(1, data.total)) * 100 + '%', height: '100%', background: '#1DBF9F', borderRadius: 999 }} />
              </span>
              <b style={{ fontSize: 12.5, color: '#1F2A37', textAlign: 'right' }}>{r.n}</b>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.9, textTransform: 'uppercase', color: '#93A0B4', marginBottom: 6 }}>New staff — last 14 days</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 60, borderBottom: '1px solid #E6EBF1' }}>
            {data.series.map((x) => (
              <div key={x.d} title={x.d + ': ' + x.n} style={{ flex: 1, display: 'flex', alignItems: 'flex-end', height: '100%' }}>
                <span style={{ width: '70%', borderRadius: '3px 3px 0 0', background: '#7C5CDB', height: Math.max((x.n / maxJoins) * 100, x.n ? 6 : 0) + '%', display: 'block', margin: '0 auto' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </details>
  );
}

// ---- 0024: per-user security drawer ------------------------------------------

function UserProfileDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const panelRef = usePanelScroll<HTMLDivElement>();
  const { data, error, loading } = useAsync<UserActivity>(() => apiGet('/admin/users/' + encodeURIComponent(id) + '/activity'), [id]);
  return (
    <div ref={panelRef} style={{ marginTop: 14, border: '1px solid #E6EBF1', borderRadius: 12, background: '#F8FAFC', padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <b style={{ fontSize: 15, color: '#1F2A37' }}>Security profile</b>
        <span style={{ flex: 1 }} />
        <button style={{ ...btnGhost, padding: '4px 10px' }} onClick={onClose}>Close</button>
      </div>
      {error ? <div style={{ marginTop: 10 }}><Err error={error} /></div> : loading ? <p style={{ marginTop: 10 }}>Loading…</p> : data ? (
        <>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '10px 0' }}>
            <span style={{ fontSize: 12, color: '#66748A', background: '#fff', border: '1px solid #E6EBF1', borderRadius: 8, padding: '4px 10px' }}>
              {data.name || data.email} · <b>{data.role}</b>
            </span>
            <span style={{ fontSize: 12, color: data.twoFactorEnabled ? '#047857' : '#B45309', background: '#fff', border: '1px solid #E6EBF1', borderRadius: 8, padding: '4px 10px' }}>
              MFA {data.twoFactorEnabled ? '✓ enabled' : '✗ disabled'}
            </span>
            <span style={{ fontSize: 12, color: data.banned ? '#9C3230' : '#047857', background: '#fff', border: '1px solid #E6EBF1', borderRadius: 8, padding: '4px 10px' }}>
              {data.banned ? 'Suspended' + (data.banReason ? ' — ' + data.banReason : '') : 'Active'}
            </span>
            <span style={{ fontSize: 12, color: '#66748A', background: '#fff', border: '1px solid #E6EBF1', borderRadius: 8, padding: '4px 10px' }}>
              <b>{data.activeSessions}</b> active session{data.activeSessions === 1 ? '' : 's'}
            </span>
            <span style={{ fontSize: 12, color: '#66748A', background: '#fff', border: '1px solid #E6EBF1', borderRadius: 8, padding: '4px 10px' }}>
              joined {fmtDate(data.createdAt)}
            </span>
          </div>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.9, textTransform: 'uppercase', color: '#93A0B4', margin: '12px 0 6px' }}>
            Recent audited actions ({data.activity.length})
          </div>
          {data.activity.length === 0 ? (
            <span style={{ fontSize: 12.5, color: '#66748A' }}>No audited activity recorded for this account.</span>
          ) : (
            <Table head={['Action', 'Entity', 'IP', 'When']}>
              {data.activity.map((a) => (
                <tr key={a.id}>
                  <td style={td}><b style={{ color: '#1F2A37' }}>{a.action}</b></td>
                  <td style={{ ...td, color: '#66748A', fontSize: 12 }}>{a.entity}{a.entityId ? ' #' + a.entityId : ''}</td>
                  <td style={{ ...td, fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>{a.ip ?? '—'}</td>
                  <td style={td}>{fmtDate(a.at)}</td>
                </tr>
              ))}
            </Table>
          )}
        </>
      ) : null}
    </div>
  );
}
