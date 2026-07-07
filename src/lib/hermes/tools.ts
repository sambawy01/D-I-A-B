import type Anthropic from "@anthropic-ai/sdk";
import { listActiveDeals, getDeal } from "@/lib/deals";
import { listDeliverables } from "@/lib/deliverables";
import { listCalendarEvents } from "@/lib/calendar";
import { formatMoney } from "@/lib/format";

/**
 * Hermes's READ tools. Each runs against the user's RLS-scoped Supabase session,
 * so the copilot can only ever see the signed-in creator's own data — it cannot
 * read another user's deals even if prompted to. Write actions (draft proposal,
 * send email) are a later increment and will route through a human confirm gate.
 */
export const HERMES_TOOLS: Anthropic.Tool[] = [
  {
    name: "list_deals",
    description:
      "List the creator's active deals. Optionally filter by pipeline stage or payment status. Returns id, title, brand, type, stage, amount, currency, payment status and key dates.",
    input_schema: {
      type: "object",
      properties: {
        stage: { type: "string", description: "Optional pipeline stage filter, e.g. 'in_review'." },
        paymentStatus: { type: "string", description: "Optional filter: unpaid | invoiced | paid | overdue." },
      },
    },
  },
  {
    name: "get_deal",
    description: "Get one deal in full, including its deliverables and their statuses/due dates.",
    input_schema: {
      type: "object",
      properties: { dealId: { type: "string", description: "The deal id." } },
      required: ["dealId"],
    },
  },
  {
    name: "list_upcoming",
    description:
      "List upcoming dated events (deliverable due dates, payment due, posting windows, exclusivity expiry) within the next N days across all active deals. Use for 'what's due this week' style questions.",
    input_schema: {
      type: "object",
      properties: { days: { type: "integer", description: "Look-ahead window in days (default 7)." } },
    },
  },
  {
    name: "payment_summary",
    description: "Summarize money owed vs paid across active deals, grouped by currency.",
    input_schema: { type: "object", properties: {} },
  },
];

type ToolInput = Record<string, unknown>;

export async function executeHermesTool(name: string, input: ToolInput): Promise<unknown> {
  switch (name) {
    case "list_deals": {
      let deals = await listActiveDeals();
      if (typeof input.stage === "string") deals = deals.filter((d) => d.stage === input.stage);
      if (typeof input.paymentStatus === "string")
        deals = deals.filter((d) => d.paymentStatus === input.paymentStatus);
      return deals.map((d) => ({
        id: d.id,
        title: d.title,
        brand: d.brandName,
        type: d.dealType,
        stage: d.stage,
        amount: formatMoney(d.amountTotalMinor, d.currency),
        paymentStatus: d.paymentStatus,
        paymentDueDate: d.paymentDueDate,
        postingWindow: [d.postingWindowStart, d.postingWindowEnd],
        exclusivityUntil: d.exclusivityUntil,
      }));
    }
    case "get_deal": {
      const id = String(input.dealId ?? "");
      const deal = await getDeal(id);
      if (!deal) return { error: "Deal not found or not accessible." };
      const deliverables = await listDeliverables(id);
      return {
        id: deal.id,
        title: deal.title,
        brand: deal.brandName,
        type: deal.dealType,
        stage: deal.stage,
        amount: formatMoney(deal.amountTotalMinor, deal.currency),
        paymentStatus: deal.paymentStatus,
        paymentDueDate: deal.paymentDueDate,
        fields: deal.fields,
        deliverables: deliverables.map((dl) => ({
          title: dl.title,
          status: dl.status,
          platform: dl.platform,
          dueDate: dl.dueDate,
        })),
      };
    }
    case "list_upcoming": {
      const days = Number(input.days ?? 7);
      const events = await listCalendarEvents();
      const now = new Date();
      const horizon = new Date(now.getTime() + days * 86400000).toISOString().slice(0, 10);
      const todayStr = now.toISOString().slice(0, 10);
      return events.filter((e) => e.date >= todayStr && e.date <= horizon);
    }
    case "payment_summary": {
      const deals = await listActiveDeals();
      const byCurrency: Record<string, { owed: number; paid: number }> = {};
      for (const d of deals) {
        if (d.amountTotalMinor == null) continue;
        const c = (byCurrency[d.currency] ??= { owed: 0, paid: 0 });
        if (d.paymentStatus === "paid") c.paid += d.amountTotalMinor;
        else c.owed += d.amountTotalMinor;
      }
      return Object.fromEntries(
        Object.entries(byCurrency).map(([cur, v]) => [
          cur,
          { owed: formatMoney(v.owed, cur), paid: formatMoney(v.paid, cur) },
        ]),
      );
    }
    default:
      return { error: `Unknown tool: ${name}` };
  }
}
