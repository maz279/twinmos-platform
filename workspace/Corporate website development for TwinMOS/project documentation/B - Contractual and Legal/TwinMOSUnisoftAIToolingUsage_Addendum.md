# TwinMOS Technologies Middle East FZE — Unisoft Solutions Ltd.

# AI Tooling Usage Addendum

**Document Reference:** TWN-LEGAL-AI-2026-001  
**Version:** 1.0  
**Effective Date:** [DATE UPON EXECUTION]  
**Governing Law:** Laws of the United Arab Emirates (Dubai International Financial Centre — DIFC, where applicable)

---

## Table of Contents

1. [Preamble and Parties](#1-preamble-and-parties)
2. [Definitions](#2-definitions)
3. [Approved AI Tools](#3-approved-ai-tools)
4. [Permitted Uses](#4-permitted-uses)
5. [Prohibited Uses](#5-prohibited-uses)
6. [Confidential Data Protection](#6-confidential-data-protection)
7. [Intellectual Property Ownership of AI-Generated Work](#7-intellectual-property-ownership-of-ai-generated-work)
8. [Human Review Requirements](#8-human-review-requirements)
9. [Disclosure and Logging Obligations](#9-disclosure-and-logging-obligations)
10. [Training and Personnel Certification](#10-training-and-personnel-certification)
11. [Audit Rights](#11-audit-rights)
12. [AI Tool Provider Data Handling Verification](#12-ai-tool-provider-data-handling-verification)
13. [Regulatory Compliance](#13-regulatory-compliance)
14. [Indemnification](#14-indemnification)
15. [Review and Amendments](#15-review-and-amendments)
16. [Signatures](#16-signatures)

---

## 1. Preamble and Parties

### 1.1 Parties

This AI Tooling Usage Addendum ("**Addendum**") is entered into between:

**TwinMOS Technologies Middle East FZE**  
C-9, Dubai Airport Free Zone (DAFZA)  
Dubai, United Arab Emirates  
P.O. Box 293693  
("**Client**" or "**TwinMOS**")

and

**Unisoft Solutions Ltd.**  
[Registered Address to be completed]  
("**Service Provider**" or "**Unisoft**")

Collectively referred to as the "**Parties**" and individually as a "**Party**".

### 1.2 Purpose

This Addendum governs the use of artificial intelligence coding tools, generative AI assistants, and related AI-powered software development aids by Unisoft personnel during the TwinMOS corporate website development engagement (the "**Project**"). It establishes the framework for: permissible AI tool usage; protection of TwinMOS confidential information from AI systems; intellectual property ownership of AI-generated work product; disclosure obligations; and compliance with applicable laws and regulations.

### 1.3 Relationship to MSA and Other Agreements

(a) This Addendum is incorporated by reference as **Annex F** to the TwinMOS–Unisoft Master Service Agreement (TWN-LEGAL-MSA-2026-001) and forms an integral part of that Agreement.

(b) This Addendum supplements MSA Sections 7 (Intellectual Property), 8 (Confidentiality and Data Protection), and 9 (Security, Compliance, and Audit Rights). In the event of any conflict between this Addendum and the MSA on the subject of AI tool usage and its IP or confidentiality implications, this Addendum shall govern as the more specific instrument.

(c) The confidentiality obligations of the TwinMOS–Unisoft Non-Disclosure Agreement (TWN-LEGAL-NDA-2026-001) apply in full to all information related to AI tool usage under this Addendum.

(d) All IP transfer obligations under the TwinMOS–Unisoft IP Ownership Transfer Agreement (TWN-LEGAL-IP-2026-001) apply equally to AI-Generated Code and AI-Generated Work Product as defined herein.

### 1.4 Background

The Parties acknowledge that:

(a) The use of AI coding assistants and generative AI tools has become prevalent in modern software development and may offer productivity benefits for the Project.

(b) AI tools introduce specific risks with respect to intellectual property ownership uncertainty, inadvertent disclosure of confidential information, data retention by third-party AI providers, and regulatory compliance.

(c) These risks must be carefully managed to protect TwinMOS's proprietary information, ensure unencumbered IP ownership of all Work Product, and maintain compliance with applicable laws including but not limited to the UAE Federal Decree-Law No. 45 of 2021 (PDPL), GDPR, and the EU AI Act.

---

## 2. Definitions

### 2.1 Key Terms

| Term | Definition |
|------|------------|
| **"AI Tool"** | Any software application, platform, API, or plugin that utilizes artificial intelligence, machine learning, or large language models to assist in code generation, code completion, code review, documentation, testing, or any other software development activity. This includes but is not limited to GitHub Copilot, Cursor IDE, Claude Code CLI, ChatGPT, Gemini, and their successors or equivalents. |
| **"Approved AI Tool"** | An AI Tool explicitly listed in Section 3.1 at the applicable Tier classification and approved for use on the Project. |
| **"Prohibited AI Tool"** | Any AI Tool not listed as an Approved AI Tool in Section 3.1, or any tool explicitly listed in Section 3.3. |
| **"AI-Generated Code"** | Any source code, script, configuration, test, or other programmatic output that was in whole or in part produced, suggested, or auto-completed by an AI Tool, regardless of the extent of subsequent human editing. |
| **"AI-Generated Work Product"** | All AI-Generated Code plus any documentation, design specifications, technical diagrams, test cases, or written content produced in whole or in part by an AI Tool during the Project. |
| **"Confidential Data"** | Any information classified as Confidential Information under the MSA (Section 2.1) and NDA (TWN-LEGAL-NDA-2026-001), including but not limited to TwinMOS product SKU databases, distributor and retailer contact information, pricing data, source code, business strategy documents, and all Personal Data. |
| **"Human Review"** | A substantive review of AI-Generated Code by a qualified developer, involving functional understanding, testing, and where necessary modification, prior to integration into the Project repository. A superficial review or mere approval without understanding does not constitute Human Review. |
| **"Personal Data"** | Any information relating to an identified or identifiable natural person, as defined under Applicable Laws (GDPR, UAE PDPL, India DPDP Act 2023). |
| **"Project Repository"** | The GitHub repository (or equivalent) hosting the TwinMOS website source code under the Project. |
| **"Training on Inputs"** | The use of data submitted to an AI Tool — including prompts, code snippets, and responses — to train, fine-tune, update, or improve the AI Tool's underlying model, whether by the AI Tool provider or any third party. |

---

## 3. Approved AI Tools

### 3.1 Approved AI Tool Tier Classification

AI Tools are classified into three tiers based on their data handling practices, enterprise controls, and risk profile:

#### Tier 1 — Approved for Production Use

Tier 1 tools may be used for any permitted purpose under Section 4, including work involving Project code, provided Confidential Data is never inputted (Section 6).

| Tool | Permitted Version / Plan | Key Data Handling Assurance |
|------|--------------------------|----------------------------|
| **GitHub Copilot** | Business or Enterprise plan (not Individual plan without DPA review) | Enterprise plan: code snippets not retained beyond session; no Training on Inputs without opt-in |
| **Cursor IDE** | With enterprise-level configuration; API key must route to an approved Tier 1 LLM provider | No Training on Inputs per enterprise terms when configured with API key |
| **Claude Code CLI** | Via Anthropic API key (not via claude.ai consumer interface) | Anthropic API terms explicitly prohibit Training on Inputs from API usage |
| **Microsoft Copilot for GitHub** | With GitHub Enterprise Cloud or GitHub Advanced Security | Data isolated within Microsoft 365 tenant; no Training on Inputs per enterprise agreement |

#### Tier 2 — Conditionally Approved (Restricted Use Only)

Tier 2 tools may only be used for non-confidential, non-Project-specific tasks (e.g., learning exercises, generic code pattern research, publicly available information). They must not be used with any code from the Project Repository or any Confidential Data.

| Tool | Permitted Version | Restrictions |
|------|------------------|--------------|
| **ChatGPT** | Team or Plus plan (not Free plan) | Non-Project code only; no TwinMOS context; Unisoft PM written approval required per use case |
| **Google Gemini** | Workspace (enterprise) plan | Non-Project code only; no TwinMOS context; approval required |
| **Local Open-Source Models** | Llama 3, Mistral, or equivalent running on Unisoft's own hardware | Full local execution with no external API calls; prior disclosure to TwinMOS required |

#### Tier 2 Approval Process

Before using any Tier 2 tool for any Project-adjacent task (even for generic utility functions), Unisoft's Project Manager must:

1. Submit a written request to TwinMOS's Project Manager describing the intended use
2. Receive written approval
3. Log the approval in the AI Usage Log (Section 9.2)

#### Tier 3 — Prohibited AI Tools

The following tools are prohibited for all Project-related use under any circumstances:

| Tool / Category | Reason for Prohibition |
|-----------------|------------------------|
| **ChatGPT Free plan** | Default Training on Inputs; no enterprise data controls |
| **GitHub Copilot Individual plan** | No enterprise data governance controls; potential Training on Inputs |
| **Any AI tool with default Training on Inputs from user data** | Risk of TwinMOS confidential information entering model training datasets |
| **Any unapproved browser extension or IDE plugin that transmits code to external servers** | Uncontrolled data transmission |
| **Claude.ai consumer interface** | No API-level data governance; Training on Inputs applies without paid subscription |
| **Any AI tool with unverifiable data handling practices** | Inability to confirm no Training on Inputs or data retention |

### 3.2 New Tool Approval Process

(a) Unisoft may request approval of additional AI Tools not listed above by submitting a written request to TwinMOS containing:

- Tool name, version, and provider
- Description of intended use
- Provider's data handling policy (evidence that no Training on Inputs occurs)
- Evidence of enterprise or API-level data governance controls

(b) TwinMOS shall review and respond within **10 Business Days** of receipt.

(c) No new AI Tool may be used on the Project until written approval is obtained from TwinMOS.

### 3.3 Tool Version Currency

(a) Unisoft shall ensure that all Tier 1 Approved AI Tools are kept updated to the latest supported version, as security and data handling practices may change between versions.

(b) If a provider makes material changes to an Approved AI Tool's data handling practices (including introducing Training on Inputs), Unisoft shall immediately notify TwinMOS and suspend use of the tool pending re-evaluation.

---

## 4. Permitted Uses

### 4.1 Approved Activities for Tier 1 Tools

Unisoft personnel may use Tier 1 Approved AI Tools for the following activities in connection with the Project, subject always to the prohibitions in Sections 5 and 6:

| Activity | Description |
|----------|-------------|
| **Code Generation** | Auto-completing, suggesting, or generating boilerplate code, utility functions, and standard patterns — where no Confidential Data is involved in the prompt |
| **Code Refactoring** | Suggesting improvements to code structure, readability, and performance |
| **Documentation Generation** | Generating JSDoc comments, README content, API documentation, and technical specifications from code |
| **Test Case Generation** | Creating unit tests, integration test scaffolding, and test data (non-production, non-Personal Data) |
| **Debugging Assistance** | Identifying logical errors in code snippets without disclosing Confidential Data in the prompt |
| **CI/CD Script Generation** | Writing GitHub Actions workflows, deployment scripts, and infrastructure-as-code templates |
| **Code Review Assistance** | Using AI to identify potential bugs, security issues, or code style violations in code review workflows |
| **Learning and Upskilling** | Using AI tools to understand new frameworks, libraries (e.g., Astro 5, Strapi v5), or language features |

### 4.2 Permitted Use Conditions

All permitted uses under Section 4.1 are subject to the following overriding conditions:

(a) Confidential Data as defined in Section 2.1 must never be included in any prompt, query, or input to any AI Tool (Section 6).

(b) All AI-Generated Code must be subject to Human Review (Section 8) before integration into the Project Repository.

(c) All Tier 2 use must be pre-approved by TwinMOS's Project Manager (Section 3.1).

---

## 5. Prohibited Uses

### 5.1 Absolute Prohibitions

The following uses of any AI Tool are absolutely prohibited, regardless of tool tier:

(a) **Inputting TwinMOS Confidential Data into any AI Tool**, including but not limited to:
- TwinMOS product SKU databases, pricing data, or product roadmaps
- Distributor, retailer, or customer contact information
- Business strategy documents, financial records, or competitive analysis materials
- Existing TwinMOS proprietary source code (including legacy website code) for analysis or completion
- Content of any legal agreements, including this Addendum and all documents in the TWN-LEGAL series
- Employee or personnel records

(b) **Inputting Personal Data into any AI Tool**, including:
- Website visitor data, form submissions, or analytics identifiers
- Customer inquiry data received via the website
- Employee or contractor personal information

(c) **Inputting credentials, secrets, or keys into any AI Tool**, including:
- API keys (Cloudflare, GitHub, Sentry, Resend, HubSpot, etc.)
- Database credentials (PostgreSQL connection strings)
- JWT secrets, signing keys, or encryption keys
- SSH private keys or certificates
- Environment variables from .env files

(d) **Using AI-Generated Code in production without Human Review** (Section 8).

(e) **Using a Prohibited AI Tool** for any Project-related purpose (Section 3.3).

(f) **Representing AI-Generated Work as entirely human-authored** in any context where the distinction is material, including in responses to TwinMOS audit requests.

(g) **Using any AI Tool to analyze, summarize, or extract information from Confidential Data** for any purpose, including to assist with contract drafting, legal analysis, or financial modeling involving TwinMOS data.

(h) **Using AI tools to reverse-engineer competitor products** or analyze third-party proprietary code, which could expose TwinMOS to IP infringement claims.

### 5.2 Consequences of Violation

Any breach of Section 5.1 shall constitute:

(a) A material breach of this Addendum and the MSA, triggering TwinMOS's right to terminate under MSA Section 12.2(a)  
(b) An obligation to immediately notify TwinMOS with full details of the breach (Section 6.4)  
(c) Potential liability for damages under MSA Section 11 and NDA Section 7

---

## 6. Confidential Data Protection

### 6.1 Data Classification Before AI Input

(a) Before inputting any code, text, data, or document into an AI Tool, Unisoft personnel must classify the material against the following categories:

| Classification | Description | AI Tool Input |
|----------------|-------------|---------------|
| **Public** | Publicly available information (documentation, open-source code, generic patterns) | Permitted with Tier 1 tools |
| **Internal** | Project code not containing Confidential Data | Permitted with Tier 1 tools; Tier 2 requires approval |
| **Confidential** | TwinMOS Confidential Data as defined in Section 2.1 | Absolutely prohibited in any AI Tool |
| **Regulated** | Personal Data, payment data, or regulated information | Absolutely prohibited in any AI Tool |

(b) When in doubt, material must be classified as **Confidential** and excluded from AI Tool input.

### 6.2 Technical Safeguards

Unisoft shall implement the following technical safeguards to reduce the risk of inadvertent Confidential Data input to AI Tools:

(a) **Repository configuration:** All Project Repository files containing Confidential Data or secrets (including .env files, credential files, database seeds with real data) shall be included in `.gitignore` and `.copilotignore` (or equivalent tool-specific exclusion configuration) to prevent AI tool indexing.

(b) **Secrets scanning:** Unisoft shall configure automated secrets scanning (GitHub Advanced Security, TruffleHog, or equivalent) in the CI/CD pipeline to detect and prevent accidental commitment of credentials.

(c) **Workspace separation:** Development workspaces handling Confidential Data shall have AI Tool autocomplete disabled or restricted to prevent AI tools from reading sensitive file contents.

(d) **Developer training:** All personnel shall receive training on data classification and AI tool input risks (Section 10).

### 6.3 Provider Data Handling Assurances

For each Tier 1 Approved AI Tool, Unisoft must maintain documentary evidence (screenshots, provider policy links, API terms confirmation) demonstrating that:

(a) The tool does not engage in Training on Inputs from API or enterprise-tier usage  
(b) Inputs are not retained by the provider beyond the operational session or as required by the enterprise agreement  
(c) The provider's subprocessors (if any) are bound by equivalent data protection terms

This evidence shall be provided to TwinMOS at project kick-off and updated annually, or within **30 days** of any material change to a provider's policy.

### 6.4 Breach Notification

In the event that Confidential Data or Personal Data is inadvertently submitted to an AI Tool:

(a) Unisoft shall notify TwinMOS in writing within **24 hours** of discovery.  
(b) Notification shall include: nature of the data submitted, AI Tool used, timestamp, likely extent of disclosure, and immediate remediation steps taken or planned.  
(c) Unisoft shall cooperate fully with TwinMOS's assessment of the breach and any required regulatory notifications under the DPA (TWN-LEGAL-DPA-2026-001) and Applicable Laws.  
(d) Such notification does not limit TwinMOS's rights under the NDA, MSA, or Applicable Law.

---

## 7. Intellectual Property Ownership of AI-Generated Work

### 7.1 Assignment of AI-Generated Work Product to TwinMOS

(a) Consistent with MSA Section 7 and the IP Ownership Transfer Agreement (TWN-LEGAL-IP-2026-001), all AI-Generated Work Product created in the course of the Project is assigned to TwinMOS as part of the overall Work Product, subject to the same terms as human-authored work.

(b) The use of an AI Tool in the creation of code or other work product does not affect TwinMOS's ownership claim to that work product. Unisoft irrevocably assigns to TwinMOS all right, title, and interest in all AI-Generated Work Product, to the fullest extent permitted by law.

### 7.2 Copyright Uncertainty — Human Contribution Requirement

(a) The Parties acknowledge that the copyright status of AI-generated content is subject to legal uncertainty in multiple jurisdictions, including the UAE, UK, EU, and USA. Current jurisprudence and regulatory guidance generally require meaningful human creative contribution for copyright to vest.

(b) To ensure that all Project Deliverables have clear copyright ownership by TwinMOS, Unisoft shall ensure that all AI-Generated Code is subject to sufficient **Human Review and meaningful modification** before integration (Section 8.2), such that a qualified developer can attest to meaningful human creative contribution to the final output.

(c) Where AI-Generated Code is used substantially without modification, Unisoft shall document the human creative decisions (architectural choices, prompt engineering, integration decisions) that constitute the human contribution to that work.

### 7.3 No Third-Party IP Contamination

(a) Unisoft warrants that it will not use AI Tools in a manner that introduces third-party intellectual property into the Work Product without appropriate licensing, including code generated by AI Tools that may reproduce or closely derive from third-party copyrighted training data.

(b) Unisoft shall apply judgment and, where necessary, independently implement functionality rather than directly using AI-generated output that appears to reproduce third-party code verbatim or near-verbatim.

(c) Unisoft shall not use AI Tools to generate code from copyleft-licensed models (including models with AGPL-licensed training data constraints) where such use could impose copyleft obligations on TwinMOS's proprietary code.

### 7.4 Unisoft Background IP in AI Tools

(a) AI Tool configurations, prompt templates, workflow scripts, and development methodology developed by Unisoft constitute Unisoft Background IP per MSA Section 7.2, provided they are not specifically created for the Project and do not incorporate TwinMOS Confidential Data.

(b) TwinMOS receives a perpetual, royalty-free license to use any Unisoft Background IP incorporated into the Project's development workflows, consistent with MSA Section 7.2.

---

## 8. Human Review Requirements

### 8.1 Mandatory Human Review

**All AI-Generated Code must undergo Human Review before being committed to the Project Repository or integrated into any Deliverable.** There are no exceptions to this requirement.

### 8.2 Human Review Standards

Human Review of AI-Generated Code must include, at a minimum:

(a) **Functional Understanding:** The reviewing developer must be able to explain what the code does, why it works, and how it integrates with surrounding components — without referring back to the AI tool's output.

(b) **Security Review:** The code must be assessed against OWASP Top 10 risks. Any generated code involving authentication, authorization, input handling, API endpoints, database queries, or data serialization must receive heightened scrutiny.

(c) **Testing:** Unit tests (via Vitest) and integration tests (via Playwright where applicable) must be written and passing for any AI-generated functionality before it is merged to the main branch.

(d) **Performance Review:** AI-generated frontend code must be assessed for impact on Core Web Vitals and the Lighthouse Performance Score targets in SLA Section 5.1.

(e) **Dependency Review:** If AI-generated code introduces new npm/pnpm dependencies, these must be reviewed against the project's dependency policy (no AGPL/SSPL packages; security vulnerability scan required).

### 8.3 Code Review Markers

(a) AI-generated code segments must be marked at the time of initial generation with a code comment indicating AI assistance, for example: `// AI-assisted: [tool name]`. These markers may be removed after Human Review and meaningful modification is documented in the commit history.

(b) Pull request descriptions must note where AI tools contributed substantially to the implementation, to support audit and traceability.

### 8.4 No AI-to-Production Pipeline

Unisoft shall not establish any automated pipeline that deploys AI-Generated Code directly to production (twinmos.com) without human approval at the pull request stage. All deployments to production must pass through the standard review-and-approval process.

---

## 9. Disclosure and Logging Obligations

### 9.1 Disclosure to TwinMOS

(a) Unisoft shall disclose to TwinMOS, upon request and in each Monthly Status Report, a summary of AI tool usage on the Project, including tools used, general categories of use, and any notable changes to usage patterns.

(b) TwinMOS may at any time request a detailed breakdown of AI tool usage for a specific sprint or deliverable.

### 9.2 AI Usage Log

(a) Unisoft shall maintain an **AI Usage Log** throughout the Project, to be updated at least weekly, recording:

| Log Field | Description |
|-----------|-------------|
| **Date** | Date of AI tool usage |
| **Tool Name and Version** | e.g., "GitHub Copilot Business, v1.x" |
| **Developer** | Initials or role of developer |
| **Use Category** | e.g., "Code generation — API controller", "Test case generation — product search" |
| **Tier** | Tier 1 or Tier 2 (with approval reference for Tier 2) |
| **Human Review Performed** | Yes/No; reviewer initials |

(b) The AI Usage Log shall be provided to TwinMOS as an appendix to the Monthly SLA Report (TWN-LEGAL-SLA-2026-001 Section 10.3) and upon any audit request under Section 11.

### 9.3 Pull Request Transparency

Where AI tools contributed substantially (more than ~30% of a pull request's code by functional scope) to a deliverable, the pull request description shall note this. "Substantially" is assessed by the developer's professional judgment — when in doubt, disclose.

---

## 10. Training and Personnel Certification

### 10.1 Pre-Project Training

(a) All Unisoft personnel assigned to the Project must complete an AI Tool Usage Training Programme covering the requirements of this Addendum **before accessing the Project Repository or beginning any Project work**.

(b) Training must cover, at minimum:

| Training Module | Content |
|-----------------|---------|
| **Data Classification** | How to classify code, data, and documents before AI input; the four classification levels (Section 6.1) |
| **Approved vs. Prohibited Tools** | Tier 1, Tier 2, and Tier 3 tools; the approval process for new tools |
| **Prohibited Inputs** | Categories of data that must never be inputted to AI tools (credentials, Confidential Data, Personal Data) |
| **IP Implications** | Why AI-generated code must still be owned by the client; copyright uncertainty and the human contribution requirement |
| **Human Review Standards** | What constitutes adequate Human Review; security review checklist |
| **Breach Response** | What to do if Confidential Data is accidentally submitted to an AI Tool |

### 10.2 Certification

(a) Each Unisoft personnel member must sign a **Certification of Understanding** confirming they have completed the training and understand their obligations under this Addendum before beginning work.

(b) Certifications shall be provided to TwinMOS within **5 Business Days** of project kick-off (or of a new team member joining) and kept on file for the duration of the engagement plus 2 years.

### 10.3 Annual Re-Certification

(a) All Project personnel must re-certify annually, or upon any material update to this Addendum.

(b) Re-certification records shall be included in the annual AI tool usage review (Section 15.1).

### 10.4 New Team Members

Any new Unisoft personnel added to the Project after kick-off must complete the Training Programme and sign the Certification of Understanding before accessing the Project Repository.

---

## 11. Audit Rights

### 11.1 TwinMOS Audit Rights

TwinMOS reserves the right to audit Unisoft's compliance with this Addendum, including:

(a) **Annual Audit:** Once per contract year, with **30 Business Days'** notice, TwinMOS may request:
- The complete AI Usage Log (Section 9.2)
- Personnel Certification records (Section 10.2)
- Evidence of AI tool data handling assurances from providers (Section 6.3)
- Sample pull request history showing AI-assisted code review markers (Section 8.3)

(b) **Ad-Hoc Audit:** In response to a suspected or confirmed breach of this Addendum, TwinMOS may conduct an ad-hoc audit with **5 Business Days'** notice, covering the same scope as an annual audit plus any breach-specific investigation.

### 11.2 Cooperation

Unisoft shall cooperate fully with all audits conducted under Section 11.1, providing requested documentation within **10 Business Days** of request (or as agreed for ad-hoc audits). Unisoft shall not withhold information on the grounds that it would reveal proprietary Unisoft tools or methodology, provided TwinMOS agrees to treat such information as Unisoft Confidential Information under the NDA.

### 11.3 Audit Costs

Annual audit costs are borne by TwinMOS. Ad-hoc audits triggered by a confirmed or suspected breach by Unisoft shall be at Unisoft's cost.

---

## 12. AI Tool Provider Data Handling Verification

### 12.1 Verification at Project Kick-Off

(a) Within **30 days** of the Effective Date, Unisoft shall provide TwinMOS with written documentation confirming the data handling practices of each Tier 1 Approved AI Tool in use, specifically confirming:

- The tool does not engage in Training on Inputs from API or enterprise usage  
- Inputs are not retained beyond the session or as strictly required by the enterprise agreement  
- The relevant provider's enterprise/API terms of service confirm these assurances

(b) This documentation shall be attached as an Exhibit to this Addendum.

### 12.2 Annual Verification

(a) Unisoft shall re-verify provider data handling practices annually and within **30 days** of any AI Tool provider's material policy update.

(b) If a provider's updated policy introduces Training on Inputs or materially weakens data protection assurances, Unisoft shall immediately notify TwinMOS and suspend use of the tool pending re-evaluation and TwinMOS approval.

### 12.3 New Tool Verification

As part of the new tool approval process (Section 3.2), Unisoft shall provide data handling documentation for the proposed tool at the time of approval request.

---

## 13. Regulatory Compliance

### 13.1 Applicable Regulations

Unisoft's use of AI Tools on the Project must comply with all applicable laws and regulations, including:

| Regulation | Key Obligations for AI Tool Usage |
|------------|----------------------------------|
| **UAE Federal Decree-Law No. 45 of 2021 (PDPL)** | No Personal Data of UAE residents may be processed by AI tools without adequate data protection measures; no cross-border transfer of UAE Personal Data to AI tool providers without adequate safeguards |
| **EU General Data Protection Regulation (GDPR)** | No EU/EEA Personal Data in AI prompts; data processing agreements required with AI tool providers handling EU Personal Data; standard contractual clauses required for transfers outside EU/EEA |
| **EU AI Act (Regulation 2024/1689)** | Applies from August 2026; Unisoft must not use AI tools categorized as "high-risk" (per Annex III) for Project purposes without prior TwinMOS approval and a conformity assessment; prohibited AI systems (Annex I) are absolutely barred |
| **India DPDP Act 2023** | No Indian Personal Data in AI prompts without consent and appropriate processing grounds |
| **UAE National AI Strategy 2031** | Unisoft's AI tool usage should align with principles of transparency, accountability, and data protection under UAE AI policy |

### 13.2 No High-Risk AI Systems

(a) Unisoft shall not deploy any AI system classified as "high-risk" under the EU AI Act Annex III, or any AI system with autonomous decision-making capabilities affecting TwinMOS users, without prior written approval from TwinMOS and a formal risk assessment.

(b) AI coding assistants (GitHub Copilot, Cursor, Claude Code CLI) used for developer productivity are not considered high-risk AI systems for the purposes of this clause.

### 13.3 Regulatory Change Monitoring

(a) Unisoft shall monitor regulatory developments related to AI tool usage in the UAE, EU, and other jurisdictions relevant to the Project and notify TwinMOS within **30 days** of any material regulatory change that affects obligations under this Addendum.

(b) This Addendum shall be updated as required by regulatory changes, following the amendment process in Section 15.

---

## 14. Indemnification

### 14.1 Unisoft Indemnification for AI-Related Claims

Unisoft shall indemnify, defend, and hold harmless TwinMOS, its officers, employees, and affiliates from and against any third-party claims, losses, liabilities, costs, and expenses (including reasonable legal fees) arising directly from:

(a) **AI-Generated IP Infringement:** Any claim that AI-Generated Work Product incorporated into the Deliverables infringes a third party's copyright, patent, or other intellectual property right — to the extent such infringement was caused by Unisoft's use of AI Tools rather than by TwinMOS's instructions or TwinMOS-provided materials.

(b) **Prohibited Data Input:** Any claim, regulatory fine, or investigation arising from Unisoft's unauthorized input of TwinMOS Confidential Data or Personal Data into an AI Tool, including any data protection authority investigation or enforcement action.

(c) **Use of Prohibited AI Tool:** Any claim or liability arising from Unisoft's use of a Prohibited AI Tool (Tier 3) or an unapproved Tier 2 tool on the Project.

### 14.2 Conditions for Indemnification

TwinMOS's right to indemnification under Section 14.1 is conditioned upon:

(a) TwinMOS promptly notifying Unisoft in writing of any claim  
(b) TwinMOS granting Unisoft reasonable control over the defense and settlement (provided settlement does not impose obligations on TwinMOS without its written consent)  
(c) TwinMOS cooperating reasonably with Unisoft's defense efforts

### 14.3 Relationship to MSA Indemnification

This Section 14 supplements, and does not replace, the indemnification provisions of MSA Section 11.4 and 11.5.

---

## 15. Review and Amendments

### 15.1 Annual Review

(a) This Addendum shall be formally reviewed **annually** from the Effective Date, reflecting:

- Material changes in the AI tools landscape (new tools, deprecated tools)
- Changes to provider data handling policies
- New or amended regulatory requirements
- Project team feedback on AI tool effectiveness and risks

(b) The annual review shall be conducted jointly by TwinMOS's and Unisoft's Project Managers, with a written summary provided to both Parties within **10 Business Days** of the review.

### 15.2 Amendment Process

(a) Amendments to this Addendum, including changes to the Approved AI Tool list (Section 3), require written agreement signed by authorized representatives of both Parties.

(b) Either Party may propose amendments at any time by written notice. The other Party shall respond within **15 Business Days**.

(c) Emergency amendments (e.g., in response to a critical AI tool data breach or major regulatory development) may be implemented with abbreviated notice by mutual written consent.

### 15.3 Sunset and Replacement

This Addendum may be replaced in its entirety upon mutual written consent of the Parties, including at the time of any MSA renewal or material project scope expansion.

---

## 16. Signatures

IN WITNESS WHEREOF, the Parties have executed this AI Tooling Usage Addendum as of the Effective Date first written above.

**TwinMOS Technologies Middle East FZE**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Witness | | _______________ | _________ |

**Unisoft Solutions Ltd.**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Authorized Signatory | | _______________ | _________ |
| Witness | | _______________ | _________ |

---

**Exhibit A — AI Tool Data Handling Verification**

*[To be completed by Unisoft within 30 days of Effective Date per Section 12.1, with provider documentation confirming no Training on Inputs for each Tier 1 Approved AI Tool]*

| Tool | Provider | Plan/Tier | Data Handling Confirmation | Policy URL | Verification Date |
|------|----------|-----------|---------------------------|------------|-------------------|
| GitHub Copilot | GitHub (Microsoft) | Business/Enterprise | [To be completed] | | |
| Cursor IDE | Anysphere Inc. | [Enterprise config] | [To be completed] | | |
| Claude Code CLI | Anthropic PBC | API (pay-as-you-go) | [To be completed] | | |

---

**Document Control**

| Version | Date | Author | Changes | Approved By |
|---------|------|--------|---------|-------------|
| 0.1 | 1 May 2026 | TwinMOS Legal (Draft) | Initial draft | — |
| 1.0 | [DATE] | — | Final version for execution | — |

**Next Review:** Annually from Effective Date; immediately upon material change to approved tools or regulatory requirements
