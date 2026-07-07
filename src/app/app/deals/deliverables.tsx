import Link from "next/link";
import type { Deliverable } from "@/db/schema";
import { deliverableStatus, platform } from "@/db/schema";
import { deliverableStatusLabel, todayISO } from "@/lib/format";
import { addDeliverable, setDeliverableStatus, deleteDeliverable } from "./deliverable-actions";

export function Deliverables({ dealId, items }: { dealId: string; items: Deliverable[] }) {
  const today = todayISO();

  return (
    <section style={{ marginTop: 36 }}>
      <h2 style={{ fontSize: 16, marginBottom: 12 }}>
        Deliverables <span style={{ color: "var(--muted)" }}>{items.length}</span>
      </h2>

      {items.length === 0 && (
        <p style={{ color: "var(--muted)", fontSize: 14 }}>No deliverables yet.</p>
      )}

      {items.map((d) => {
        const overdue = !!d.dueDate && d.dueDate < today && d.status !== "approved";
        return (
          <div key={d.id} style={row}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600 }}>{d.title}</div>
              <div style={{ color: "var(--muted)", fontSize: 12 }}>
                {d.platform ?? "any platform"}
                {d.dueDate && (
                  <>
                    {" · due "}
                    <span style={{ color: overdue ? "#e08a8a" : "var(--muted)" }}>
                      {d.dueDate}{overdue ? " ⚠ overdue" : ""}
                    </span>
                  </>
                )}
              </div>
              {d.description && (
                <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>{d.description}</div>
              )}
            </div>

            <Link href={`/app/deliverables/${d.id}`} style={openLink}>Open →</Link>

            <form action={setDeliverableStatus.bind(null, dealId, d.id)} style={inlineForm}>
              <select name="status" defaultValue={d.status} style={select}>
                {deliverableStatus.enumValues.map((s) => (
                  <option key={s} value={s}>{deliverableStatusLabel(s)}</option>
                ))}
              </select>
              <button type="submit" style={smallBtn}>Set</button>
            </form>

            <form action={deleteDeliverable.bind(null, dealId, d.id)}>
              <button type="submit" style={deleteBtn} title="Delete">✕</button>
            </form>
          </div>
        );
      })}

      {/* Add deliverable */}
      <form action={addDeliverable.bind(null, dealId)} style={addForm}>
        <input name="title" placeholder="New deliverable (e.g. 2 Reels)" required style={{ ...field, flex: 2 }} />
        <select name="platform" defaultValue="" style={{ ...field, flex: 1 }}>
          <option value="">platform…</option>
          {platform.enumValues.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <input name="dueDate" type="date" style={{ ...field, flex: 1 }} />
        <button type="submit" style={addBtn}>Add</button>
      </form>
    </section>
  );
}

const row: React.CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "center",
  padding: "10px 12px",
  border: "1px solid #1e1e26",
  borderRadius: 10,
  marginBottom: 8,
  background: "#101015",
};
const openLink: React.CSSProperties = { color: "var(--accent)", textDecoration: "none", fontSize: 13, flex: "0 0 auto" };
const inlineForm: React.CSSProperties = { display: "flex", gap: 6, alignItems: "center" };
const addForm: React.CSSProperties = { display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" };
const field: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #2a2a33",
  background: "#141419",
  color: "var(--fg)",
  fontSize: 14,
  minWidth: 120,
};
const select: React.CSSProperties = {
  background: "#141419",
  color: "var(--fg)",
  border: "1px solid #2a2a33",
  borderRadius: 6,
  padding: "5px 8px",
};
const smallBtn: React.CSSProperties = {
  border: "1px solid #2a2a33",
  background: "transparent",
  color: "var(--fg)",
  borderRadius: 6,
  padding: "5px 10px",
  cursor: "pointer",
  fontSize: 13,
};
const deleteBtn: React.CSSProperties = {
  border: "none",
  background: "transparent",
  color: "var(--muted)",
  cursor: "pointer",
  fontSize: 14,
};
const addBtn: React.CSSProperties = {
  border: "none",
  background: "var(--accent)",
  color: "#1a1200",
  fontWeight: 600,
  borderRadius: 8,
  padding: "8px 16px",
  cursor: "pointer",
};
