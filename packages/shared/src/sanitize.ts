// Safe Rich Text Sanitizer — WCAG 2.2 AA & OWASP XSS Prevention Allow-List.
// Tasks C12, T4.1.4. Ensures <script>, <form>, <input>, and unapproved attributes are strictly stripped.
import DOMPurify from 'isomorphic-dompurify';

export const RICH_TEXT_ALLOWED_TAGS = [
  'p', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'strong', 'b', 'em', 'i', 'u', 's', 'code', 'pre',
  'blockquote', 'ul', 'ol', 'li', 'a', 'img', 'table',
  'thead', 'tbody', 'tr', 'th', 'td', 'span', 'div', 'sup', 'sub',
];

export const RICH_TEXT_ALLOWED_ATTR = [
  'href', 'title', 'target', 'rel', 'src', 'alt', 'width', 'height', 'class', 'id',
];

export const RICH_TEXT_FORBID_TAGS = [
  'script', 'form', 'input', 'button', 'select', 'textarea', 'style', 'iframe', 'frame', 'object', 'embed', 'applet',
];

/**
 * Sanitizes an untrusted HTML or rich text string against a strict allow-list.
 * Explicitly strips <script>, <form>, <input>, <style>, <iframe>, and event handlers.
 */
export function sanitizeRichText(html: string): string {
  if (!html || typeof html !== 'string') return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: RICH_TEXT_ALLOWED_TAGS,
    ALLOWED_ATTR: RICH_TEXT_ALLOWED_ATTR,
    FORBID_TAGS: RICH_TEXT_FORBID_TAGS,
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Replaces `{logo}` placeholder tokens in headings or titles with an accessible inline brand image.
 */
export function replaceLogoToken(text: string): string {
  if (!text || typeof text !== 'string') return '';
  if (!text.includes('{logo}')) return text;
  return text.replaceAll(
    '{logo}',
    '<img src="/brand/logo.svg" alt="TwinMOS" class="inline-brand-logo" style="height:0.9em;display:inline-block;vertical-align:middle;margin:0 4px" />'
  );
}
