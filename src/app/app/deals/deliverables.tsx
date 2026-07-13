import Link from "next/link";
import type { Deliverable } from "@/db/schema";
import { deliverableStatus, platform } from "@/db/schema";
import { deliverableStatusLabel, todayISO } from "@/lib/format";
import { addDeliverable, setDeliverableStatus, deleteDeliverable } from "./deliverable-actions";

export function Deliverables({ dealId, items }: { dealId: string; items: Deliverable[] }) {
  const today = todayISO();

  return (
    <section style={{ marginTop: 40 }}>
      <h2 className="display" style={{ fontSize: 22, marginBottom: 14 }}>
        Deliverables <span className="chip" style={{ verticalAlign: "middle" }}>{items.length}</span>
      </h2>

      {items.length === 0 && <p style={{ color: "var(--muted)", fontSize: 14 }}>No deliverables yet.</p>}

      {items.map((d) => {
        const overdue = !!d.dueDate && d.dueDate < today && d.status !== "approved";
        return (
          <div key={d.id} className="card" style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 14px", marginBottom: 9 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="display" style={{ fontSize: 16 }}>{d.title}</div>
              <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 2 }}>
                {d.platform ?? "any platform"}
                {d.dueDate && (
                  <> · due <span style={{ color: overdue ? "#e79b93" : "var(--muted)" }}>{d.dueDate}{overdue ? " ⚠ overdue" : ""}</span></>
                )}
              </div>
              {d.description && <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>{d.description}</div>}
            </div>

            <Link href={`/app/deliverables/${d.id}`} className="nav-link" style={{ fontSize: 13, flex: "0 0 auto" }}>Open →</Link>

            <form action={setDeliverableStatus.bind(null, dealId, d.id)} style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <select name="status" defaultValue={d.status} className="field" style={{ width: "auto", padding: "5px 9px", fontSize: 13 }}>
                {deliverableStatus.enumValues.map((s) => <option key={s} value={s}>{deliverableStatusLabel(s)}</option>)}
              </select>
              <button type="submit" className="btn btn-ghost btn-sm">Set</button>
            </form>

            <form action={deleteDeliverable.bind(null, dealId, d.id)}>
              <button type="submit" title="Delete" style={{ border: "none", background: "transparent", color: "var(--faint)", cursor: "pointer", fontSize: 14 }}>✕</button>
            </form>
          </div>
        );
      })}

      <form action={addDeliverable.bind(null, dealId)} style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <input name="title" placeholder="New deliverable (e.g. 2 Reels)" required className="field" style={{ flex: 2, minWidth: 160 }} />
        <select name="platform" defaultValue="" className="field" style={{ flex: 1, minWidth: 120 }}>
          <option value="">platform…</option>
          {platform.enumValues.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <input name="dueDate" type="date" className="field" style={{ flex: 1, minWidth: 120 }} />
        <button type="submit" className="btn btn-primary">Add</button>
      </form>
    </section>
  );
}
