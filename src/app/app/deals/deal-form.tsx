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
    <form action={action} style={{ maxWidth: 560 }}>
      <Row label="Title">
        <input name="title" required defaultValue={deal?.title ?? ""} style={input} />
      </Row>

      <Row label="Brand">
        <input name="brandName" defaultValue={deal?.brandName ?? ""} style={input} />
      </Row>

      <div style={{ display: "flex", gap: 12 }}>
        <Row label="Type" grow>
          <select name="dealType" defaultValue={deal?.dealType ?? "influencer"} style={input}>
            {dealType.enumValues.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Row>
        <Row label="Currency" grow>
          <input name="currency" maxLength={3} defaultValue={deal?.currency ?? "EUR"} style={input} />
        </Row>
        <Row label="Amount" grow>
          <input
            name="amountMajor"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            defaultValue={minorToMajorInput(deal?.amountTotalMinor ?? null)}
            style={input}
          />
        </Row>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <Row label="Payment due" grow>
          <input name="paymentDueDate" type="date" defaultValue={deal?.paymentDueDate ?? ""} style={input} />
        </Row>
        <Row label="Exclusivity until" grow>
          <input name="exclusivityUntil" type="date" defaultValue={deal?.exclusivityUntil ?? ""} style={input} />
        </Row>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <Row label="Posting window — start" grow>
          <input name="postingWindowStart" type="date" defaultValue={deal?.postingWindowStart ?? ""} style={input} />
        </Row>
        <Row label="end" grow>
          <input name="postingWindowEnd" type="date" defaultValue={deal?.postingWindowEnd ?? ""} style={input} />
        </Row>
      </div>

      <Row label="Notes / brief">
        <textarea name="notes" rows={4} defaultValue={f.notes ?? ""} style={{ ...input, resize: "vertical" }} />
      </Row>

      <button type="submit" style={primaryBtn}>{submitLabel}</button>
    </form>
  );
}

function Row({ label, children, grow }: { label: string; children: React.ReactNode; grow?: boolean }) {
  return (
    <div style={{ marginBottom: 14, flex: grow ? 1 : undefined }}>
      <label style={{ display: "block", fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const input: React.CSSProperties = {
  width: "100%",
  padding: "9px 11px",
  borderRadius: 8,
  border: "1px solid #2a2a33",
  background: "#141419",
  color: "var(--fg)",
  fontSize: 15,
};
const primaryBtn: React.CSSProperties = {
  marginTop: 8,
  padding: "10px 18px",
  borderRadius: 8,
  border: "none",
  background: "var(--accent)",
  color: "#1a1200",
  fontWeight: 600,
  cursor: "pointer",
};
