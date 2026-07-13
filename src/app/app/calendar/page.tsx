import Link from "next/link";
import { listCalendarEvents, KIND_BADGE, type CalEvent } from "@/lib/calendar";
import { todayISO } from "@/lib/format";

const PALETTE = ["#e9d0a0", "#6d5cff", "#2fd4c6", "#ff8fb6", "#b39ddb", "#f2a5c4", "#8fd694", "#f4a259"];

export default async function CalendarPage() {
  const events = await listCalendarEvents();
  const today = todayISO();

  const colorByDeal = new Map<string, string>();
  for (const e of events) if (!colorByDeal.has(e.dealId)) colorByDeal.set(e.dealId, PALETTE[colorByDeal.size % PALETTE.length]);

  const past = events.filter((e) => e.date < today);
  const upcoming = events.filter((e) => e.date >= today);

  const byDate = new Map<string, CalEvent[]>();
  for (const e of upcoming) (byDate.get(e.date) ?? byDate.set(e.date, []).get(e.date)!).push(e);

  return (
    <div className="reveal reveal-1">
      <p className="eyebrow" style={{ marginBottom: 8 }}>Timeline</p>
      <h1 className="display" style={{ fontSize: 40, margin: 0 }}>Calendar</h1>
      <p style={{ color: "var(--muted)", marginTop: 8, fontSize: 15 }}>
        Every deadline, posting window, payment and exclusivity across your active deals.
      </p>

      {events.length === 0 && (
        <div className="glass reveal reveal-2" style={{ marginTop: 24, padding: "32px", textAlign: "center", color: "var(--muted)" }}>
          Nothing scheduled yet — add dates to your deals and deliverables.
        </div>
      )}

      {past.length > 0 && (
        <section className="reveal reveal-2" style={{ marginTop: 26 }}>
          <p className="eyebrow" style={{ color: "#e79b93" }}>Overdue / past</p>
          {past.map((e, i) => <EventRow key={i} e={e} color={colorByDeal.get(e.dealId)!} stale />)}
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="reveal reveal-3" style={{ marginTop: 30 }}>
          <p className="eyebrow">Upcoming</p>
          {[...byDate.entries()].map(([date, items]) => (
            <div key={date} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, letterSpacing: "0.03em" }}>
                {date}
                {items.length >= 3 && <span className="gold-text" style={{ marginLeft: 10 }}>⚠ {items.length} items — consider rescheduling</span>}
              </div>
              {items.map((e, i) => <EventRow key={i} e={e} color={colorByDeal.get(e.dealId)!} />)}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

function EventRow({ e, color, stale }: { e: CalEvent; color: string; stale?: boolean }) {
  return (
    <Link href={`/app/deals/${e.dealId}`} className="card"
      style={{ display: "flex", gap: 11, alignItems: "center", padding: "10px 13px", marginBottom: 7, opacity: stale ? 0.7 : 1 }}>
      <span style={{ width: 8, height: 26, borderRadius: 4, background: color, flex: "0 0 auto", boxShadow: `0 0 12px ${color}66` }} />
      <span className="chip">{KIND_BADGE[e.kind]}</span>
      <span style={{ flex: 1, fontSize: 14.5 }}>{e.label}</span>
      <span style={{ color: "var(--muted)", fontSize: 13 }}>{e.dealTitle}</span>
      {stale && <span style={{ color: "var(--faint)", fontSize: 12 }}>{e.date}</span>}
    </Link>
  );
}
