/**
 * Zod schemas for the adaptive `deals.fields` JSONB, chosen by deal_type.
 * Hermes extracts inbox emails into these shapes; the UI renders the matching form.
 * See docs/schema.md → "The `fields` JSONB shape (per deal type)".
 */
import { z } from "zod";

const attachmentRef = z.object({
  storagePath: z.string(),
  name: z.string(),
  mimeType: z.string(),
});

// Shared across all deal types
export const baseFields = z.object({
  hashtags: z.array(z.string()).default([]),
  dos: z.array(z.string()).default([]),
  donts: z.array(z.string()).default([]),
  usageRights: z.string().optional(),         // where / how long content may be used
  exclusivityCategory: z.string().optional(), // pairs with deals.exclusivity_until
  attachments: z.array(attachmentRef).default([]),
  notes: z.string().optional(),
});

// Influencer: reach / platform matter (posting window lives in columns)
export const influencerFields = baseFields.extend({
  expectedReach: z.number().int().optional(),
});

// UGC: usage rights dominate, platform often irrelevant
export const ugcFields = baseFields.extend({
  rawFilesRequired: z.boolean().default(false),
  revisionsIncluded: z.number().int().optional(), // feeds a future Revision Counter
});

// Hybrid: superset of both
export const hybridFields = influencerFields.merge(ugcFields);

export const fieldsSchemaByType = {
  influencer: influencerFields,
  ugc: ugcFields,
  hybrid: hybridFields,
} as const;

export type DealType = keyof typeof fieldsSchemaByType;

/** Validate raw fields against the schema for a given deal type. */
export function parseFields(dealType: DealType, raw: unknown) {
  return fieldsSchemaByType[dealType].parse(raw);
}
