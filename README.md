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

### MVP build status (6 features)
- **Deals & Negotiation:** ✅ Deal Card (CRUD, payment, stage/Kanban) · ✅ Hermes Copilot (reactive, read-only) · ⏳ Inbox Auto-Import (paste fallback + Gmail via Composio — gated on Google OAuth verification)
- **Calendar:** ✅ Cross-Deal Calendar (+ Kanban board view)
- **Content Production & Handling:** ✅ Production Tracker · ✅ Inline Asset Approval (image-first, positioned comments, versions, watermark)

Everything else lives in the v2 backlog (see design spec).

Next steps:
1. Spin up a Supabase project + Anthropic key, run migrations, and exercise the app end-to-end
2. Hermes write-actions behind the confirm gate (draft proposals / follow-ups)
3. Inbox Auto-Import: paste-an-email → Hermes extraction → deal draft (unblocked); wire live Gmail once OAuth verification lands
4. Negotiation diff logging on deal term edits (deal_revisions)

## Getting started

```bash
npm install
cp .env.example .env.local     # fill in Supabase + Anthropic keys

npm run db:push                # create tables from the Drizzle schema
# then apply RLS + triggers, then the storage bucket + policies:
#   psql "$DATABASE_URL" -f supabase/migrations/0001_init_rls.sql
#   psql "$DATABASE_URL" -f supabase/migrations/0002_storage.sql

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
