"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { parseFields, type DealType } from "@/db/fields";
import { dealStage, paymentStatus } from "@/db/schema";

// Empty string → undefined, so optional fields clear cleanly.
const optionalStr = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  z.string().optional(),
);

const dealInput = z.object({
  title: z.string().min(1, "Title is required"),
  brandName: optionalStr,
  dealType: z.enum(["influencer", "ugc", "hybrid"]),
  currency: z.string().length(3).default("EUR"),
  amountMajor: z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number().nonnegative().optional(),
  ),
  paymentDueDate: optionalStr,
  postingWindowStart: optionalStr,
  postingWindowEnd: optionalStr,
  exclusivityUntil: optionalStr,
  notes: optionalStr,
});

function rowFromInput(input: z.infer<typeof dealInput>) {
  const fields = parseFields(input.dealType as DealType, { notes: input.notes });
  return {
    title: input.title,
    brand_name: input.brandName ?? null,
    deal_type: input.dealType,
    currency: input.currency.toUpperCase(),
    amount_total_minor:
      input.amountMajor == null ? null : Math.round(input.amountMajor * 100),
    payment_due_date: input.paymentDueDate ?? null,
    posting_window_start: input.postingWindowStart ?? null,
    posting_window_end: input.postingWindowEnd ?? null,
    exclusivity_until: input.exclusivityUntil ?? null,
    fields,
  };
}

export async function createDeal(formData: FormData) {
  const user = await requireUser();
  const input = dealInput.parse(Object.fromEntries(formData));
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("deals")
    .insert({ owner_id: user.id, ...rowFromInput(input) })
    .select("id")
    .single();
  if (error) throw error;
  if (!data) throw new Error("Insert returned no row");

  revalidatePath("/app");
  redirect(`/app/deals/${data.id}`);
}

export async function updateDeal(id: string, formData: FormData) {
  await requireUser();
  const input = dealInput.parse(Object.fromEntries(formData));
  const supabase = await createClient();

  const { error } = await supabase.from("deals").update(rowFromInput(input)).eq("id", id);
  if (error) throw error;

  revalidatePath("/app");
  revalidatePath(`/app/deals/${id}`);
  redirect(`/app/deals/${id}`);
}

export async function setStage(id: string, formData: FormData) {
  await requireUser();
  const stage = String(formData.get("stage") ?? "");
  if (!(dealStage.enumValues as readonly string[]).includes(stage)) {
    throw new Error(`Invalid stage: ${stage}`);
  }
  const supabase = await createClient();

  const { error } = await supabase.from("deals").update({ stage }).eq("id", id);
  if (error) throw error;

  revalidatePath("/app");
  revalidatePath(`/app/deals/${id}`);
}

export async function setPaymentStatus(id: string, formData: FormData) {
  await requireUser();
  const status = String(formData.get("paymentStatus") ?? "");
  if (!(paymentStatus.enumValues as readonly string[]).includes(status)) {
    throw new Error(`Invalid payment status: ${status}`);
  }
  const supabase = await createClient();

  const { error } = await supabase.from("deals").update({ payment_status: status }).eq("id", id);
  if (error) throw error;

  revalidatePath("/app");
  revalidatePath(`/app/deals/${id}`);
}

export async function archiveDeal(id: string) {
  await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("deals")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;

  revalidatePath("/app");
  redirect("/app");
}
