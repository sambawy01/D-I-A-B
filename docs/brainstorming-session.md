# DIAB — Brainstorming Session
## July 6, 2025

**Participants:** Hany Sadek, Noor (co-founder), Hermes AI

---

## Session Flow

### 1. Initial Concept (Noor)

Noor described the core problem from personal experience working as both an influencer and a social media marketing manager for a brand:

- Creators juggle brand deals across Instagram, TikTok, YouTube, Facebook
- Briefs buried in email, content scattered across tabs, approvals messy
- As a brand manager, she would forget which influencer she was emailing because she was emailing so many
- Wanted a platform where everything is organized in one place
- Platform should also send proposals to brands for potential brand deals
- Brand-to-influencer discovery would come later (down the line)

### 2. Scope Decision: Campaign Management vs Management Platform

**Question:** Should this be an influencer campaign management platform or a broader influencer management platform?

**Decision:** Start narrow with campaign management (deals, briefs, approvals, deliverables, deadlines). The pain is deal-shaped, not platform-shaped. Existing tools (Buffer, Later, Hootsuite) solve content scheduling. No tool nails the deal lifecycle for solo creators.

**Positioning:** Campaign management with a thin content-calendar layer on top for daily stickiness. Marketplace is a later phase.

### 3. Breakdown Point Identified

**Where does the deal break down most?** Noor: All of them. Brief getting lost, approval round-trip, forgetting deadlines. The real problem is the deal has no single source of truth, so information decays at every handoff.

### 4. Hero Features Defined

1. Structured Brief (living object, not PDF, fields adapt by deal type)
2. Inbox Auto-Import (Gmail via Composio, scans 90 days, drafts deal cards)
3. Dual-View (creator side + brand side of the same deal)
4. Visual Asset Approval (inline comments on video, like Google Docs for video)

### 5. Dashboard vs AI Assistant Decision

**Question:** Should this be a dashboard or a personal AI assistant?

**Decision:** Build both. Dashboard is the backbone (source of truth). AI assistant is the front door (low-friction access). The AI proposes, the human confirms. Structured core, AI surface.

### 6. Proactive vs Reactive AI

**Question:** Should the assistant be proactive (nudges you) or reactive (you ask, it answers)?

**Decision (implied):** Both. Reactive for queries and drafting. Proactive for nudges (overdue approvals, deadlines, payments). Never acts without confirmation.

### 7. Deal Types

**Question:** Serving influencers, UGC creators, or both?

**Decision:** Both. Deal card is a flexible type: Influencer, UGC, Hybrid. Fields adapt per type. Influencer deal: platform + posting window + reach matter. UGC deal: usage rights dominate, platform often irrelevant. Hybrid: both views.

### 8. Brand Interaction Modes

**Question:** How does the brand interact?

**Decision:** Let the creator choose per deal:
- Full user (own dashboard, manages multiple creators)
- Guest link (no login, one deal only)
- Email-only (assistant emails brand, parses replies back into deal)

### 9. Approach Selection

Three approaches presented:
- A: Deal Hub only (dashboard, no AI)
- B: Deal Hub + AI Copilot (dashboard + assistant)
- C: AI-First (assistant leads, thin dashboard)

**Decision:** Approach B. Dashboard provides trust, AI provides magic. Aligns with Farasa.AI thesis of AI agents as digital employees.

### 10. Features Logged

31 features total across 3 phases:

**MVP (19 features):** Structured Deal Card, Inbox Auto-Import, Dual-View, Visual Asset Approval, Deal Kanban, Deliverable Checklist, Payment Tracker, Auto-Generated Contract, Media Kit, Brand Guest Link, Brand Full User View, Email-Only Brand Mode, Communication Thread, AI Copilot Reactive, AI Copilot Proactive, Exclusivity Tracker, Revision Counter, Cross-Deal Calendar, Content Watermark.

**Phase 2 (8 features):** Rate Intelligence, Income and Tax Dashboard, Asset Library, Brief Templates, Performance Reports, Book Again Flow, Platform API Integration, Brand-to-Creator Marketplace.

**Phase 3 (4 features):** Brand Verification and Scam Alert, Team Mode, Brand Multi-Creator View, Usage Rights Tracker and Upsell.

### 11. Revenue Model

**Phase 1:** Creator SaaS subscription
- Free: 0/month (2 deals, manual entry)
- Pro: 25/month (unlimited, AI copilot, inbox import, contracts, media kit, payment tracker)
- Team: 59/month (team mode, asset library, performance reports, manager access)

**Phase 2:** Add Brand SaaS (149-399/month)

**Phase 3:** Verification and data moat monetization

**Unit Economics:** ARPU 25, CAC 15-40, LTV 350, LTV/CAC 11.7x, payback 1.4 months.

**Not doing:** Transaction fees on deals, marketplace fee until supply exists, ad-supported free tier, enterprise pricing.

### 12. Naming

Extensive naming exploration:
- Celebrity-directed names (Entourage, Spotlight, Marquee, Headliner, etc.)
- 4-letter functional names (PACT, SWAY, DEAL, etc.)
- 4-letter acronyms where each letter means something (PACT, PAID, CALM, CAMP, DECK)
- Creative/invented 4-letter names (VOXX, KLYN, QIRA, SVRN, PLYR)

**Final Decision:** DIAB — Deals for Influencers and Brands

**Note:** DIAB has a potential diablo/devil association in Latin languages, but in Arabic it is a common surname (meaning wolf). The acronym maps perfectly to the product. Hany decided to lock it.

---

## Key Decisions Summary

| Decision | Choice |
|---|---|
| Product scope | Campaign management (not broad management platform) |
| Architecture approach | B: Dashboard + AI Copilot |
| AI mode | Both proactive and reactive |
| Deal types | Influencer + UGC + Hybrid |
| Brand interaction | Creator chooses: full user / guest link / email-only |
| Name | DIAB |
| Revenue model | Creator SaaS first, Brand SaaS later |
| Open questions | Architecture, company structure, target market, pilot users |

---

## Open Questions for Next Session

1. Architecture and tech stack (Noor will discuss separately)
2. Company structure: Farasa.AI product or separate company?
3. Target market: MENA first or global from day one?
4. First pilot users: specific creators or persona?
5. Brand onboarding flow details
6. Contract legal enforceability by jurisdiction
7. Data privacy compliance (creator + brand data)
