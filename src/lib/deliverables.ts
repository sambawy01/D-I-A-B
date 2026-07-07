import { createClient } from "@/lib/supabase/server";
import type { Deliverable } from "@/db/schema";

/** A single deliverable by id (RLS-scoped through its parent deal). */
export async function getDeliverable(id: string): Promise<Deliverable | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deliverables")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as Deliverable | null) ?? null;
}

/** Deliverables for a deal, RLS-scoped through the parent deal's owner. */
export async function listDeliverables(dealId: string): Promise<Deliverable[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deliverables")
    .select("*")
    .eq("deal_id", dealId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Deliverable[];
}
