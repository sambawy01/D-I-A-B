"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { dealStage, paymentStatus, platform } from "@/db/schema";
import type { HermesProposal } from "@/lib/hermes/types";

/**
 * Executes a Hermes proposal AFTER the creator clicks Confirm. This is the only
 * place a Hermes-originated write happens — the model never touches the DB. All
 * writes go through the RLS-scoped Supabase session, so the deal must belong to
 * the signed-in user.
 */
export async function confirmHermesAction(
  p: HermesProposal,
): Promise<{ ok: boolean; message: string }> {
  await requireUser();
  const supabase = await createClient();
  const a = p.args ?? {};
  const dealId = p.dealId;

  try {
    switch (p.action) {
      case "set_stage": {
        const stage = String(a.stage ?? "");
        if (!(dealStage.enumValues as readonly string[]).includes(stage))
          return { ok: false, message: `Invalid stage: ${stage}` };
        const { error } = await supabase.from("deals").update({ stage }).eq("id", dealId);
        if (error) throw error;
        return finish(dealId, `Moved to ${stage.replace("_", " ")}.`);
      }
      case "set_payment_status": {
        const st = String(a.paymentStatus ?? "");
        if (!(paymentStatus.enumValues as readonly string[]).includes(st))
          return { ok: false, message: `Invalid payment status: ${st}` };
        const { error } = await supabase.from("deals").update({ payment_status: st }).eq("id", dealId);
        if (error) throw error;
        return finish(dealId, `Payment status set to ${st}.`);
      }
      case "add_deliverable": {
        const title = String(a.title ?? "").trim();
        if (!title) return { ok: false, message: "Deliverable needs a title." };
        const plat =
          typeof a.platform === "string" && (platform.enumValues as readonly string[]).includes(a.platform)
            ? a.platform
            : null;
        const due = typeof a.dueDate === "string" && a.dueDate ? a.dueDate : null;
        const { error } = await supabase
          .from("deliverables")
          .insert({ deal_id: dealId, title, platform: plat, due_date: due });
        if (error) throw error;
        return finish(dealId, `Added deliverable “${title}”.`);
      }
      case "draft_message": {
        const body = String(a.body ?? "").trim();
        if (!body) return { ok: false, message: "Nothing to save." };
        const { error } = await supabase
          .from("messages")
          .insert({ deal_id: dealId, source: "system", body });
        if (error) throw error;
        return finish(dealId, "Saved to the deal's thread.");
      }
      default:
        return { ok: false, message: "Unknown action." };
    }
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

function finish(dealId: string, message: string): { ok: boolean; message: string } {
  revalidatePath("/app");
  revalidatePath(`/app/deals/${dealId}`);
  return { ok: true, message };
}
