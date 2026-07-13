import type { Deal } from "@/db/schema";
import { dealType } from "@/db/schema";
import { minorToMajorInput } from "@/lib/format";

type Props = {
  action: (formData: FormData) => void;
  deal?: Deal;
  submitLabel: string;
};

export function DealForm({ action, deal, submitLabel }: Props) {
  const f = (deal?.fields ?? {}) as { notes?: string };

  return (
    <form action={action} style={{ maxWidth: 620 }}>
      <Row label="Title">
        <input name="title" required defaultValue={deal?.title ?? ""} className="field" />
      </Row>
      <Row label="Brand">
        <input name="brandName" defaultValue={deal?.brandName ?? ""} className="field" />
      </Row>

      <div style={{ display: "flex", gap: 12 }}>
        <Row label="Type" grow>
          <select name="dealType" defaultValue={deal?.dealType ?? "influencer"} className="field">
            {dealType.enumValues.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Row>
        <Row label="Currency" grow>
          <input name="currency" maxLength={3} defaultValue={deal?.currency ?? "EUR"} className="field" />
        </Row>
        <Row label="Amount" grow>
          <input name="amountMajor" type="number" step="0.01" min="0" placeholder="0.00"
            defaultValue={minorToMajorInput(deal?.amountTotalMinor ?? null)} className="field" />
        </Row>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <Row label="Payment due" grow>
          <input name="paymentDueDate" type="date" defaultValue={deal?.paymentDueDate ?? ""} className="field" />
        </Row>
        <Row label="Exclusivity until" grow>
          <input name="exclusivityUntil" type="date" defaultValue={deal?.exclusivityUntil ?? ""} className="field" />
        </Row>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <Row label="Posting window — start" grow>
          <input name="postingWindowStart" type="date" defaultValue={deal?.postingWindowStart ?? ""} className="field" />
        </Row>
        <Row label="end" grow>
          <input name="postingWindowEnd" type="date" defaultValue={deal?.postingWindowEnd ?? ""} className="field" />
        </Row>
      </div>

      <Row label="Notes / brief">
        <textarea name="notes" rows={4} defaultValue={f.notes ?? ""} className="field" style={{ resize: "vertical" }} />
      </Row>

      <button type="submit" className="btn btn-primary" style={{ marginTop: 6 }}>{submitLabel}</button>
    </form>
  );
}

function Row({ label, children, grow }: { label: string; children: React.ReactNode; grow?: boolean }) {
  return (
    <div style={{ marginBottom: 15, flex: grow ? 1 : undefined }}>
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}
