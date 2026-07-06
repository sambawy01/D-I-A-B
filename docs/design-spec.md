# DIAB — Deals for Influencers and Brands
## Design Spec

**Date:** July 6, 2025
**Status:** Brainstorming — feature log complete, architecture TBD
**Decision:** Approach B (Deal Hub + AI Copilot)

---

## Product Concept

A campaign management platform for influencers, UGC creators, and hybrid creators. Solves the "no single source of truth" problem — briefs lost in email, approvals scattered across tabs, deadlines missed, payments untracked.

**Core positioning:** Structured deal records (dashboard backbone) + AI copilot (primary interface). The AI proposes, the human confirms.

**Deal types supported:** Influencer, UGC, Hybrid (adaptive deal card fields per type).

**Brand interaction modes:** Full user (own dashboard), Guest link (no login), Email-only (assistant parses replies). Creator chooses per deal.

---

## Feature Log

### Hero Features (MVP — the wedge)

| # | Feature | Description | Phase |
|---|---|---|---|
| 1 | **Structured Deal Card** | The brief as a living object, not a PDF. Fields adapt by deal type (Influencer/UGC/Hybrid): deliverables, platform(s), posting window, hashtags, do's/don'ts, usage rights, exclusivity, payment terms, attachments. Both creator and brand see the same card. Edits show diffs. | MVP |
| 2 | **Inbox Auto-Import** | Connect Gmail (via Composio). Assistant scans last 90 days, detects brand-deal emails, extracts fields, drafts deal cards for creator to confirm. The magic moment — platform goes from empty to populated in 30 seconds. | MVP |
| 3 | **Dual-View (Creator + Brand)** | Same deal data, two lenses. Brand view shows creator profile card (face, handle, platforms, past deals, total earned) — solves "forgetting which influencer I was emailing." Creator view shows brand history with them. | MVP |
| 4 | **Visual Asset Approval** | Creator uploads draft (video/image). Brand views inline, drops timestamped comments, approves or requests changes. Like Google Docs suggestions for video. No more "send me the latest version." | MVP |

### Stickiness Features (MVP — daily-open reasons)

| # | Feature | Description | Phase |
|---|---|---|---|
| 5 | **Deal Kanban** | Proposal → Briefed → Drafting → Submitted → In Review → Approved → Posted → Invoiced → Paid. One glance, both sides see where every deal sits. | MVP |
| 6 | **Deliverable Checklist** | Per-deal checklist tracking each deliverable: status, deadline, asset preview, approval thread. Auto-flags overdue items. | MVP |
| 7 | **Payment Tracker** | What's owed, what's paid, what's overdue. Auto-generate invoices from deal terms. Payment history per deal. | MVP |
| 8 | **Auto-Generated Contract** | Contract auto-generated from structured brief fields. Both parties e-sign in-platform. Downloadable PDF. Version history. | MVP |
| 9 | **Media Kit** | Auto-generated, always-current, shareable link. Pulls live stats from connected platforms (followers, engagement, top posts, audience demographics). Past deals (show/hide toggle). Starting rates. Contact button. Replaces the PDF creators remake constantly. | MVP |
| 10 | **Brand Guest Link** | Brand views/approves one deal without an account. Limited to that deal + creator's media kit. Zero friction for cold or one-off brand relationships. | MVP |
| 11 | **Brand Full User View** | Brand manager logs in, sees all active deals with creators, creator profile cards, can approve/comment/sign/track payments. Cannot edit brief without creator's diff-and-confirm approval. | MVP |
| 12 | **Email-Only Brand Mode** | Assistant emails brand on creator's behalf. Brand replies via email → assistant parses reply → updates deal card → notifies creator. Brand never touches the platform. | MVP |
| 13 | **Communication Thread** | Threaded conversation auto-logged from inbox integration. Every email exchange, platform action, and approval is timestamped and visible in the deal card. No more digging through email. | MVP |
| 14 | **AI Copilot (Reactive)** | Floating chat from any screen. "What's left on the Adidas deal?" → answers from deal records. "Draft a proposal to Nescafé" → drafts, creator confirms. Never invents deal data — queries DB, presents what's there. | MVP |
| 15 | **AI Copilot (Proactive)** | Nudges: "Puma brief due in 2 days," "Adidas hasn't approved in 3 days — follow up?" "L'Oréal payment 14 days overdue." Never acts without confirmation. | MVP |

