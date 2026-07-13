import { createClient } from "@/lib/supabase/server";
import { listActiveDeals } from "@/lib/deals";
import { formatMoney, todayISO } from "@/lib/format";
import type { Deliverable } from "@/db/schema";

export type Nudge = {
  id: string;
  severity: "overdue" | "soon";
  text: string;
  dealId: string;
  dealTitle: string;
};

const SOON_DAYS = 3;
const EXCLUSIVITY_DAYS = 14;

function daysUntil(dateStr: string): number {
  const today = new Date(todayISO() + "T00:00:00Z").getTime();
  const d = new Date(dateStr + "T00:00:00Z").getTime();
  return Math.round((d - today) / 86400000);
}
function rel(n: number): string {
  if (n === 0) return "today";
  if (n > 0) return `in ${n} day${n === 1 ? "" : "s"}`;
  return `${-n} day${n === -1 ? "" : "s"} ago`;
}

/**
 * Proactive nudges derived on-read from the creator's own data (RLS-scoped) —
 * overdue/soon deliverables, payments, exclusivity expiry, posting windows.
 * Deterministic and instant: no eventing system, no LLM cost.
 */
export async function computeNudges(): Promise<Nudge[]> {
  const deals = await listActiveDeals();
  const nudges: Nudge[] = [];

  for (const d of deals) {
    // Payment
    if (d.paymentStatus !== "paid" && d.paymentDueDate) {
      const n = daysUntil(d.paymentDueDate);
      const money = formatMoney(d.amountTotalMinor, d.currency);
      if (n < 0)
        nudges.push({ id: `pay-${d.id}`, severity: "overdue", dealId: d.id, dealTitle: d.title, text: `Payment overdue — ${d.title} (${money}, due ${rel(n)})` });
      else if (n <= SOON_DAYS)
        nudges.push({ id: `pay-${d.id}`, severity: "soon", dealId: d.id, dealTitle: d.title, text: `Payment due ${rel(n)} — ${d.title} (${money})` });
    } else if (d.paymentStatus === "overdue") {
      nudges.push({ id: `pay-${d.id}`, severity: "overdue", dealId: d.id, dealTitle: d.title, text: `Payment marked overdue — ${d.title}` });
    }

    // Exclusivity expiry
    if (d.exclusivityUntil) {
      const n = daysUntil(d.exclusivityUntil);
      if (n >= 0 && n <= EXCLUSIVITY_DAYS)
        nudges.push({ id: `excl-${d.id}`, severity: "soon", dealId: d.id, dealTitle: d.title, text: `${d.title} exclusivity ends ${rel(n)}` });
    }

    // Posting window start
    if (d.postingWindowStart) {
      const n = daysUntil(d.postingWindowStart);
      if (n >= 0 && n <= SOON_DAYS)
        nudges.push({ id: `post-${d.id}`, severity: "soon", dealId: d.id, dealTitle: d.title, text: `${d.title} posting window starts ${rel(n)}` });
    }
  }

  // Deliverables (unfinished)
  const ids = deals.map((d) => d.id);
  if (ids.length) {
    const supabase = await createClient();
    const { data } = await supabase.from("deliverables").select("*").in("deal_id", ids);
    const titleBy = new Map(deals.map((d) => [d.id, d.title]));
    for (const dl of (data ?? []) as Deliverable[]) {
      if (dl.status === "approved" || !dl.dueDate) continue;
      const n = daysUntil(dl.dueDate);
      const title = titleBy.get(dl.dealId) ?? "";
      if (n < 0)
        nudges.push({ id: `dl-${dl.id}`, severity: "overdue", dealId: dl.dealId, dealTitle: title, text: `“${dl.title}” overdue — ${title} (due ${rel(n)})` });
      else if (n <= SOON_DAYS)
        nudges.push({ id: `dl-${dl.id}`, severity: "soon", dealId: dl.dealId, dealTitle: title, text: `“${dl.title}” due ${rel(n)} — ${title}` });
    }
  }

  // Overdue first, then soon.
  nudges.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "overdue" ? -1 : 1));
  return nudges;
}
