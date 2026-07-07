"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { assetStatus } from "@/db/schema";

function revalidate(deliverableId: string) {
  revalidatePath(`/app/deliverables/${deliverableId}`);
  revalidatePath("/app");
}

export async function uploadAsset(deliverableId: string, formData: FormData) {
  const user = await requireUser();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) throw new Error("Choose a file to upload.");
  if (!file.type.startsWith("image/")) throw new Error("Images only for now (video is a v1.1 fast-follow).");

  const supabase = await createClient();

  // Next version number for this deliverable.
  const { data: latest } = await supabase
    .from("assets")
    .select("version")
    .eq("deliverable_id", deliverableId)
    .order("version", { ascending: false })
    .limit(1);
  const nextVersion = ((latest?.[0]?.version as number | undefined) ?? 0) + 1;

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${user.id}/${deliverableId}/v${nextVersion}-${safeName}`;

  const { error: upErr } = await supabase.storage
    .from("assets")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (upErr) throw upErr;

  const { error } = await supabase.from("assets").insert({
    deliverable_id: deliverableId,
    version: nextVersion,
    storage_path: path,
    mime_type: file.type,
    watermark_applied: formData.get("watermark") === "on",
    uploaded_by: user.id,
  });
  if (error) throw error;

  revalidate(deliverableId);
}

export async function setAssetStatus(
  deliverableId: string,
  assetId: string,
  formData: FormData,
) {
  await requireUser();
  const status = String(formData.get("status") ?? "");
  if (!(assetStatus.enumValues as readonly string[]).includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }
  const supabase = await createClient();

  const { error } = await supabase
    .from("assets")
    .update({ status })
    .eq("id", assetId)
    .eq("deliverable_id", deliverableId);
  if (error) throw error;

  // Reflect the approval decision on the parent deliverable.
  if (status === "approved") {
    await supabase.from("deliverables").update({ status: "approved" }).eq("id", deliverableId);
  } else if (status === "changes_requested") {
    await supabase.from("deliverables").update({ status: "revision_requested" }).eq("id", deliverableId);
  }

  revalidate(deliverableId);
}

const commentInput = z.object({
  posX: z.coerce.number().min(0).max(1),
  posY: z.coerce.number().min(0).max(1),
  body: z.string().min(1, "Comment can't be empty"),
});

export async function addComment(assetId: string, deliverableId: string, formData: FormData) {
  await requireUser();
  const input = commentInput.parse(Object.fromEntries(formData));
  const supabase = await createClient();

  const { error } = await supabase.from("comments").insert({
    asset_id: assetId,
    body: input.body,
    pos_x: input.posX,
    pos_y: input.posY,
  });
  if (error) throw error;
  revalidate(deliverableId);
}

export async function resolveComment(commentId: string, deliverableId: string) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("comments").update({ resolved: true }).eq("id", commentId);
  if (error) throw error;
  revalidate(deliverableId);
}
