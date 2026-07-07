import { createClient } from "@/lib/supabase/server";
import type { Asset, Comment } from "@/db/schema";

/** Asset versions for a deliverable, newest version first. */
export async function listAssets(deliverableId: string): Promise<Asset[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .eq("deliverable_id", deliverableId)
    .order("version", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Asset[];
}

/** A short-lived signed URL for a private storage object. */
export async function signedUrl(storagePath: string, expiresIn = 3600): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from("assets").createSignedUrl(storagePath, expiresIn);
  if (error) return null;
  return data.signedUrl;
}

/** Comments on an asset, oldest first. */
export async function listComments(assetId: string): Promise<Comment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("asset_id", assetId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Comment[];
}
