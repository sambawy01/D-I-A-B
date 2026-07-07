"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { deliverableStatus, platform } from "@/db/schema";

const optionalStr = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  z.string().optional(),
);

const addInput = z.object({
  title: z.string().min(1, "Title is required"),
  description: optionalStr,
  platform: optionalStr,
  dueDate: optionalStr,
});

function revalidate(dealId: string) {
  revalidatePath(`/app/deals/${dealId}`);
  revalidatePath("/app");
}

export async function addDeliverable(dealId: string, formData: FormData) {
  await requireUser();
  const input = addInput.parse(Object.fromEntries(formData));
  const plat =
    input.platform && (platform.enumValues as readonly string[]).includes(input.platform)
      ? input.platform
      : null;

  const supabase = await createClient();
  const { error } = await supabase.from("deliverables").insert({
    deal_id: dealId,
    title: input.title,
    description: input.description ?? null,
    platform: plat,
    due_date: input.dueDate ?? null,
  });
  if (error) throw error;
  revalidate(dealId);
}

export async function setDeliverableStatus(
  dealId: string,
  deliverableId: string,
  formData: FormData,
) {
  await requireUser();
  const status = String(formData.get("status") ?? "");
  if (!(deliverableStatus.enumValues as readonly string[]).includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("deliverables")
    .update({ status })
    .eq("id", deliverableId)
    .eq("deal_id", dealId);
  if (error) throw error;
  revalidate(dealId);
}

export async function deleteDeliverable(dealId: string, deliverableId: string) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("deliverables")
    .delete()
    .eq("id", deliverableId)
    .eq("deal_id", dealId);
  if (error) throw error;
  revalidate(dealId);
}
