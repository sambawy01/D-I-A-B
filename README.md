# DIAB — Deals for Influencers and Brands

> Campaign management platform for influencers, UGC creators, and hybrid creators.
> Structured deal records + AI copilot. The AI proposes, the human confirms.

---

## Quick Links

- Design Spec: docs/design-spec.md
- Architecture & Tech Stack: docs/architecture.md
- Data Model & Schema: docs/schema.md
- Brainstorming Session: docs/brainstorming-session.md

## Status

Phase: MVP scoped + stack decided. 6 features across 3 pillars (Deals & Negotiation, Calendar, Content Asset Production). Stack: TypeScript full-stack (Next.js + Supabase + Claude API). See docs/architecture.md.

### MVP (6 features)
- **Deals & Negotiation:** Structured Deal Card (payment folded in), Inbox Auto-Import, Hermes Copilot
- **Calendar:** Cross-Deal Calendar (+ Kanban board view)
- **Content Production & Handling:** Production Tracker, Inline Asset Approval (the hero)

Everything else lives in the v2 backlog (see design spec).

Next steps:
1. Noor reviews the scoped MVP + stack
2. Data model + schema design
3. Implementation plan / milestone breakdown
4. Build (start with the inbox-import "magic moment" wedge)

## Origin

Founded by Hany Sadek and Noor. Built from Noor first-hand experience as both an influencer and a social media marketing manager for brands - the pain of lost briefs, scattered approvals, and chaotic deal management is real and unsolved for solo creators.
