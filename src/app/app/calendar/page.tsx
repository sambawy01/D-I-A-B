import Link from "next/link";
import { listCalendarEvents, KIND_BADGE, type CalEvent } from "@/lib/calendar";
import { todayISO } from "@/lib/format";

const PALETTE = ["#e2b33f", "#5aa9e6", "#7ed3a2", "#e07a5f", "#b39ddb", "#f2a5c4", "#8fd694", "#f4a259"];

export default async function CalendarPage() {
  const events = await listCalendarEvents();
  const today = todayISO();

  // Stable per-deal colour (by first appearance).
  const colorByDeal = new Map<string, string>();
  for (const e of events) {
    if (!colorByDeal.has(e.dealId)) {
      colorByDeal.set(e.dealId, PALETTE[colorByDeal.size % PALETTE.length]);
    }
  }

  const past = events.filter((e) => e.date < today);
  const upcoming = events.filter((e) => e.date >= today);

  // Group upcoming by date for conflict visibility.
  const byDate = new Map<string, CalEvent[]>();
  for (const e of upcoming) {
    (byDate.get(e.date) ?? byDate.set(e.date, []).get(e.date)!).push(e);
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Calendar</h1>
      <p style={{ color: "var(--muted)", marginTop: 0, fontSize: 14 }}>
        Every deadline, posting window, payment, and exclusivity across your active deals.
      </p>

      {events.length === 0 && (
        <p style={{ color: "var(--muted)", marginTop: 24 }}>
          Nothing scheduled yet. Add dates to your deals and deliverables and they’ll show up here.
        </p>
      )}

      {past.length > 0 && (
        <section style={{ marginTop: 24 }}>
          <h2 style={{ ...sectionH, color: "#e08a8a" }}>Overdue / past</h2>
          {past.map((e, i) => (
            <EventRow key={i} e={e} color={colorByDeal.get(e.dealId)!} stale />
          ))}
        </section>
      )}

      {upcoming.length > 0 && (
        <section style={{ marginTop: 28 }}>
          <h2 style={sectionH}>Upcoming</h2>
          {[...byDate.entries()].map(([date, items]) => (
            <div key={date} style={{ marginBottom: 18 }}>
              <div style={dateHeader}>
                {date}
                {items.length >= 3 && (
                  <span style={{ color: "#e2b33f", marginLeft: 8 }}>
                    ⚠ {items.length} items — consider rescheduling
                  </span>
                )}
              </div>
              {items.map((e, i) => (
                <EventRow key={i} e={e} color={colorByDeal.get(e.dealId)!} />
              ))}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

function EventRow({ e, color, stale }: { e: CalEvent; color: string; stale?: boolean }) {
  return (
    <Link href={`/app/deals/${e.dealId}`} style={{ ...row, opacity: stale ? 0.75 : 1 }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: color, flex: "0 0 auto" }} />
      <span style={badge}>{KIND_BADGE[e.kind]}</span>
      <span style={{ flex: 1 }}>{e.label}</span>
      <span style={{ color: "var(--muted)", fontSize: 13 }}>{e.dealTitle}</span>
      {stale && <span style={{ color: "var(--muted)", fontSize: 12 }}>{e.date}</span>}
    </Link>
  );
}

const sectionH: React.CSSProperties = { fontSize: 14, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--muted)" };
const dateHeader: React.CSSProperties = { fontSize: 13, fontWeight: 600, marginBottom: 6 };
const row: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  padding: "9px 12px",
  border: "1px solid #1e1e26",
  borderRadius: 10,
  marginBottom: 6,
  background: "#101015",
  textDecoration: "none",
  color: "var(--fg)",
};
const badge: React.CSSProperties = {
  fontSize: 11,
  color: "var(--muted)",
  border: "1px solid #2a2a33",
  borderRadius: 5,
  padding: "1px 6px",
  flex: "0 0 auto",
};
