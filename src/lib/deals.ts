import { createClient } from "@/lib/supabase/server";
import type { Deal } from "@/db/schema";

/**
 * User-facing deal access. Goes through the Supabase server client, so every
 * query is RLS-scoped to the signed-in user (the ownership guardrail). No manual
 * owner filtering needed — the database enforces it.
 */

export async function listActiveDeals(): Promise<Deal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .is("archived_at", null)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Deal[];
}

export async function getDeal(id: string): Promise<Deal | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as Deal | null) ?? null;
}
