/** Minor units (e.g. cents) + ISO currency → a localized amount string. */
export function formatMoney(minor: number | null, currency: string): string {
  if (minor == null) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(minor / 100);
  } catch {
    return `${(minor / 100).toFixed(2)} ${currency}`;
  }
}

/** Minor units → plain major-unit number for form inputs (e.g. 150000 → "1500"). */
export function minorToMajorInput(minor: number | null): string {
  return minor == null ? "" : String(minor / 100);
}

const STAGE_LABELS: Record<string, string> = {
  proposal: "Proposal",
  briefed: "Briefed",
  drafting: "Drafting",
  submitted: "Submitted",
  in_review: "In Review",
  approved: "Approved",
  posted: "Posted",
  invoiced: "Invoiced",
  paid: "Paid",
};
export const stageLabel = (s: string) => STAGE_LABELS[s] ?? s;

const DELIVERABLE_STATUS_LABELS: Record<string, string> = {
  to_produce: "To produce",
  drafting: "Drafting",
  submitted: "Submitted",
  in_review: "In review",
  approved: "Approved",
  revision_requested: "Revision requested",
};
export const deliverableStatusLabel = (s: string) => DELIVERABLE_STATUS_LABELS[s] ?? s;

/** Today as an ISO date string (YYYY-MM-DD), for comparing against `date` columns. */
export const todayISO = () => new Date().toISOString().slice(0, 10);

