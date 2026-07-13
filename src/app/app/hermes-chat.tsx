"use client";

import { useRef, useState } from "react";
import type { HermesProposal } from "@/lib/hermes/types";
import type { Nudge } from "@/lib/nudges";
import { confirmHermesAction } from "./hermes-actions";

type Msg = { role: "user" | "assistant"; content: string };

export function HermesChat({ nudges = [] }: { nudges?: Nudge[] }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [proposal, setProposal] = useState<HermesProposal | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;

    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/hermes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = (await res.json()) as { text?: string; proposal?: HermesProposal };
      if (data.text) setMessages((m) => [...m, { role: "assistant", content: data.text! }]);
      if (data.proposal) setProposal(data.proposal);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Something went wrong reaching Hermes." }]);
    } finally {
      setBusy(false);
      requestAnimationFrame(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight));
    }
  }

  async function confirm() {
    if (!proposal || busy) return;
    setBusy(true);
    const p = proposal;
    setProposal(null);
    try {
      const r = await confirmHermesAction(p);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: r.ok ? `✓ ${r.message}` : `⚠ Couldn't apply: ${r.message}` },
      ]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "⚠ Couldn't apply that change." }]);
    } finally {
      setBusy(false);
    }
  }

  function cancel() {
    setProposal(null);
    setMessages((m) => [...m, { role: "assistant", content: "Okay, cancelled — nothing changed." }]);
  }

  function openChat() {
    setOpen(true);
    // Greet with proactive nudges the first time it opens.
    if (messages.length === 0 && nudges.length > 0) {
      const lines = nudges
        .slice(0, 8)
        .map((n) => (n.severity === "overdue" ? "🔴 " : "🟡 ") + n.text)
        .join("\n");
      const extra = nudges.length > 8 ? `\n…and ${nudges.length - 8} more.` : "";
      setMessages([
        { role: "assistant", content: `Here's what needs your attention:\n\n${lines}${extra}\n\nAsk me to act on any of these.` },
      ]);
    }
  }

  const overdueCount = nudges.filter((n) => n.severity === "overdue").length;

  if (!open) {
    return (
      <button onClick={openChat} style={fab} aria-label="Open Hermes">
        Ask Hermes
        {nudges.length > 0 && (
          <span style={{ ...fabBadge, background: overdueCount > 0 ? "#c0392b" : "#7a5c17" }}>
            {nudges.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div style={panel}>
      <div style={panelHeader}>
        <strong>Hermes</strong>
        <button onClick={() => setOpen(false)} style={closeBtn} aria-label="Close">✕</button>
      </div>

      <div ref={scrollRef} style={msgList}>
        {messages.length === 0 && (
          <p style={{ color: "var(--muted)", fontSize: 13 }}>
            Ask me things like “what’s due this week?”, “who owes me money?”, or “what’s left on the
            Adidas deal?”
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ margin: "8px 0", textAlign: m.role === "user" ? "right" : "left" }}>
            <span style={m.role === "user" ? userBubble : botBubble}>{m.content}</span>
          </div>
        ))}
        {busy && <div style={{ color: "var(--muted)", fontSize: 13 }}>Hermes is thinking…</div>}
      </div>

      {proposal && (
        <div style={proposalCard}>
          <div style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600, marginBottom: 4 }}>
            Proposed change — needs your confirmation
          </div>
          <div style={{ fontSize: 14, whiteSpace: "pre-wrap", marginBottom: 10 }}>{proposal.summary}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={confirm} disabled={busy} style={confirmBtn}>Confirm</button>
            <button onClick={cancel} disabled={busy} style={cancelBtn}>Cancel</button>
          </div>
        </div>
      )}

      <form onSubmit={send} style={inputRow}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your deals…"
          style={inputBox}
        />
        <button type="submit" disabled={busy} style={sendBtn}>Send</button>
      </form>
    </div>
  );
}

const fab: React.CSSProperties = {
  position: "fixed", right: 20, bottom: 20, zIndex: 50,
  padding: "12px 18px", borderRadius: 999, border: "none",
  background: "var(--accent)", color: "#1a1200", fontWeight: 600, cursor: "pointer",
  boxShadow: "0 6px 24px rgba(0,0,0,.4)",
  display: "flex", alignItems: "center", gap: 8,
};
const fabBadge: React.CSSProperties = {
  minWidth: 20, height: 20, padding: "0 6px", borderRadius: 999,
  color: "#fff", fontSize: 12, fontWeight: 700,
  display: "inline-grid", placeItems: "center",
};
const panel: React.CSSProperties = {
  position: "fixed", right: 20, bottom: 20, zIndex: 50,
  width: 360, maxWidth: "calc(100vw - 40px)", height: 480, maxHeight: "calc(100vh - 40px)",
  display: "flex", flexDirection: "column",
  background: "#0e0e13", border: "1px solid #23232c", borderRadius: 14,
  boxShadow: "0 10px 40px rgba(0,0,0,.5)",
};
const panelHeader: React.CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "12px 14px", borderBottom: "1px solid #1e1e26",
};
const closeBtn: React.CSSProperties = { border: "none", background: "transparent", color: "var(--muted)", cursor: "pointer", fontSize: 15 };
const msgList: React.CSSProperties = { flex: 1, overflowY: "auto", padding: "12px 14px" };
const userBubble: React.CSSProperties = {
  display: "inline-block", background: "var(--accent)", color: "#1a1200",
  padding: "7px 11px", borderRadius: 12, fontSize: 14, textAlign: "left", maxWidth: "85%",
};
const botBubble: React.CSSProperties = {
  display: "inline-block", background: "#191921", color: "var(--fg)",
  padding: "7px 11px", borderRadius: 12, fontSize: 14, whiteSpace: "pre-wrap", maxWidth: "90%",
};
const proposalCard: React.CSSProperties = {
  margin: "0 12px 10px",
  padding: "10px 12px",
  border: "1px solid #4a3a1f",
  background: "#171310",
  borderRadius: 10,
};
const confirmBtn: React.CSSProperties = {
  border: "none",
  background: "#2f7d4f",
  color: "#eafff0",
  fontWeight: 600,
  borderRadius: 8,
  padding: "7px 16px",
  cursor: "pointer",
};
const cancelBtn: React.CSSProperties = {
  border: "1px solid #2a2a33",
  background: "transparent",
  color: "var(--fg)",
  borderRadius: 8,
  padding: "7px 16px",
  cursor: "pointer",
};
const inputRow: React.CSSProperties = { display: "flex", gap: 8, padding: 12, borderTop: "1px solid #1e1e26" };
const inputBox: React.CSSProperties = {
  flex: 1, padding: "9px 11px", borderRadius: 8, border: "1px solid #2a2a33",
  background: "#141419", color: "var(--fg)", fontSize: 14,
};
const sendBtn: React.CSSProperties = {
  border: "none", background: "var(--accent)", color: "#1a1200", fontWeight: 600,
  borderRadius: 8, padding: "0 14px", cursor: "pointer",
};
