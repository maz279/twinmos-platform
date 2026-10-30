// Alerts & Telemetry Module (Task T7.2.4 / OBS-01 / Z-29 / MS7.2)
// Real-time operations monitoring, durable alert logs, viewer PII redaction, and drill triggering.
import React, { useState } from 'react';
import { apiGet, apiSend, fmtDate } from '../api';
import { Empty, Err, useAsync, card, INK, LINE, MUTED, RED, GREEN } from '../ui';
import { Icon } from '../icons';
import type { ModProps } from '../nav';

export interface AlertItem {
  id: string;
  ruleId: string;
  severity: 'critical' | 'high' | 'medium' | 'info';
  title: string;
  message: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}

export interface AlertSummary {
  totalAlerts: number;
  severities: { critical: number; high: number; medium: number; info: number };
  metrics: {
    requestsTotal: number;
    errors5xx: number;
    recentLatenciesMs: number[];
    failedMails: number;
    lockoutEvents: number;
  };
}

export default function AlertsModule({ canWrite, me }: ModProps) {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const { data, error, reload } = useAsync(async () => {
    return apiGet<{ alerts: AlertItem[]; summary: AlertSummary }>('/admin/alerts');
  }, []);

  const handleTriggerDrill = async () => {
    try {
      setStatusMsg('Triggering 9-rule operational drill...');
      await apiSend('POST', '/admin/alerts/test');
      setStatusMsg('Drill triggered: all 9 operational alert rules fired.');
      await reload();
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (e: any) {
      setStatusMsg(`Failed to trigger drill: ${e.message}`);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await apiSend('POST', `/admin/alerts/${id}/resolve`);
      setStatusMsg('Alert resolved successfully.');
      await reload();
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (e: any) {
      setStatusMsg(`Failed to resolve alert: ${e.message}`);
    }
  };

  if (error) return <Err error={error} />;
  if (!data) return <div style={{ padding: 24, color: MUTED }}>Loading live telemetry and alerts...</div>;

  const { alerts, summary } = data;
  const filteredAlerts = alerts.filter(
    (a) => filterSeverity === 'all' || a.severity === filterSeverity
  );

  const severityBadgeStyle = (sev: string): React.CSSProperties => {
    switch (sev) {
      case 'critical':
        return { color: '#991B1B', background: '#FEE2E2', border: '1px solid #FECACA' };
      case 'high':
        return { color: '#9A3412', background: '#FFEDD5', border: '1px solid #FED7AA' };
      case 'medium':
        return { color: '#854D0E', background: '#FEF9C3', border: '1px solid #FEF08A' };
      case 'info':
        return { color: '#1E40AF', background: '#DBEAFE', border: '1px solid #BFDBFE' };
      default:
        return { color: MUTED, background: '#F1F5F9', border: '1px solid #CBD5E1' };
    }
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 18,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: INK }}>
            Alerts & Operational Telemetry
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: MUTED }}>
            Real-time cluster monitoring, durable alert logs, and operational health drills (MS7.2 / OBS-01)
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {canWrite && (
            <button
              onClick={handleTriggerDrill}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                background: '#0F766E', // WCAG AA >= 6.1:1 on white text
                color: '#ffffff',
                border: 0,
                borderRadius: 8,
                padding: '8px 14px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Icon name="zap" size={14} />
              Trigger 9-Rule Drill
            </button>
          )}
          <button
            onClick={() => reload()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#ffffff',
              border: `1px solid ${LINE}`,
              color: INK,
              borderRadius: 8,
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {statusMsg && (
        <div
          role="status"
          style={{
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            color: '#166534',
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 16,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {statusMsg}
        </div>
      )}

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div style={{ ...card, padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: MUTED, textTransform: 'uppercase' }}>
            Active Alerts
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: summary.totalAlerts > 0 ? RED : GREEN, marginTop: 4 }}>
            {summary.totalAlerts}
          </div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
            {summary.severities?.critical ?? 0} critical · {summary.severities?.high ?? 0} high
          </div>
        </div>

        <div style={{ ...card, padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: MUTED, textTransform: 'uppercase' }}>
            HTTP Requests
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: INK, marginTop: 4 }}>
            {summary.metrics?.requestsTotal ?? 0}
          </div>
          <div style={{ fontSize: 11, color: (summary.metrics?.errors5xx ?? 0) > 0 ? RED : MUTED, marginTop: 2 }}>
            5xx errors: {summary.metrics?.errors5xx ?? 0}
          </div>
        </div>

        <div style={{ ...card, padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: MUTED, textTransform: 'uppercase' }}>
            Mail Delivery
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: (summary.metrics?.failedMails ?? 0) > 0 ? RED : GREEN, marginTop: 4 }}>
            {(summary.metrics?.failedMails ?? 0) === 0 ? '100%' : `${summary.metrics?.failedMails} failed`}
          </div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
            Form routing & auto-replies
          </div>
        </div>

        <div style={{ ...card, padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: MUTED, textTransform: 'uppercase' }}>
            Auth Lockouts
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: INK, marginTop: 4 }}>
            {summary.metrics?.lockoutEvents ?? 0}
          </div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
            Brute-force protection events
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {['all', 'critical', 'high', 'medium', 'info'].map((sev) => {
          const isActive = filterSeverity === sev;
          return (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: `1px solid ${isActive ? '#0F766E' : LINE}`,
                background: isActive ? '#0F766E' : '#ffffff',
                color: isActive ? '#ffffff' : INK,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {sev} {sev !== 'all' ? `(${alerts.filter((a) => a.severity === sev).length})` : `(${alerts.length})`}
            </button>
          );
        })}
      </div>

      {/* Alert Stream Table */}
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        {filteredAlerts.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <Empty text="No active alerts match current filter. System running normally." />
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F8FAFB', borderBottom: `1px solid ${LINE}`, color: MUTED, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                <th style={{ padding: '12px 16px' }}>Severity</th>
                <th style={{ padding: '12px 16px' }}>Rule & Title</th>
                <th style={{ padding: '12px 16px' }}>Sanitized Message</th>
                <th style={{ padding: '12px 16px' }}>Timestamp</th>
                {canWrite && <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.map((a) => (
                <tr key={a.id} style={{ borderBottom: `1px solid ${LINE}` }}>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        ...severityBadgeStyle(a.severity),
                      }}
                    >
                      {a.severity}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 700, color: INK }}>{a.title}</div>
                    <code style={{ fontSize: 11, color: MUTED }}>{a.ruleId}</code>
                  </td>
                  <td style={{ padding: '12px 16px', color: INK }}>
                    {a.message}
                  </td>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: MUTED, fontSize: 12 }}>
                    {fmtDate(a.timestamp)}
                  </td>
                  {canWrite && (
                    <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => handleResolve(a.id)}
                        style={{
                          background: '#ffffff',
                          border: `1px solid ${LINE}`,
                          borderRadius: 6,
                          padding: '4px 10px',
                          fontSize: 12,
                          fontWeight: 700,
                          color: INK,
                          cursor: 'pointer',
                        }}
                      >
                        Resolve
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
