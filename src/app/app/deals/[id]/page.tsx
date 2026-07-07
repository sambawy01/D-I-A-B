import Link from "next/link";
import { notFound } from "next/navigation";
import { getDeal } from "@/lib/deals";
import { listDeliverables } from "@/lib/deliverables";
import { dealStage, paymentStatus } from "@/db/schema";
import { formatMoney, stageLabel } from "@/lib/format";
import { DealForm } from "../deal-form";
import { Deliverables } from "../deliverables";
import { updateDeal, setStage, setPaymentStatus, archiveDeal } from "../actions";

export default async function DealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deal = await getDeal(id);
  if (!deal) notFound();

  const deliverables = await listDeliverables(id);

  return (
    <div>
      <Link href="/app" style={{ color: "var(--muted)", fontSize: 13 }}>← Deals</Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 8 }}>
        <h1 style={{ fontSize: 26, margin: 0 }}>{deal.title}</h1>
        <span style={{ color: "var(--muted)", fontSize: 14 }}>
          {deal.brandName ?? "—"} · {deal.dealType}
        </span>
      </div>

      {/* Quick controls: stage + payment status */}
      <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
        <form action={setStage.bind(null, id)} style={pill}>
          <label style={pillLabel}>Stage</label>
          <select name="stage" defaultValue={deal.stage} style={pillSelect}>
            {dealStage.enumValues.map((s) => (
              <option key={s} value={s}>{stageLabel(s)}</option>
            ))}
          </select>
          <button type="submit" style={pillBtn}>Move</button>
        </form>

        <form action={setPaymentStatus.bind(null, id)} style={pill}>
          <label style={pillLabel}>Payment</label>
          <select name="paymentStatus" defaultValue={deal.paymentStatus} style={pillSelect}>
            {paymentStatus.enumValues.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button type="submit" style={pillBtn}>Set</button>
        </form>

        <div style={{ ...pill, alignItems: "baseline" }}>
          <span style={pillLabel}>Amount</span>
          <strong>{formatMoney(deal.amountTotalMinor, deal.currency)}</strong>
        </div>
      </div>

      {/* Production Tracker */}
      <Deliverables dealId={id} items={deliverables} />

      {/* Edit form */}
      <h2 style={{ fontSize: 16, marginTop: 36, marginBottom: 12 }}>Brief</h2>
      <DealForm action={updateDeal.bind(null, id)} deal={deal} submitLabel="Save changes" />

      {/* Danger zone */}
      <form action={archiveDeal.bind(null, id)} style={{ marginTop: 32 }}>
        <button type="submit" style={archiveBtn}>Archive deal</button>
      </form>
    </div>
  );
}

const pill: React.CSSProperties = {
  display: "flex",
  gap: 8,
  alignItems: "center",
  background: "#101015",
  border: "1px solid #1e1e26",
  borderRadius: 10,
  padding: "8px 12px",
};
const pillLabel: React.CSSProperties = { fontSize: 12, color: "var(--muted)" };
const pillSelect: React.CSSProperties = {
  background: "#141419",
  color: "var(--fg)",
  border: "1px solid #2a2a33",
  borderRadius: 6,
  padding: "4px 8px",
};
const pillBtn: React.CSSProperties = {
  border: "1px solid #2a2a33",
  background: "transparent",
  color: "var(--fg)",
  borderRadius: 6,
  padding: "4px 10px",
  cursor: "pointer",
  fontSize: 13,
};
const archiveBtn: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 8,
  border: "1px solid #4a1f22",
  background: "transparent",
  color: "#e08a8a",
  cursor: "pointer",
  fontSize: 13,
};
