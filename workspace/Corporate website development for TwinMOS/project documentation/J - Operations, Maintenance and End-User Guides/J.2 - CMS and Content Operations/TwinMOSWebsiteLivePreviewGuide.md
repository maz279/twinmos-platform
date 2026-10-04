# TwinMOS Website — Live Preview Guide

**Document Reference:** TWN-OPS-2026-017  
**Version:** 1.0  
**Status:** FINAL  
**Date:** 1 May 2026  
**Prepared by:** TwinMOS Digital Transformation Team / Unisoft Engineering  
**Owner:** TwinMOS Marketing Director  
**Audience:** Content Editors, Authors, Marketing Staff, Stakeholders  
**Classification:** INTERNAL — TwinMOS Staff Use  
**Synchronized With:** Tech Stack v1.1 §5.1, URD §17

---

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 1 May 2026 | TwinMOS Digital Transformation Team | Initial release |

---

## 1. Purpose

This guide explains how to use the Strapi v5 Live Preview feature to review content before publishing. Live Preview allows editors and stakeholders to see exactly how content will appear on the TwinMOS website without making it public.

---

## 2. What is Live Preview?

Live Preview is a Strapi v5 feature that renders draft content in the actual website frontend (Astro) in real-time. As you edit content in the CMS, the preview updates automatically, showing:

- Exact page layout and styling
- Responsive design (desktop, tablet, mobile)
- SEO metadata preview
- Social media share preview (OG tags)
- Navigation and related content

---

## 3. Accessing Live Preview

### 3.1 From the CMS

1. Log in to Strapi admin: `https://admin.twinmos.com`
2. Navigate to **Content Manager**
3. Open any content entry (create new or edit existing)
4. Look for the **"Preview"** button in the top-right corner of the page
5. Click **"Open preview"**
6. A new browser tab opens with the Live Preview

### 3.2 Preview URL Structure

```
https://preview.twinmos.com/[locale]/[content-type]/[slug]?preview=true&token=[jwt]
```

Example:
```
https://preview.twinmos.com/en/news/twinmos-launches-voltx-ddr5?preview=true&token=eyJ...
```

---

## 4. Using Live Preview

### 4.1 Real-Time Updates

As you edit content in the CMS:
1. Make changes to fields (title, body, images, SEO)
2. Click **"Save"** in the CMS
3. The Live Preview tab automatically refreshes (within 5–10 seconds)
4. See your changes rendered exactly as they will appear on the live site

### 4.2 Preview Modes

| Mode | How to Access | Purpose |
|------|--------------|---------|
| **Desktop** | Default view | Review full desktop layout |
| **Tablet** | Use browser DevTools (Ctrl+Shift+M) | Review tablet breakpoint (768px) |
| **Mobile** | Use browser DevTools (Ctrl+Shift+M) | Review mobile breakpoint (375px) |
| **Dark Mode** | Toggle in browser or OS | Verify dark mode compatibility |
| **RTL** | For Arabic content (AR locale) | Verify right-to-left layout |

### 4.3 Sharing Preview Links

To share a preview with stakeholders:

1. Open Live Preview for the content
2. Copy the URL from the browser address bar
3. Share via email, Slack, or other channel
4. **Note**: Preview links expire after 24 hours for security
5. To generate a new link: close and reopen preview, or refresh the CMS page

**Sharing Template:**
```
Hi [Name],

Please review the following content before publication:

Title: [Content Title]
Preview URL: [Live Preview link]
Expires: [24 hours from now]

Please provide feedback by [DATE/TIME].

Thanks!
```

---

## 5. Preview Limitations

### 5.1 Functional Limitations

The following features are disabled or simulated in Live Preview:

| Feature | Status in Preview | Reason |
|---------|-------------------|--------|
| Contact forms | Disabled (shown as placeholder) | Prevents test submissions |
| Live chat (Chatwoot) | Disabled | Avoids interference |
| Search | Functional (searches production index) | May not include draft content |
| E-commerce cart (P3) | Simulated | Prevents test orders |
| Anti-counterfeit SN check | Disabled | Uses production data |
| RMA status lookup | Disabled | Uses production data |
| Partner portal login | Disabled | Separate auth system |
| Analytics tracking | Disabled | Prevents skewing metrics |

### 5.2 Data Limitations

- Dynamic data (related products, latest news) pulls from production
- Draft content may not appear in "related content" lists until published
- Some filters and sorting may use cached production data
- User-generated content (reviews, build gallery) shows production data

### 5.3 Performance Limitations

- Preview builds are unoptimized (no CDN caching)
- Image optimization may be slower than production
- Page load times in preview are not representative of production performance
- Third-party scripts (GA4, marketing pixels) are disabled

---

## 6. Preview Best Practices

### 6.1 Before Publishing Checklist

Use Live Preview to verify:

- [ ] Content renders correctly on desktop
- [ ] Content renders correctly on mobile (use DevTools)
- [ ] Images load and are properly sized
- [ ] Alt text appears on image hover (browser dependent)
- [ ] Links are clickable and go to correct destinations
- [ ] SEO title and description display correctly (view page source)
- [ ] OG image appears when sharing URL on social media (use Facebook Debugger or similar)
- [ ] Heading structure is logical (H1 → H2 → H3)
- [ ] No broken layouts or overflow issues
- [ ] RTL layout correct (for Arabic content)

### 6.2 Stakeholder Review Process

1. Author completes content and saves as draft
2. Author opens Live Preview
3. Author shares preview link with Editor
4. Editor reviews and provides feedback (via comments or email)
5. Author makes revisions
6. Editor re-reviews updated preview
7. Once approved, Editor publishes

### 6.3 Multi-Language Preview

For translated content:
1. Create or open the target locale version (e.g., AR)
2. Open Live Preview
3. Verify RTL layout for Arabic
4. Check font rendering for Bengali and Hindi
5. Verify locale-specific content (prices, dates, addresses)
6. Share with native speaker reviewer if available

---

## 7. Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Preview not loading | Preview service down | Contact Unisoft Team Lead; try again in 5 minutes |
| Preview shows old content | Cache not refreshed | Hard refresh browser (Ctrl+F5); re-save content |
| Images not loading | Preview domain restriction | Images should load; if not, check Media Library upload |
| Styling looks wrong | Preview build issue | Report to Unisoft Team Lead with screenshot |
| Preview link expired | 24-hour expiry | Re-open preview from CMS to generate new link |
| Mobile view not accurate | Browser DevTools limitation | Test on actual mobile device if possible |
| RTL layout broken | CSS issue | Report to Unisoft Team Lead; do not publish |

---

## 8. Document Sign-Off

| Role | Name | Sign-Off | Date |
|------|------|----------|------|
| Marketing Director | (TBC) | _______________ | _________ |
| IT/Technical Lead | (TBC) | _______________ | _________ |
| Unisoft Team Lead | (TBC) | _______________ | _________ |

---

**Document Version:** 1.0  
**Issued:** 1 May 2026  
**Next Review:** Upon Phase 1 launch (Month 5) and quarterly thereafter  
**Canonical Location:** `J - Operations, Maintenance and End-User Guides/J.2 - CMS and Content Operations/TwinMOSWebsiteLivePreviewGuide.md`
