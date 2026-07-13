/** A write action Hermes PROPOSES. Nothing runs until the creator confirms. */
export type HermesAction =
  | "set_stage"
  | "set_payment_status"
  | "add_deliverable"
  | "draft_message";

export type HermesProposal = {
  action: HermesAction;
  dealId: string;
  dealTitle?: string;
  args: Record<string, unknown>;
  summary: string; // human-readable, generated server-side
};
