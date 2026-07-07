# DIAB — Deals for Influencers and Brands
## Design Spec

**Date:** July 6, 2025 (MVP scope revised July 7, 2025)
**Status:** MVP scoped — 6 features across 3 pillars. Architecture TBD.
**Decision:** Approach B (Deal Hub + Hermes Copilot)

---

## Product Concept

A campaign management platform for influencers, UGC creators, and hybrid creators. Solves the "no single source of truth" problem — briefs lost in email, approvals scattered across tabs, deadlines missed, payments untracked.

**Core positioning:** Structured deal records (dashboard backbone) + Hermes AI copilot (primary interface). Hermes proposes, the human confirms.

**ICP:** The creator middle class — ~10k–500k followers, semi-professional, running 2–15 deals a month with no agent and no team. They feel the pain acutely *and* must solve it themselves. (Not celebrities/mega-influencers — those are represented by agencies and never touch a self-serve dashboard; serving their *management teams* is a separate, later company shape.)

**Deal types supported:** Influencer, UGC, Hybrid (adaptive deal card fields per type).

---

## The Three Pillars

DIAB does three things. Every MVP feature serves one of them:

1. **Deals & Negotiation** — land, structure, and negotiate the terms of a deal
2. **Calendar** — the time layer that ties every deadline, window, and due date together
3. **Content Asset Production & Handling** — produce, version, approve, and store the actual content

The MVP is a **complete single-player loop**: a deal lands in Gmail → Hermes structures it into a card → you negotiate terms (diffs) → track deadlines on the calendar → produce and get assets approved inline → Hermes answers questions and nudges you the whole way. No two-sided complexity, no e-sign/legal surface, no platform-API dependency in v1.

---

## MVP Feature Log (6 features)

### Pillar 1 — Deals & Negotiation

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Structured Deal Card** | The brief as a living object, not a PDF. Fields adapt by deal type (Influencer/UGC/Hybrid): deliverables, platform(s), posting window, hashtags, do's/don'ts, usage rights, exclusivity, payment terms, attachments. Term edits show **diffs** — the card *is* the negotiation record. **Payment folds in here:** payment terms + owed/paid/overdue flag live on the card (tracking, not processing). |
| 2 | **Inbox Auto-Import** | Connect Gmail (via Composio). Hermes scans recent brand-deal emails, extracts fields, and drafts deal cards for the creator to confirm. The magic moment — platform goes from empty to populated in ~30 seconds. Requires manual-paste fallback + per-field confirm UX to survive imperfect extraction. |
| 3 | **Hermes Copilot** | Floating chat from any screen. **Reactive:** answers over the deal DB ("what's left on the Adidas deal?", "who owes me money?", "what's due this week?"). **Negotiation:** drafts proposals and counter-offers. **Proactive (light):** nudges sourced directly from the Calendar's overdue/upcoming data — no separate eventing system in v1. Guardrail: proposes, never commits; every send waits for confirm. |

### Pillar 2 — Calendar

| # | Feature | Description |
|---|---------|-------------|
| 4 | **Cross-Deal Calendar** | One timeline across all deals: content due dates, posting windows, payment due dates, exclusivity expiry. Color-coded by deal, flags conflicts ("3 deliverables due July 18"). Cheap to build — renders date data already held by features 1/5. The **Kanban board** (Proposal → Briefed → Drafting → Submitted → In Review → Approved → Posted → Paid) rides along as the pipeline/board sibling view. |

### Pillar 3 — Content Asset Production & Handling

| # | Feature | Description |
|---|---------|-------------|
| 5 | **Production Tracker** | Per-deal deliverable tracking: what needs producing, status (to-produce → drafting → submitted → approved), deadline, asset preview. Auto-flags overdue items (which surface on the Calendar and as Hermes nudges). |
| 6 | **Inline Asset Approval** | The hero feature — "Google Docs for creative." **MVP is image-first:** creator uploads an image draft; brand views inline and drops **positioned comments**, then approves or requests changes. Includes **versioning** ("v1/v2/v3", no more "send me the latest") and a **draft watermark** ("Draft — for approval — [creator] — [date]"). **Video approval (timestamped comments) is a v1.1 fast-follow** — deferring it removes video infrastructure from the MVP entirely. See architecture.md. |

---

## v2 Backlog (deferred — not in MVP)

Deferred deliberately to keep the MVP a buildable single-player loop. Grouped by the pillar they extend.

