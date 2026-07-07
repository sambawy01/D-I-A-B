import Link from "next/link";
import { listActiveDeals } from "@/lib/deals";
import { dealStage, type Deal } from "@/db/schema";
import { formatMoney, stageLabel } from "@/lib/format";

export default async function Dashboard() {
  const deals = await listActiveDeals();

  // Payment snapshot, grouped by currency (amounts across currencies don't sum).
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 24, margin: 0 }}>Deals</h1>
        <Link href="/app/deals/new" style={newBtn}>+ New deal</Link>
      </div>

      {/* Payment snapshot */}
      <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
        {snapshot.size === 0 ? (
          <span style={{ color: "var(--muted)", fontSize: 14 }}>No amounts yet.</span>
        ) : (
          [...snapshot.entries()].map(([cur, s]) => (
            <div key={cur} style={snapCard}>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{cur}</div>
              <div style={{ fontSize: 15 }}>
                <strong style={{ color: "var(--accent)" }}>{formatMoney(s.owed, cur)}</strong> owed
                {"  ·  "}
                <span style={{ color: "var(--muted)" }}>{formatMoney(s.paid, cur)} paid</span>
              </div>
            </div>
          ))
        )}
      </div>

      {deals.length === 0 && (
        <p style={{ color: "var(--muted)", marginTop: 32 }}>
          No deals yet. <Link href="/app/deals/new">Create your first one</Link> — or, soon,
          let Hermes import them from your inbox.
        </p>
      )}

      {/* Kanban-lite: one column per stage */}
      <div style={{ display: "flex", gap: 14, marginTop: 24, overflowX: "auto", paddingBottom: 8 }}>
        {dealStage.enumValues.map((stage) => {
          const items = byStage.get(stage)!;
          return (
            <div key={stage} style={column}>
              <div style={colHeader}>
                {stageLabel(stage)} <span style={{ color: "var(--muted)" }}>{items.length}</span>
              </div>
              {items.map((d) => (
                <Link key={d.id} href={`/app/deals/${d.id}`} style={card}>
                  <div style={{ fontWeight: 600 }}>{d.title}</div>
                  <div style={{ color: "var(--muted)", fontSize: 12 }}>
                    {d.brandName ?? "—"} · {d.dealType}
                  </div>
                  {d.amountTotalMinor != null && (
                    <div style={{ fontSize: 13, marginTop: 4 }}>
                      {formatMoney(d.amountTotalMinor, d.currency)}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const newBtn: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 8,
  background: "var(--accent)",
  color: "#1a1200",
  fontWeight: 600,
  textDecoration: "none",
  fontSize: 14,
};
const snapCard: React.CSSProperties = {
  border: "1px solid #1e1e26",
  borderRadius: 10,
  padding: "10px 14px",
  background: "#101015",
};
const column: React.CSSProperties = {
  minWidth: 200,
  flex: "0 0 auto",
  background: "#0e0e13",
  border: "1px solid #1a1a22",
  borderRadius: 12,
  padding: 10,
};
const colHeader: React.CSSProperties = { fontSize: 13, fontWeight: 600, marginBottom: 8, padding: "2px 4px" };
const card: React.CSSProperties = {
  display: "block",
  background: "#16161d",
  border: "1px solid #23232c",
  borderRadius: 10,
  padding: "10px 12px",
  marginBottom: 8,
  textDecoration: "none",
  color: "var(--fg)",
};
