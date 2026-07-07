# DIAB — Architecture & Tech Stack

**Date:** July 7, 2025
**Status:** Stack decided. MVP = 6 features across 3 pillars (see design-spec.md).

---

## Guiding principle

Small founding team, €21/user target margin. **Buy the hard parts; build only what's differentiated** — the deal model, negotiation diffs, the approval UX, and Hermes orchestration. Everything else is a managed service so the team ships fast and runs almost no infra.

---

## Decisions (locked July 7, 2025)

- **Language:** TypeScript, full-stack (one language end to end).
- **Content approval:** **Image-first** for MVP. Video (the "Google-Docs-for-video" hero) is a v1.1 fast-follow — this removes video infrastructure from the MVP entirely.
- **Market:** Global from day one, on region-agnostic managed services.

---

## The Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| **Framework** | **Next.js (App Router) + TypeScript** | UI + API routes in one codebase; deploy on Vercel |
| **Database** | **Postgres via Supabase** | Relational core + **JSONB** for type-adaptive Deal Card fields |
| **ORM** | **Drizzle** | Type-safe, SQL-first (Prisma acceptable if the team prefers max DX) |
| **Auth** | **Supabase Auth + Row-Level Security** | RLS enforces "can't access deals you don't own" *at the DB layer* — the AI guardrail becomes a hard database rule, not just prompt logic |
| **File storage** | **Supabase Storage** (MVP) | Images only for now — one fewer vendor. Add **Cloudflare R2** (zero egress) when video lands |
| **Video** | **Deferred to v1.1** → Mux or Cloudflare Stream | When it arrives, buy the managed video API; build only the timestamped-comment layer |
| **Background jobs** | **Inngest** | "Scan inbox" workflows + cron for calendar-sourced nudges; retries built in, no Redis to run |
| **Email send** | **Resend** | Hermes outbound + nudge emails |
| **Billing** | **Stripe** | €25 Pro subscription |
| **Gmail (+ future socials)** | **Composio** | Handles Gmail OAuth + tool execution |
| **AI** | **Claude API** | See Hermes section |
| **Hosting** | **Vercel** + managed services above | Near-zero ops for a small team |
| **Analytics** | **PostHog** | Instrument the activation funnel around the inbox-import "magic moment" |

---

## Hermes (the AI copilot)

**Surface: Claude API + tool use, manual agentic loop** — not Anthropic's Managed Agents (no hosted compute/sandbox needed).

**Why the manual loop:** it lets us gate write-actions, which is how "Hermes proposes, the human confirms" becomes real code rather than a prompt instruction:

- **Read tools** (query deals, list overdue, get payment status) → execute freely.
- **Write tools** (send email, draft proposal, update card) → the loop returns a *proposed action*; the UI renders a confirm button; nothing commits until the creator approves.

**Models (current pricing, verified July 2025):**

| Task | Model | Rationale |
|------|-------|-----------|
| Inbox extraction (high volume) | **Claude Sonnet 5** ($2/$10 per 1M, intro through 2026-08-31) | Structured output (JSON schema) on email text; volume → protect margin |
| Copilot Q&A + negotiation drafting | **Claude Opus 4.8** ($5/$25 per 1M) | Quality where it matters; route routine calls to Sonnet 5 |

**Cost controls (essential for the €21 margin):**
- **Prompt caching** the deal schema + system prompt cuts repeat-call input cost ~90%.
- Model per-user AI token cost against real usage before locking the €25 price.
- **No vector DB in MVP** — Hermes queries *structured* data via tools, not semantic search. Add pgvector only when/if the cross-deal Asset Library search ships.

---

## Screens → data model sketch (MVP)

- **Deal** (JSONB `fields` adapt by type: Influencer/UGC/Hybrid) + payment terms + owed/paid flag + term-diff history
- **Deliverable** (belongs to Deal; status, deadline) — powers Production Tracker + Calendar
- **Asset** (belongs to Deliverable; image, version, status, watermark flag) — powers Inline Image Approval
- **Comment** (belongs to Asset; for image: `{x, y, note}`; for video later: `+timestamp`)
- **Message/thread** (deal communication log)
- **User** + RLS scoping every table by owner

Every date the **Calendar** renders (posting windows, deliverable deadlines, payment dates) already lives on Deal/Deliverable — the calendar is a *view*, not new plumbing.

---

## Key risks to track (carried from the design spec)

- **Gmail restricted-scope OAuth** needs Google's CASA security assessment — slow, costs money, annual re-cert. Start the timeline now; it gates the magic moment. Build a manual-paste fallback + per-field confirm UX for imperfect extraction.
- **AI margin** — model token cost against real usage before committing to €25.
- **Defensibility beyond "we have AI"** — every competitor is adding it; lean on email-only brand mode + the brand-reputation data moat (later phases).

---

## Deferred to later (not MVP)

Video approval (v1.1: Mux/Stream + R2), Cloudflare R2, pgvector/semantic search, the two-sided brand layer (guest links, brand accounts, email-only mode), contracts/e-sign, platform API integrations — all per the design-spec v2 backlog.
