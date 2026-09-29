// P2 mailer — transactional email for form routing + RMA state mail.
// Drivers: Resend in production (RESEND_API_KEY), log-to-file outbox otherwise.
// Security rules honoured: credentials only from env; message content is fully
// static templates — customer-supplied values are attached as a structured
// summary block, never interpolated into HTML (plain-text bodies only).
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export type MailInput = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
  meta?: Record<string, unknown>;
};

const OUTBOX = process.env.MAIL_OUTBOX_DIR ?? './data/outbox';

/** Per-type routing: recipient comes from env (FORMS_TO or <TYPE>_TO); falls back to FORMS_TO. */
export const FORM_MAIL_ROUTES: Record<string, { subject: string; body: string }> = {
  contact: { subject: 'TwinMOS website — new contact message', body: 'A visitor sent a message through the contact form.' },
  quote: { subject: 'TwinMOS website — new quote request', body: 'A visitor requested a quotation.' },
  rma: { subject: 'TwinMOS website — new RMA request', body: 'A customer submitted an RMA request.' },
  'distributor-application': { subject: 'TwinMOS website — new distributor application', body: 'A new distributor application arrived.' },
  'partner-inquiry': { subject: 'TwinMOS website — new partner inquiry', body: 'A new partner inquiry arrived.' },
  'press-request': { subject: 'TwinMOS website — new press request', body: 'A new press/media request arrived.' },
  'job-application': { subject: 'TwinMOS website — new job application', body: 'A candidate applied for a role.' },
  'general-application': { subject: 'TwinMOS website — new general application', body: 'A candidate submitted a general application.' },
  'support-ticket': { subject: 'TwinMOS website — new support ticket', body: 'A customer opened a support ticket.' },
  'callback-request': { subject: 'TwinMOS website — new callback request', body: 'A visitor requested a callback.' },
  feedback: { subject: 'TwinMOS website — new feedback', body: 'A visitor sent feedback.' },
  'report-counterfeit': { subject: 'TwinMOS website — counterfeit report', body: 'A counterfeit product report arrived.' },
  newsletter: { subject: 'TwinMOS website — new newsletter signup', body: 'A visitor subscribed to the newsletter.' },
  'event-rsvp': { subject: 'TwinMOS website — new event RSVP', body: 'A visitor registered for an event.' },
  'build-submission': { subject: 'TwinMOS website — new build submission', body: 'A community build submission arrived.' },
};

export function routeRecipient(type: string): string | null {
  const specific = process.env[`${type.replace(/-/g, '_').toUpperCase()}_TO`];
  return specific ?? process.env.FORMS_TO ?? null;
}

function summaryBlock(fields: Record<string, unknown>): string {
  return Object.entries(fields)
    .filter(([, v]) => v !== undefined && v !== null && String(v) !== '')
    .map(([k, v]) => `- ${k}: ${String(v).slice(0, 500)}`)
    .join('\n');
}

async function sendViaResend(mail: MailInput): Promise<void> {
  const { Resend } = await import('resend');
  const client = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.MAIL_FROM ?? 'TwinMOS Website <onboarding@resend.dev>';
  await client.emails.send({ from, to: mail.to, subject: mail.subject, text: mail.text, replyTo: mail.replyTo });
}

function sendViaOutbox(mail: MailInput): void {
  mkdirSync(OUTBOX, { recursive: true });
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.json`;
  writeFileSync(join(OUTBOX, name), JSON.stringify({ ...mail, at: new Date().toISOString() }, null, 2));
}

/** Fire-and-forget semantics at call sites: never throws (delivery failure must not fail a submission). */
export async function sendMail(mail: MailInput): Promise<boolean> {
  try {
    if (process.env.RESEND_API_KEY) {
      await sendViaResend(mail);
    } else {
      sendViaOutbox(mail);
    }
    return true;
  } catch (e) {
    console.error('[mailer] delivery failed:', e);
    return false;
  }
}

/** Routing email to the internal team for a form submission. */
export async function sendFormRouting(type: string, refCode: string, email: string, payload: Record<string, unknown>): Promise<boolean> {
  const route = FORM_MAIL_ROUTES[type];
  const to = routeRecipient(type);
  if (!route || !to) {
    console.warn(`[mailer] no route configured for type=${type}; skipped`);
    return false;
  }
  return sendMail({
    to,
    subject: `${route.subject} [${refCode}]`,
    text: `${route.body}\n\nReference: ${refCode}\nReply-To: ${email}\n\nSubmission summary:\n${summaryBlock({ ...payload, email })}`,
    replyTo: email,
    meta: { kind: 'form-routing', type, refCode },
  });
}

/** Confirmation email to the customer (used for RMA intake and on request). */
export async function sendCustomerConfirmation(to: string, subject: string, text: string, meta?: Record<string, unknown>): Promise<boolean> {
  return sendMail({ to, subject, text, meta: { kind: 'customer-confirmation', ...meta } });
}

/** RMA status-change notification (opt-in per transition). */
export async function sendRmaStatusMail(to: string, number: string, from: string, toStatus: string, note?: string): Promise<boolean> {
  return sendMail({
    to,
    subject: `TwinMOS RMA ${number} — status updated to ${toStatus.replace('_', ' ')}`,
    text: `Your RMA request ${number} moved from ${from.replace('_', ' ')} to ${toStatus.replace('_', ' ')}.${note ? `\n\nNote from our team: ${note}` : ''}\n\nTrack your request any time: https://www.twinmos.com/rma.html`,
    meta: { kind: 'rma-status', number, from, toStatus },
  });
}

/** Staff invitation email containing login link and temporary credentials. */
export async function sendStaffInviteMail(
  to: string,
  name: string,
  role: string,
  temporaryPassword?: string,
): Promise<boolean> {
  const adminUrl = process.env.ADMIN_URL ?? 'https://admin.twinmos.com';
  const text = [
    `Hello ${name},`,
    '',
    `You have been invited to join the TwinMOS Administration Portal with the role: ${role}.`,
    '',
    ...(temporaryPassword
      ? [
          'Your temporary login credentials are provided below:',
          `- Portal: ${adminUrl}`,
          `- Email: ${to}`,
          `- Temporary Password: ${temporaryPassword}`,
          '',
          'For security, you must sign in and change your password immediately or enroll in Two-Factor Authentication (TOTP).',
        ]
      : [
          `Access the portal at: ${adminUrl}`,
        ]),
    '',
    'Regards,',
    'TwinMOS Security & Operations Team',
  ].join('\n');

  return sendMail({
    to,
    subject: `TwinMOS Admin Portal — Staff Invitation [${role}]`,
    text,
    meta: { kind: 'staff-invite', role, email: to },
  });
}

