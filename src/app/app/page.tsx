import Link from "next/link";
import { listActiveDeals } from "@/lib/deals";
import { computeNudges } from "@/lib/nudges";
import { dealStage, type Deal } from "@/db/schema";
import { formatMoney, stageLabel } from "@/lib/format";

export default async function Dashboard() {
  const deals = await listActiveDeals();
  const nudges = await computeNudges();

  const snapshot = new Map<string, { owed: number; paid: number }>();
  for (const d of deals) {
    if (d.amountTotalMinor == null) continue;
    const s = snapshot.get(d.currency) ?? { owed: 0, paid: 0 };
    if (d.paymentStatus === "paid") s.paid += d.amountTotalMinor;
    else s.owed += d.amountTotalMinor;
    snapshot.set(d.currency, s);
  }

  const byStage = new Map<string, Deal[]>();
  for (const s of dealStage.enumValues) byStage.set(s, []);
  for (const d of deals) byStage.get(d.stage)!.push(d);

  return (
    <div>
      <div className="reveal reveal-1" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 8 }}>Your atelier</p>
          <h1 className="display" style={{ fontSize: 40, margin: 0 }}>Deals</h1>
        </div>
        <Link href="/app/deals/new" className="btn btn-primary">+ New deal</Link>
      </div>

      {/* Needs attention */}
      {nudges.length > 0 && (
        <div className="glass reveal reveal-2" style={{ marginTop: 24, padding: "16px 18px" }}>
          <p className="eyebrow" style={{ marginBottom: 10 }}>Needs attention</p>
          {nudges.slice(0, 8).map((n) => (
            <Link key={n.id} href={`/app/deals/${n.dealId}`}
              style={{ display: "flex", gap: 10, alignItems: "baseline", padding: "5px 0", color: "var(--fg)" }}>
              <span aria-hidden style={{ filter: "saturate(1.2)" }}>{n.severity === "overdue" ? "🔴" : "🟡"}</span>
              <span style={{ fontSize: 14.5 }}>{n.text}</span>
            </Link>
          ))}
          {nudges.length > 8 && <div style={{ color: "var(--faint)", fontSize: 12, marginTop: 6 }}>+{nudges.length - 8} more</div>}
        </div>
      )}

      {/* Payment snapshot */}
      {snapshot.size > 0 && (
        <div className="reveal reveal-2" style={{ display: "flex", gap: 14, marginTop: 20, flexWrap: "wrap" }}>
          {[...snapshot.entries()].map(([cur, s]) => (
            <div key={cur} className="card" style={{ padding: "16px 20px", minWidth: 200 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>{cur}</div>
              <div className="display gold-text" style={{ fontSize: 26 }}>{formatMoney(s.owed, cur)}</div>
              <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>owed · {formatMoney(s.paid, cur)} paid</div>
            </div>
          ))}
        </div>
      )}

      {deals.length === 0 && (
        <div className="glass reveal reveal-3" style={{ marginTop: 28, padding: "40px 32px", textAlign: "center" }}>
          <p className="display" style={{ fontSize: 22, margin: "0 0 8px" }}>Your first deal awaits.</p>
          <p style={{ color: "var(--muted)", margin: "0 0 20px" }}>
            Create one by hand — or, soon, let Hermes import them from your inbox.
          </p>
          <Link href="/app/deals/new" className="btn btn-primary">Create a deal</Link>
        </div>
      )}

      {/* Kanban */}
      {deals.length > 0 && (
        <div className="reveal reveal-3" style={{ display: "flex", gap: 14, marginTop: 28, overflowX: "auto", paddingBottom: 10 }}>
          {dealStage.enumValues.map((stage) => {
            const items = byStage.get(stage)!;
            return (
              <div key={stage} className="glass" style={{ minWidth: 216, flex: "0 0 auto", padding: 12, background: "rgba(255,255,255,0.025)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2px 4px 10px" }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: "0.04em" }}>{stageLabel(stage)}</span>
                  <span className="chip">{items.length}</span>
                </div>
                {items.map((d) => (
                  <Link key={d.id} href={`/app/deals/${d.id}`} className="card" style={{ display: "block", padding: "12px 14px", marginBottom: 9 }}>
                    <div className="display" style={{ fontSize: 16 }}>{d.title}</div>
                    <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 2 }}>{d.brandName ?? "—"} · {d.dealType}</div>
                    {d.amountTotalMinor != null && (
                      <div className="gold-text" style={{ fontSize: 14, marginTop: 6, fontWeight: 600 }}>{formatMoney(d.amountTotalMinor, d.currency)}</div>
                    )}
                  </Link>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
