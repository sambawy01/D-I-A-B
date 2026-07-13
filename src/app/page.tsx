import { Logo } from "./logo";

export default function Home() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "12vh 24px 8vh" }}>
      <div className="reveal reveal-1" style={{ marginBottom: 40 }}>
        <Logo size={34} />
      </div>

      <p className="eyebrow reveal reveal-1" style={{ marginBottom: 18 }}>
        Deals · Influencers · Brands
      </p>

      <h1
        className="display reveal reveal-2"
        style={{ fontSize: "clamp(44px, 7vw, 88px)", margin: 0, maxWidth: 15 + "ch" }}
      >
        Every deal, <span className="aurora-text">beautifully</span> in one place.
      </h1>

      <p className="reveal reveal-3" style={{ color: "var(--muted)", fontSize: 19, lineHeight: 1.6, maxWidth: 560, marginTop: 24 }}>
        The campaign hub for creators — briefs, approvals, deadlines and payments,
        with <em style={{ color: "var(--fg)", fontStyle: "italic" }}>Hermes</em>, an AI copilot that
        proposes and you confirm.
      </p>

      <div className="reveal reveal-4" style={{ marginTop: 40, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <a href="/login" className="btn btn-primary">Enter the atelier →</a>
        <span style={{ color: "var(--faint)", fontSize: 13 }}>Deal Card · Calendar · Approvals · Hermes</span>
      </div>

      <div
        className="reveal reveal-4 glass"
        style={{ marginTop: 64, padding: "26px 28px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 22 }}
      >
        {[
          ["Deals & Negotiation", "A living deal card — terms, diffs, payments."],
          ["Calendar", "Every deadline, window and payment on one timeline."],
          ["Content Approval", "Upload, comment on the frame, approve versions."],
          ["Hermes", "Answers, research, proposals — you confirm."],
        ].map(([t, d]) => (
          <div key={t}>
            <div className="display" style={{ fontSize: 18, marginBottom: 6 }}>{t}</div>
            <div style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.5 }}>{d}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