### Trust & Safety Features (MVP)

| # | Feature | Description | Phase |
|---|---|---|---|
| 16 | **Exclusivity Tracker** | Tracks which brand locked which category, when exclusivity expires. Alerts when a new deal conflicts with an active exclusivity ("⚠️ Active Adidas exclusivity until Aug 15 — can't take this Nike deal yet"). | MVP |
| 17 | **Revision Counter** | Tracks revisions per deliverable vs. revisions included in contract. Flags when limit exceeded: "4 revisions done, 2 included — send revision-fee invoice for extra 2 (€150 each)?" Protects creator income. | MVP |
| 18 | **Cross-Deal Calendar** | Unified calendar across all deals: content due dates, posting windows, exclusivity expiry, payment due dates, contract signing deadlines. Color-coded by deal. Spots conflicts ("3 deliverables due July 18 — negotiate one"). | MVP |
| 19 | **Content Watermark** | Drafts uploaded for approval get visible watermark + metadata: "Draft — for approval — [creator] — [date]." Prevents brands screenshotting unapproved content. | MVP |

### Revenue & Career Features (Phase 2)

| # | Feature | Description | Phase |
|---|---|---|---|
| 20 | **Rate Intelligence** | AI suggests pricing based on follower count, engagement, platform, deal type, market data. "For 2 Reels + 1 Story at 120k IG, typical range €1,800–2,400. You charged €1,500 last time — go higher?" Turns platform from tracking to career growth. | Phase 2 |
| 21 | **Income & Tax Dashboard** | Monthly/quarterly/yearly income breakdown. CSV export for accountant. Tax estimate by country. "Uninvoiced" alert. Category tags (content vs UGC vs consultation). Seasonal buying moment (tax season). | Phase 2 |
| 22 | **Asset Library** | Cross-deal searchable library of all uploaded drafts, approved finals, raw files, brand assets. "Show me all approved Reels from 2025." "Find that L'Oréal b-roll." No more "where did I save that file?" | Phase 2 |
| 23 | **Brief Templates** | Creator saves reusable brief templates ("Standard influencer brief," "UGC deliverables," "Ramadan template"). Assistant detects missing brief fields and offers to send brand a template to fill gaps. | Phase 2 |
| 24 | **Performance Reports** | After posting, assistant pulls metrics (views, engagement, reach, saves, shares) from platform APIs. Auto-generates campaign report creator sends to brand. Brands love it → rebookings. Most creators post and ghost — this differentiates. | Phase 2 |
| 25 | **"Book Again" Flow** | 30 days post-campaign, assistant nudges: "Adidas deal ended 30 days ago. Performance was 32% above benchmark. Want me to send a rebooking proposal?" Drafts proposal referencing last results. Automated business development. | Phase 2 |

### Platform Integration Features (Phase 2)

| # | Feature | Description | Phase |
|---|---|---|---|
| 26 | **Platform API Integration** | Meta Graph, TikTok, YouTube APIs for: media kit analytics, post verification (auto-confirm content was posted on time), performance report data. | Phase 2 |

### Marketplace Features (Phase 2)

| # | Feature | Description | Phase |
|---|---|---|---|
| 27 | **Brand → Creator Discovery** | Brands browse creator media kits, filter by audience/engagement/niche, send proposals. Inverts the direction. Only launch when creator supply is sufficient. | Phase 2 |

### Trust & Collaboration Features (Phase 3)

