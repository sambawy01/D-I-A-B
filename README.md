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
2. ~~Data model + schema design~~ ✅ (docs/schema.md)
3. ~~Scaffold the app~~ ✅ (Next.js + Drizzle + Supabase — boots & builds clean)
4. Build: auth + Deal Card, then the inbox-import "magic moment" wedge

## Getting started

```bash
npm install
cp .env.example .env.local     # fill in Supabase + Anthropic keys

npm run db:push                # create tables from the Drizzle schema
# then apply RLS + triggers:
#   psql "$DATABASE_URL" -f supabase/migrations/0001_init_rls.sql

npm run dev                    # http://localhost:3000
```

Useful scripts: `npm run typecheck`, `npm run build`, `npm run db:generate`, `npm run db:studio`.

### Project layout
- `src/app` — Next.js App Router (UI + API routes)
- `src/db` — Drizzle schema (`schema.ts`), client (`index.ts`), field Zod shapes (`fields.ts`)
- `src/lib/supabase` — auth clients (browser / server / middleware)
- `supabase/migrations` — RLS policies + triggers (applied after Drizzle push)
- `drizzle` — generated SQL migrations
- `docs` — spec, architecture, schema

## Origin

Founded by Hany Sadek and Noor. Built from Noor first-hand experience as both an influencer and a social media marketing manager for brands - the pain of lost briefs, scattered approvals, and chaotic deal management is real and unsolved for solo creators.
