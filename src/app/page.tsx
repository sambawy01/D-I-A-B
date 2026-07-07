export default function Home() {
  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "10vh 24px",
        lineHeight: 1.6,
      }}
    >
      <h1 style={{ fontSize: 40, marginBottom: 4 }}>DIAB</h1>
      <p style={{ color: "var(--muted)", marginTop: 0 }}>
        Deals for Influencers and Brands — campaign management with the Hermes AI copilot.
      </p>

      <h2 style={{ fontSize: 18, marginTop: 40 }}>MVP — 6 features, 3 pillars</h2>
      <ul style={{ color: "var(--muted)" }}>
        <li><strong>Deals &amp; Negotiation:</strong> Deal Card · Inbox Auto-Import · Hermes</li>
        <li><strong>Calendar:</strong> Cross-Deal Calendar (+ Kanban)</li>
        <li><strong>Content:</strong> Production Tracker · Inline Asset Approval (image-first)</li>
      </ul>

      <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 40 }}>
        Scaffold ready. Next: auth + the Deal Card, then the inbox-import magic moment.
        See <code>docs/</code> for the spec, architecture, and schema.
      </p>
    </main>
  );
}