**Deals & Negotiation:** Auto-Generated Contract + e-sign, Rate Intelligence (pricing suggestions), Revision Counter, Brief Templates, standalone Payment Tracker + auto-invoicing, Income & Tax Dashboard.

**Brand collaboration (the two-sided layer):** Dual-View (creator + brand lenses), Brand Guest Link, Brand Full User View, Email-Only Brand Mode, Communication Thread (auto-logged from inbox).

**Content:** Cross-deal searchable Asset Library, Media Kit (auto-generated, live stats).

**Growth & platform:** Performance Reports, "Book Again" flow, Platform API Integration (Meta/TikTok/YouTube), Exclusivity Tracker (standalone), Usage Rights Tracker + Upsell.

**Later phases:** Brand → Creator Marketplace/Discovery, Brand Verification & Scam Alert (data moat — needs a dispute process + counsel before shipping), Team Mode, Brand Multi-Creator View.

---

## Revenue Model

### Phase 1 (MVP): Creator SaaS

| Tier | Price | What they get |
|---|---|---|
| Free | €0/month | Up to 2 active deals, basic deal cards, manual entry |
| Pro | €25/month | Unlimited deals, inbox auto-import, Hermes copilot, cross-deal calendar, production tracker, inline asset approval |
| Team | €59/month | Everything in Pro + team mode, asset library, performance reports (v2 features) |

Annual billing: 2 months free (€250/year Pro, €590/year Team).

> **Margin watch:** Hermes does inbox parsing + drafting + nudges. Model per-user AI token cost against real usage before committing to the €25 price / €21 stated margin.

### Phase 2: Add Brand SaaS

| Tier | Price | What they get |
|---|---|---|
| Brand Basic | €149/month | Discovery, proposals, single campaign management |
| Brand Pro | €399/month | Multi-creator, bulk actions, performance reports, API access |

### Phase 3: Verification & data moat

Verified brand status (brand pays), premium brand-safety reports (creator pays), add-on services (e-sign, media-kit premium, tax export, priority AI).

### What we DON'T do

No transaction fee on deals (creators route around it), no marketplace fee until supply exists, no ad-supported free tier (erodes trust in a money tool), no enterprise pricing yet.

> **Open reconsideration:** payment *processing* (Stripe/Lumanu model) is stronger retention glue than payment *tracking*. Revisit as a v2 monetization path even though transaction fees are off the table.

---

## Hermes Copilot Guardrails

| Can do | Cannot do |
|---|---|
| Read deal status, summarize what needs attention | Invent deal terms not in DB |
| Draft proposals, counter-offers, follow-ups | Approve content on behalf of creator |
| Auto-import deals from inbox (draft, not confirm) | Send emails without creator confirmation |
| Proactive nudges (from calendar data) | Modify payment amounts |
| Answer queries in natural language | Access deals the user doesn't own |

**Rule: Hermes proposes, the human confirms.** Every write action shows what will change; the creator approves.

---

## Screens Summary (MVP)

1. **Onboarding** — connect Gmail (magic moment: auto-import deals). Social-account connect deferred (needs platform APIs — v2).
2. **Dashboard** — "Today" bar (Hermes), Deal Kanban board, payment snapshot (from Deal Card flags).
3. **Deal Card** — tabbed: Brief / Terms (+ payment) / Production / Approvals / negotiation diffs.
4. **Hermes Copilot** — floating chat, reactive + light proactive, from any screen.
5. **Calendar** — cross-deal timeline; toggles with the Kanban board view.
6. **Asset Approval** — inline video/image player, timestamped comments, version history, draft watermark.

---

## Open Questions (to resolve before implementation)

- [ ] Architecture & tech stack (deferred — Noor will discuss separately)
- [ ] Company structure: Farasa.AI product or separate company? *(Foundational — changes funding/hiring/infra reuse; resolve before build.)*
- [ ] Target market: MENA first (Arabic-friendly name, Noor's network, less competition, lower tooling spend) or global (Passionfroot/Beacons already there)?
- [ ] First pilot users: specific creators or persona within the creator middle class?
- [ ] Gmail restricted-scope OAuth: start Google CASA security assessment timeline now (slow + costly + annual re-cert) — it gates the magic moment.
- [ ] Data privacy compliance (creator + brand data)
- [ ] Defensibility beyond "we have AI" (every competitor is adding it) — strongest candidates: email-only brand mode + brand-reputation data moat.
