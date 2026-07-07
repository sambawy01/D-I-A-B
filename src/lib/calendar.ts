import { createClient } from "@/lib/supabase/server";
import { listActiveDeals } from "@/lib/deals";
import { formatMoney } from "@/lib/format";
import type { Deliverable } from "@/db/schema";

export type CalEventKind =
  | "deliverable_due"
  | "payment_due"
  | "posting_start"
  | "posting_end"
  | "exclusivity_end";

export type CalEvent = {
  date: string; // YYYY-MM-DD
  kind: CalEventKind;
  label: string;
  dealId: string;
  dealTitle: string;
};

/**
 * Every dated event across the user's active deals — a view, no new tables.
 * Sources: deal payment due, posting window start/end, exclusivity expiry, and
 * each unfinished deliverable's due date. RLS scopes everything to the owner.
 */
export async function listCalendarEvents(): Promise<CalEvent[]> {
  const deals = await listActiveDeals();
  const events: CalEvent[] = [];

  for (const d of deals) {
    if (d.paymentDueDate)
      events.push({
        date: d.paymentDueDate,
        kind: "payment_due",
        label: `Payment due — ${formatMoney(d.amountTotalMinor, d.currency)}`,
        dealId: d.id,
        dealTitle: d.title,
      });
    if (d.postingWindowStart)
      events.push({ date: d.postingWindowStart, kind: "posting_start", label: "Posting window starts", dealId: d.id, dealTitle: d.title });
    if (d.postingWindowEnd)
      events.push({ date: d.postingWindowEnd, kind: "posting_end", label: "Posting window ends", dealId: d.id, dealTitle: d.title });
    if (d.exclusivityUntil)
      events.push({ date: d.exclusivityUntil, kind: "exclusivity_end", label: "Exclusivity ends", dealId: d.id, dealTitle: d.title });
  }

  const activeIds = deals.map((d) => d.id);
  if (activeIds.length) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("deliverables")
      .select("*")
      .in("deal_id", activeIds);
    if (error) throw error;

    const titleByDeal = new Map(deals.map((d) => [d.id, d.title]));
    for (const dl of (data ?? []) as Deliverable[]) {
      if (dl.dueDate && dl.status !== "approved") {
        events.push({
          date: dl.dueDate,
          kind: "deliverable_due",
          label: `${dl.title} due`,
          dealId: dl.dealId,
          dealTitle: titleByDeal.get(dl.dealId) ?? "",
        });
      }
    }
  }

  events.sort((a, b) => a.date.localeCompare(b.date));
  return events;
}

export const KIND_BADGE: Record<CalEventKind, string> = {
  deliverable_due: "Deliverable",
  payment_due: "Payment",
  posting_start: "Posting ▶",
  posting_end: "Posting ■",
  exclusivity_end: "Exclusivity",
};
