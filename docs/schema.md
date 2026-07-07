# DIAB — Data Model & Schema

**Date:** July 7, 2025
**Status:** Draft for review. Targets Postgres (Supabase) + Drizzle ORM. Covers the 6-feature MVP.

See `architecture.md` for the stack and `design-spec.md` for the features.

---

## Entity overview

```
profiles (= auth user)
   │ owns
   ▼
 deals ──────────< deal_revisions      (negotiation diffs: the card IS the record)
   │  │
   │  └──────────< messages            (communication thread: manual / email / system)
   │ has
   ▼
 deliverables ───< assets ───< comments
 (Production        (image      (positioned comments;
  Tracker)           versions)   timestamp added for video in v1.1)
```

Payment lives **on the deal** (terms + owed/paid/overdue flag), per the design decision — no separate payments table in MVP.

The **Calendar** is a read-only view over dates already stored here: deliverable `due_date`, deal `payment_due_date`, `posting_window_*`, `exclusivity_until`. No new tables.

---

## Conventions

- **PK:** `uuid` default `gen_random_uuid()`.
- **Timestamps:** `timestamptz`, default `now()`. `updated_at` maintained by a `moddatetime` trigger (Supabase extension) — not in app code.
- **Money:** integer **minor units** (`amount_total_minor`, e.g. cents) + `char(3)` currency. Never floats.
- **Dates without time** (deadlines, windows): `date`.
- **Adaptive Deal Card fields:** first-class columns for anything we filter/sort/query (stage, dates, money, brand, type, platforms); everything else (hashtags, do's/don'ts, usage rights, attachment refs, free-form notes) in a `fields jsonb`.
- **RLS on every table**, scoped to the owning user — this enforces the "can't access deals you don't own" guardrail at the database layer.

---

## Enums

```ts
import { pgEnum } from "drizzle-orm/pg-core";

export const dealType = pgEnum("deal_type", ["influencer", "ugc", "hybrid"]);

// Kanban pipeline (design-spec order)
export const dealStage = pgEnum("deal_stage", [
  "proposal", "briefed", "drafting", "submitted",
  "in_review", "approved", "posted", "invoiced", "paid",
]);

export const paymentStatus = pgEnum("payment_status", [
  "unpaid", "invoiced", "paid", "overdue",
]);

export const deliverableStatus = pgEnum("deliverable_status", [
  "to_produce", "drafting", "submitted", "in_review",
  "approved", "revision_requested",
]);

export const assetStatus = pgEnum("asset_status", [
  "draft", "in_review", "approved", "changes_requested",
]);

export const platform = pgEnum("platform", [
  "instagram", "tiktok", "youtube", "facebook", "other",
]);

export const messageSource = pgEnum("message_source", [
  "manual", "email", "system",
]);
```

---

## Tables (Drizzle)

