/**
 * DIAB data model — see docs/schema.md for the design rationale.
 * Postgres (Supabase) + Drizzle. RLS policies live in supabase/migrations/0001_init_rls.sql.
 */
import {
  pgTable, pgEnum, uuid, text, integer, numeric, boolean, char, date,
  timestamp, jsonb, index,
} from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

// ── Enums ────────────────────────────────────────────────────────────────────
export const dealType = pgEnum("deal_type", ["influencer", "ugc", "hybrid"]);

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

// ── Tables ───────────────────────────────────────────────────────────────────

// profiles.id === auth.users.id (FK added in the RLS migration).
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
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
  // Adaptive fields (validated per deal_type — see src/db/fields.ts)
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

// Negotiation record — negotiated TERMS only (amount, deliverables, usage rights,
// exclusivity, deadlines), not every field edit. Keeps the log high-signal.
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
  posX: numeric("pos_x"), // 0..1 normalized (image); null for a general comment
  posY: numeric("pos_y"),
  timestampSeconds: numeric("timestamp_seconds"), // v1.1 video
  resolved: boolean("resolved").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  assetIdx: index("comments_asset_idx").on(t.assetId),
}));

// Communication thread (auto-logged from inbox later; manual/system now)
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealId: uuid("deal_id").notNull().references(() => deals.id, { onDelete: "cascade" }),
  authorId: uuid("author_id").references(() => profiles.id), // null = system/email
  source: messageSource("source").notNull().default("manual"),
  body: text("body").notNull(),
  externalRef: text("external_ref"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  dealIdx: index("messages_deal_idx").on(t.dealId),
}));

// ── Inferred row / insert types ──────────────────────────────────────────────
export type Profile = InferSelectModel<typeof profiles>;
export type Deal = InferSelectModel<typeof deals>;
export type NewDeal = InferInsertModel<typeof deals>;
export type Deliverable = InferSelectModel<typeof deliverables>;
export type Asset = InferSelectModel<typeof assets>;
export type Comment = InferSelectModel<typeof comments>;
export type DealStage = (typeof dealStage.enumValues)[number];
export type PaymentStatus = (typeof paymentStatus.enumValues)[number];
