/**
 * Drizzle client — TRUSTED server access.
 *
 * ⚠️ This connection uses the Postgres role and BYPASSES Row-Level Security.
 * Use it for migrations, trusted server jobs (Inngest workers), and admin logic
 * where you scope by owner in code.
 *
 * For user-facing reads/writes that must honor the ownership guardrail, go
 * through the Supabase server client (src/lib/supabase/server.ts) — it carries
 * the user's JWT, so RLS applies. Hermes's DB tools run through that path.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// prepare:false is required for Supabase's transaction-mode connection pooler.
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
export { schema };
