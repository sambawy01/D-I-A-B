import { listActiveDeals, getDeal } from "@/lib/deals";
import { listDeliverables } from "@/lib/deliverables";
import { listCalendarEvents } from "@/lib/calendar";
import { formatMoney } from "@/lib/format";
import type { HermesProposal } from "@/lib/hermes/types";

/** LLM-agnostic tool definition (JSON-schema `parameters`). */
export type ToolDef = {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
};

/**
 * Hermes's READ tools. Each runs against the user's RLS-scoped Supabase session,
 * so the copilot can only ever see the signed-in creator's own data — it cannot
 * read another user's deals even if prompted to. Write actions (draft proposal,
 * send email) are a later increment and will route through a human confirm gate.
 */
export const HERMES_TOOLS: ToolDef[] = [
  {
    name: "list_deals",
    description:
      "List the creator's active deals. Optionally filter by pipeline stage or payment status. Returns id, title, brand, type, stage, amount, currency, payment status and key dates.",
    parameters: {
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
    parameters: {
      type: "object",
      properties: { dealId: { type: "string", description: "The deal id." } },
      required: ["dealId"],
    },
  },
  {
    name: "list_upcoming",
    description:
      "List upcoming dated events (deliverable due dates, payment due, posting windows, exclusivity expiry) within the next N days across all active deals. Use for 'what's due this week' style questions.",
    parameters: {
      type: "object",
      properties: { days: { type: "integer", description: "Look-ahead window in days (default 7)." } },
    },
  },
  {
    name: "payment_summary",
    description: "Summarize money owed vs paid across active deals, grouped by currency.",
    parameters: { type: "object", properties: {} },
  },
];

/**
 * Hermes's WRITE tools. Calling one does NOT mutate anything — the route turns
 * the call into a HermesProposal that the UI renders as a Confirm/Cancel card.
 * Only the creator's click executes it (see src/app/app/hermes-actions.ts).
 */
export const HERMES_WRITE_TOOLS: ToolDef[] = [
  {
    name: "set_stage",
    description:
      "PROPOSE moving a deal to a new pipeline stage. Does not take effect until the creator confirms.",
    parameters: {
      type: "object",
      properties: {
        dealId: { type: "string" },
        stage: {
          type: "string",
          description: "proposal | briefed | drafting | submitted | in_review | approved | posted | invoiced | paid",
        },
      },
      required: ["dealId", "stage"],
    },
  },
  {
    name: "set_payment_status",
    description: "PROPOSE changing a deal's payment status. Requires the creator's confirmation.",
    parameters: {
      type: "object",
      properties: {
        dealId: { type: "string" },
        paymentStatus: { type: "string", description: "unpaid | invoiced | paid | overdue" },
      },
      required: ["dealId", "paymentStatus"],
    },
  },
  {
    name: "add_deliverable",
    description: "PROPOSE adding a deliverable to a deal. Requires the creator's confirmation.",
    parameters: {
      type: "object",
      properties: {
        dealId: { type: "string" },
        title: { type: "string" },
        dueDate: { type: "string", description: "YYYY-MM-DD, optional" },
        platform: { type: "string", description: "optional: instagram | tiktok | youtube | facebook | other" },
      },
      required: ["dealId", "title"],
    },
  },
  {
    name: "draft_message",
    description:
      "PROPOSE drafting a note/proposal/follow-up to log on a deal's communication thread. Requires the creator's confirmation before it is saved.",
    parameters: {
      type: "object",
      properties: {
        dealId: { type: "string" },
        body: { type: "string" },
      },
      required: ["dealId", "body"],
    },
  },
];

export const WRITE_TOOL_NAMES = new Set(HERMES_WRITE_TOOLS.map((t) => t.name));

/** Turn a write-tool call into a confirmable proposal (no mutation happens here). */
export async function buildProposal(
  name: string,
  args: Record<string, unknown>,
): Promise<HermesProposal | null> {
  const dealId = String(args.dealId ?? "");
  const deal = dealId ? await getDeal(dealId) : null;
  const title = deal?.title ?? "this deal";
  const base = { dealId, dealTitle: deal?.title, args };
  switch (name) {
    case "set_stage":
      return { ...base, action: "set_stage", summary: `Move “${title}” to stage “${String(args.stage)}”.` };
    case "set_payment_status":
      return {
        ...base,
        action: "set_payment_status",
        summary: `Set “${title}” payment status to “${String(args.paymentStatus)}”.`,
      };
    case "add_deliverable":
      return {
        ...base,
        action: "add_deliverable",
        summary: `Add deliverable “${String(args.title)}”${args.dueDate ? ` (due ${String(args.dueDate)})` : ""} to “${title}”.`,
      };
    case "draft_message":
      return {
        ...base,
        action: "draft_message",
        summary: `Save this note to “${title}”'s thread:\n\n“${String(args.body)}”`,
      };
    default:
      return null;
  }
}

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
