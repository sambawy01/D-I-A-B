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
    <div className="reveal reveal-1">
      <Link href="/app" className="nav-link" style={{ fontSize: 13 }}>← Deals</Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 14, flexWrap: "wrap", gap: 12 }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 8 }}>{deal.brandName ?? "—"} · {deal.dealType}</p>
          <h1 className="display" style={{ fontSize: 40, margin: 0 }}>{deal.title}</h1>
        </div>
        <div className="display gold-text" style={{ fontSize: 30 }}>{formatMoney(deal.amountTotalMinor, deal.currency)}</div>
      </div>

      {/* Quick controls */}
      <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
        <form action={setStage.bind(null, id)} className="pill">
          <span className="field-label" style={{ margin: 0 }}>Stage</span>
          <select name="stage" defaultValue={deal.stage} className="field" style={pillSelect}>
            {dealStage.enumValues.map((s) => <option key={s} value={s}>{stageLabel(s)}</option>)}
          </select>
          <button type="submit" className="btn btn-ghost btn-sm">Move</button>
        </form>

        <form action={setPaymentStatus.bind(null, id)} className="pill">
          <span className="field-label" style={{ margin: 0 }}>Payment</span>
          <select name="paymentStatus" defaultValue={deal.paymentStatus} className="field" style={pillSelect}>
            {paymentStatus.enumValues.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="submit" className="btn btn-ghost btn-sm">Set</button>
        </form>
      </div>

      <Deliverables dealId={id} items={deliverables} />

      <h2 className="display" style={{ fontSize: 22, marginTop: 40, marginBottom: 14 }}>Brief</h2>
      <DealForm action={updateDeal.bind(null, id)} deal={deal} submitLabel="Save changes" />

      <form action={archiveDeal.bind(null, id)} style={{ marginTop: 36 }}>
        <button type="submit" className="btn btn-ghost btn-sm" style={{ color: "#e79b93", borderColor: "rgba(220,90,90,0.3)" }}>
          Archive deal
        </button>
      </form>
    </div>
  );
}

const pillSelect: React.CSSProperties = { width: "auto", padding: "5px 10px", fontSize: 14, background: "rgba(0,0,0,0.25)" };