| # | Feature | Description | Phase |
|---|---|---|---|
| 28 | **Brand Verification & Scam Alert** | Reputation database: brands rated by creators (payment speed, communication, fairness). Verified brand checkmark (domain/business registration). "3 unresolved payment complaints" warning. Data moat — hard to replicate. | Phase 3 |
| 29 | **Team Mode** | Creator invites manager/agent/assistant with role-based permissions. Manager drafts proposals (creator sends), manager uploads content (creator approves). For scaling creators. Higher willingness to pay. | Phase 3 |
| 30 | **Brand Multi-Creator View** | Brand side dashboard: all active deals across all creators, filter by campaign, bulk actions (approve 5 assets, send brief to 10 creators), creator comparison (best engagement for this campaign?). Turns brand from guest to paying customer. | Phase 3 |
| 31 | **Usage Rights Tracker + Upsell** | Tracks where content can be used, for how long, territory. When brand wants extended usage, assistant prompts creator: "Brand wants website rights — that's +30%." Built-in upsell mechanism. | Phase 3 |

---

## Revenue Model

### Phase 1 (MVP): Creator SaaS

| Tier | Price | What they get |
|---|---|---|
| Free | €0/month | Up to 2 active deals, basic deal cards, manual entry |
| Pro | €25/month | Unlimited deals, inbox auto-import, AI copilot, contracts, media kit, payment tracker, exclusivity tracker, revision counter, cross-deal calendar, content watermark |
| Team | €59/month | Everything in Pro + team mode, asset library, performance reports, manager access, brief templates |

Annual billing: 2 months free (€250/year Pro, €590/year Team).

### Phase 2: Add Brand SaaS

| Tier | Price | What they get |
|---|---|---|
| Brand Basic | €149/month | Discovery, proposals, single campaign management |
| Brand Pro | €399/month | Multi-creator, bulk actions, performance reports, API access |

### Phase 3: Add Verification & Data Moat

- Verified brand status (brand pays)
- Premium brand safety reports (creator pays)
- Add-on services (contract e-sign €2–5/contract, media kit premium €9/month, tax export €29/year, priority AI €10/month)

### Unit Economics (Conservative)

- ARPU: €25/month (mostly Pro)
- CAC: €15–40
- Monthly margin: €21 (after AI + infra costs)
- LTV at 6% churn: €350
- LTV/CAC: ~11.7x
- Payback: ~1.4 months

### What we DON'T do

- No transaction fee on deals (creators route around it)
- No marketplace fee until supply exists
- No ad-supported free tier (erodes trust in a money tool)
- No enterprise pricing (no brand volume yet)

---

## AI Copilot Guardrails

| Can do | Cannot do |
|---|---|
| Read deal status, summarize what needs attention | Invent deal terms not in DB |
| Draft proposals, follow-ups, contracts | Approve content on behalf of creator |
| Auto-import deals from inbox (draft, not confirm) | Send emails without creator confirmation |
| Proactive nudges | Modify payment amounts |
| Answer queries in natural language | Access deals the user doesn't own |

**Rule: the AI proposes, the human confirms.** Every write action shows what will change, creator approves.

---

## Screens Summary

1. **Onboarding** — connect inbox (magic moment: auto-import deals), connect social accounts
2. **Dashboard** — "Today" summary bar (assistant), Deal Kanban, Payment Snapshot
3. **Deal Card** — tabbed: Brief / Deliverables / Approvals / Payments / Contract / Communication
4. **AI Copilot** — floating chat, reactive + proactive, accessible from any screen
5. **Media Kit** — auto-generated, shareable, always-current
6. **Brand View** (full user) — all deals, creator profile cards, approve/comment/sign
7. **Brand Guest Link** — single deal view, no login, approve/comment/sign
8. **Email-Only Mode** — assistant emails brand, parses replies into deal card

---

## Open Questions (to resolve before implementation)

- [ ] Architecture & tech stack (deferred — Noor will discuss separately)
- [ ] Company structure: Farasa.AI product or separate company?
- [ ] Target market: MENA first or global from day one?
- [ ] First pilot users: specific creators or persona?
- [ ] Brand onboarding flow details
- [ ] Contract legal enforceability by jurisdiction
- [ ] Data privacy compliance (creator + brand data)