```ts
import {
  pgTable, uuid, text, integer, numeric, boolean, char, date,
  timestamp, jsonb, index,
} from "drizzle-orm/pg-core";

// profiles.id === auth.users.id (Supabase). App-level user data lives here.
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // FK to auth.users(id), added via SQL migration
  displayName: text("display_name"),
  handle: text("handle"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Pillar 1 — the Deal Card (payment folded in)
export const deals = pgTable("deals", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  brandName: text("brand_name"),
  dealType: dealType("deal_type").notNull().default("influencer"),
  stage: dealStage("stage").notNull().default("proposal"),
  platforms: platform("platforms").array(),
  // Payment (folded into the card)
  currency: char("currency", { length: 3 }).notNull().default("EUR"),
  amountTotalMinor: integer("amount_total_minor"),
  paymentStatus: paymentStatus("payment_status").notNull().default("unpaid"),
  paymentDueDate: date("payment_due_date"),
  // Dates the Calendar renders
  postingWindowStart: date("posting_window_start"),
  postingWindowEnd: date("posting_window_end"),
  exclusivityUntil: date("exclusivity_until"),
  // Adaptive fields (hashtags, dos/donts, usage rights, notes, attachment refs)
  fields: jsonb("fields").notNull().default({}),
  // Provenance when auto-imported by Hermes
  sourceEmailRef: text("source_email_ref"),
  archivedAt: timestamp("archived_at", { withTimezone: true }), // soft delete — null = active
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  ownerIdx: index("deals_owner_idx").on(t.ownerId),
  ownerStageIdx: index("deals_owner_stage_idx").on(t.ownerId, t.stage),
  ownerPaymentDueIdx: index("deals_owner_payment_due_idx").on(t.ownerId, t.paymentDueDate),
}));

// Negotiation record — field-level diffs. The card IS the negotiation log.
// Logged for NEGOTIATED TERMS ONLY (amount, deliverables, usage rights,
// exclusivity, deadlines) — not every field edit — to keep the log signal-rich.
export const dealRevisions = pgTable("deal_revisions", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealId: uuid("deal_id").notNull().references(() => deals.id, { onDelete: "cascade" }),
  authorId: uuid("author_id").references(() => profiles.id),
  changes: jsonb("changes").notNull(), // { field: { from, to } }
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  dealIdx: index("deal_revisions_deal_idx").on(t.dealId),
}));

// Pillar 3 — Production Tracker
export const deliverables = pgTable("deliverables", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealId: uuid("deal_id").notNull().references(() => deals.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  platform: platform("platform"),
  status: deliverableStatus("status").notNull().default("to_produce"),
  dueDate: date("due_date"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  dealIdx: index("deliverables_deal_idx").on(t.dealId),
  dueDateIdx: index("deliverables_due_date_idx").on(t.dueDate),
}));

// Pillar 3 — Inline Asset Approval (image-first; version chain per deliverable)
export const assets = pgTable("assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  deliverableId: uuid("deliverable_id").notNull().references(() => deliverables.id, { onDelete: "cascade" }),
  version: integer("version").notNull().default(1),
  storagePath: text("storage_path").notNull(), // Supabase Storage key
  mimeType: text("mime_type").notNull(),        // image/* in MVP; video/* in v1.1
  status: assetStatus("status").notNull().default("draft"),
  watermarkApplied: boolean("watermark_applied").notNull().default(false),
  uploadedBy: uuid("uploaded_by").references(() => profiles.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  deliverableIdx: index("assets_deliverable_idx").on(t.deliverableId),
}));

// Positioned comments on an asset (video adds timestampSeconds in v1.1)
export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  assetId: uuid("asset_id").notNull().references(() => assets.id, { onDelete: "cascade" }),
  authorId: uuid("author_id").references(() => profiles.id),
  body: text("body").notNull(),
  posX: numeric("pos_x"), // 0..1 normalized (image); null for general comment
  posY: numeric("pos_y"),
  timestampSeconds: numeric("timestamp_seconds"), // v1.1 video
  resolved: boolean("resolved").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  assetIdx: index("comments_asset_idx").on(t.assetId),
}));

// Communication thread (auto-logged from inbox in later phase; manual/system now)
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealId: uuid("deal_id").notNull().references(() => deals.id, { onDelete: "cascade" }),
  authorId: uuid("author_id").references(() => profiles.id), // null = system/email
  source: messageSource("source").notNull().default("manual"),
  body: text("body").notNull(),
  externalRef: text("external_ref"), // email message id, etc.
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  dealIdx: index("messages_deal_idx").on(t.dealId),
}));
```

---

## Row-Level Security (the ownership guardrail)

