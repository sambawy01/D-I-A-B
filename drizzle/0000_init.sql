CREATE TYPE "public"."asset_status" AS ENUM('draft', 'in_review', 'approved', 'changes_requested');--> statement-breakpoint
CREATE TYPE "public"."deal_stage" AS ENUM('proposal', 'briefed', 'drafting', 'submitted', 'in_review', 'approved', 'posted', 'invoiced', 'paid');--> statement-breakpoint
CREATE TYPE "public"."deal_type" AS ENUM('influencer', 'ugc', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."deliverable_status" AS ENUM('to_produce', 'drafting', 'submitted', 'in_review', 'approved', 'revision_requested');--> statement-breakpoint
CREATE TYPE "public"."message_source" AS ENUM('manual', 'email', 'system');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('unpaid', 'invoiced', 'paid', 'overdue');--> statement-breakpoint
CREATE TYPE "public"."platform" AS ENUM('instagram', 'tiktok', 'youtube', 'facebook', 'other');--> statement-breakpoint
CREATE TABLE "assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deliverable_id" uuid NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"storage_path" text NOT NULL,
	"mime_type" text NOT NULL,
	"status" "asset_status" DEFAULT 'draft' NOT NULL,
	"watermark_applied" boolean DEFAULT false NOT NULL,
	"uploaded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" uuid NOT NULL,
	"author_id" uuid,
	"body" text NOT NULL,
	"pos_x" numeric,
	"pos_y" numeric,
	"timestamp_seconds" numeric,
	"resolved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deal_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" uuid NOT NULL,
	"author_id" uuid,
	"changes" jsonb NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"title" text NOT NULL,
	"brand_name" text,
	"deal_type" "deal_type" DEFAULT 'influencer' NOT NULL,
	"stage" "deal_stage" DEFAULT 'proposal' NOT NULL,
	"platforms" "platform"[],
	"currency" char(3) DEFAULT 'EUR' NOT NULL,
	"amount_total_minor" integer,
	"payment_status" "payment_status" DEFAULT 'unpaid' NOT NULL,
	"payment_due_date" date,
	"posting_window_start" date,
	"posting_window_end" date,
	"exclusivity_until" date,
	"fields" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"source_email_ref" text,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deliverables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"platform" "platform",
	"status" "deliverable_status" DEFAULT 'to_produce' NOT NULL,
	"due_date" date,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" uuid NOT NULL,
	"author_id" uuid,
	"source" "message_source" DEFAULT 'manual' NOT NULL,
	"body" text NOT NULL,
	"external_ref" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"display_name" text,
	"handle" text,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_deliverable_id_deliverables_id_fk" FOREIGN KEY ("deliverable_id") REFERENCES "public"."deliverables"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_uploaded_by_profiles_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal_revisions" ADD CONSTRAINT "deal_revisions_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal_revisions" ADD CONSTRAINT "deal_revisions_author_id_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_owner_id_profiles_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_author_id_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assets_deliverable_idx" ON "assets" USING btree ("deliverable_id");--> statement-breakpoint
CREATE INDEX "comments_asset_idx" ON "comments" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX "deal_revisions_deal_idx" ON "deal_revisions" USING btree ("deal_id");--> statement-breakpoint
CREATE INDEX "deals_owner_idx" ON "deals" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "deals_owner_stage_idx" ON "deals" USING btree ("owner_id","stage");--> statement-breakpoint
CREATE INDEX "deals_owner_payment_due_idx" ON "deals" USING btree ("owner_id","payment_due_date");--> statement-breakpoint
CREATE INDEX "deliverables_deal_idx" ON "deliverables" USING btree ("deal_id");--> statement-breakpoint
CREATE INDEX "deliverables_due_date_idx" ON "deliverables" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "messages_deal_idx" ON "messages" USING btree ("deal_id");