Enable RLS on every table; scope to the authenticated user. Child tables authorize by walking up to the owning deal. Run as SQL migrations (Drizzle doesn't manage RLS).

```sql
-- profiles: a user sees only their own row
alter table profiles enable row level security;
create policy profiles_self on profiles
  using (id = auth.uid()) with check (id = auth.uid());

-- deals: owner-scoped
alter table deals enable row level security;
create policy deals_owner on deals
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- direct children of deals (deliverables, deal_revisions, messages)
alter table deliverables enable row level security;
create policy deliverables_via_deal on deliverables
  using (exists (select 1 from deals d where d.id = deal_id and d.owner_id = auth.uid()))
  with check (exists (select 1 from deals d where d.id = deal_id and d.owner_id = auth.uid()));

alter table deal_revisions enable row level security;
create policy deal_revisions_via_deal on deal_revisions
  using (exists (select 1 from deals d where d.id = deal_id and d.owner_id = auth.uid()))
  with check (exists (select 1 from deals d where d.id = deal_id and d.owner_id = auth.uid()));

alter table messages enable row level security;
create policy messages_via_deal on messages
  using (exists (select 1 from deals d where d.id = deal_id and d.owner_id = auth.uid()))
  with check (exists (select 1 from deals d where d.id = deal_id and d.owner_id = auth.uid()));

-- assets: authorize through deliverable → deal
alter table assets enable row level security;
create policy assets_via_deal on assets
  using (exists (
    select 1 from deliverables dl join deals d on d.id = dl.deal_id
    where dl.id = deliverable_id and d.owner_id = auth.uid()))
  with check (exists (
    select 1 from deliverables dl join deals d on d.id = dl.deal_id
    where dl.id = deliverable_id and d.owner_id = auth.uid()));

-- comments: authorize through asset → deliverable → deal
alter table comments enable row level security;
create policy comments_via_deal on comments
  using (exists (
    select 1 from assets a
      join deliverables dl on dl.id = a.deliverable_id
      join deals d on d.id = dl.deal_id
    where a.id = asset_id and d.owner_id = auth.uid()))
  with check (exists (
    select 1 from assets a
      join deliverables dl on dl.id = a.deliverable_id
      join deals d on d.id = dl.deal_id
    where a.id = asset_id and d.owner_id = auth.uid()));
```

> **Note on nested-join policies:** the `assets`/`comments` policies do a 2–3 table walk on every access. Indexes on the FK columns (present above) keep this cheap at MVP scale. If it ever shows up in profiling, denormalize `owner_id` onto `assets`/`comments` and scope directly — a deliberate later optimization, not an MVP concern.

Hermes runs under the **user's** session (its DB queries pass through these same policies), so the copilot physically cannot read another user's deals even if prompted to.

---

## How the 6 features map

| Feature | Tables |
|---------|--------|
| ① Deal Card (+ payment) | `deals` (+ `dealRevisions` for the negotiation diff log) |
| ② Inbox Auto-Import | writes `deals` (+ `deliverables`) with `sourceEmailRef`; drafts confirmed before insert |
| ③ Hermes Copilot | reads all tables via RLS-scoped tools; writes gated behind confirm |
| ④ Cross-Deal Calendar (+ Kanban) | view over `deals.stage` + all the `date` columns — no new tables |
| ⑤ Production Tracker | `deliverables` |
| ⑥ Inline Asset Approval (image-first) | `assets` + `comments` |

**Calendar query shape** (owner-scoped, index-backed): union of `deliverables.due_date`, `deals.payment_due_date`, `deals.posting_window_*`, `deals.exclusivity_until` — color-coded by deal, conflict detection = group by date.

---

## The `fields` JSONB shape (per deal type)

`fields` is validated in the app with a Zod schema chosen by `deal_type`, so Hermes
extracts into a known structure and the UI renders the right form. Shared keys plus
type-specific keys:

```ts
// Shared across all types
const baseFields = z.object({
  hashtags: z.array(z.string()).default([]),
  dos: z.array(z.string()).default([]),
  donts: z.array(z.string()).default([]),
  usageRights: z.string().optional(),      // where/how long content may be used
  exclusivityCategory: z.string().optional(), // pairs with deals.exclusivity_until
  attachments: z.array(z.object({           // refs in `fields` for MVP (see below)
    storagePath: z.string(), name: z.string(), mimeType: z.string(),
  })).default([]),
  notes: z.string().optional(),
});

// Influencer: platform + posting window + reach matter (window lives in columns)
const influencerFields = baseFields.extend({
  expectedReach: z.number().int().optional(),
});

// UGC: usage rights dominate, platform often irrelevant
const ugcFields = baseFields.extend({
  rawFilesRequired: z.boolean().default(false),
  revisionsIncluded: z.number().int().optional(), // feeds a future Revision Counter
});

// Hybrid: superset of both
const hybridFields = influencerFields.merge(ugcFields);
```

Keep negotiated *money* and *dates* in first-class columns (queryable); keep the
descriptive brief in `fields`.

---

## Resolved decisions (July 7, 2025)

1. **Soft delete:** ✅ Added `archived_at` to `deals` (null = active). Queries filter
   `archived_at is null` by default; gives creators a recoverable trash instead of
   an unforgiving cascade delete. Child rows stay put and are hidden with the parent.
2. **Revision granularity:** ✅ Log **negotiated terms only** — `amount_total_minor`,
   deliverables, usage rights, exclusivity, deadlines — not every field edit. Keeps
   the negotiation log high-signal.
3. **`fields` shape:** ✅ Defined above — one Zod schema per `deal_type`.
4. **Currency:** ✅ **Per-deal** from day one (`currency` column, default `EUR`).
   Creators work across borders; the column already supports it at no extra cost.
5. **Attachments:** ✅ **Refs inside `fields`** for MVP (see `attachments` above).
   Promote to a dedicated table only when the v2 cross-deal Asset Library needs it.
