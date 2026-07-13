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
      setMessages((m) => [...m, { role: "assistant", content: r.ok ? `✓ ${r.message}` : `⚠ Couldn't apply: ${r.message}` }]);
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
    if (messages.length === 0 && nudges.length > 0) {
      const lines = nudges.slice(0, 8).map((n) => (n.severity === "overdue" ? "🔴 " : "🟡 ") + n.text).join("\n");
      const extra = nudges.length > 8 ? `\n…and ${nudges.length - 8} more.` : "";
      setMessages([{ role: "assistant", content: `Here's what needs your attention:\n\n${lines}${extra}\n\nAsk me to act on any of these.` }]);
    }
  }

  const overdueCount = nudges.filter((n) => n.severity === "overdue").length;

  if (!open) {
    return (
      <button onClick={openChat} className="btn btn-primary" style={fab} aria-label="Open Hermes">
        ✦ Ask Hermes
        {nudges.length > 0 && (
          <span className="badge" style={{ background: overdueCount > 0 ? "#d8564b" : undefined, color: overdueCount > 0 ? "#fff" : undefined }}>
            {nudges.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="glass reveal reveal-1" style={panel}>
      <div style={panelHeader}>
        <span className="display gold-text" style={{ fontSize: 18, letterSpacing: "0.04em" }}>Hermes</span>
        <button onClick={() => setOpen(false)} style={closeBtn} aria-label="Close">✕</button>
      </div>

      <div ref={scrollRef} style={msgList}>
        {messages.length === 0 && (
          <p style={{ color: "var(--muted)", fontSize: 13.5, lineHeight: 1.6 }}>
            Ask me “what’s due this week?”, “who owes me money?”, “typical rate for 2 Reels?”, or
            “move Adidas to in review.”
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ margin: "9px 0", textAlign: m.role === "user" ? "right" : "left" }}>
            <span style={m.role === "user" ? userBubble : botBubble}>{m.content}</span>
          </div>
        ))}
        {busy && <div style={{ color: "var(--gold)", fontSize: 13 }}>Hermes is thinking…</div>}
      </div>

      {proposal && (
        <div style={proposalCard}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Proposed — confirm to apply</div>
          <div style={{ fontSize: 14, whiteSpace: "pre-wrap", marginBottom: 12, lineHeight: 1.5 }}>{proposal.summary}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={confirm} disabled={busy} className="btn btn-primary btn-sm">Confirm</button>
            <button onClick={cancel} disabled={busy} className="btn btn-ghost btn-sm">Cancel</button>
          </div>
        </div>
      )}

      <form onSubmit={send} style={inputRow}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask Hermes…" className="field" />
        <button type="submit" disabled={busy} className="btn btn-primary btn-sm">Send</button>
      </form>
    </div>
  );
}

const fab: React.CSSProperties = { position: "fixed", right: 22, bottom: 22, zIndex: 50, boxShadow: "0 10px 40px -8px rgba(216,184,120,0.5)" };
const panel: React.CSSProperties = {
  position: "fixed", right: 22, bottom: 22, zIndex: 50,
  width: 380, maxWidth: "calc(100vw - 44px)", height: 520, maxHeight: "calc(100vh - 44px)",
  display: "flex", flexDirection: "column", overflow: "hidden",
  boxShadow: "0 30px 80px -20px rgba(0,0,0,0.7)",
};
const panelHeader: React.CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "14px 16px", borderBottom: "1px solid var(--line-soft)",
};
const closeBtn: React.CSSProperties = { border: "none", background: "transparent", color: "var(--muted)", cursor: "pointer", fontSize: 15 };
const msgList: React.CSSProperties = { flex: 1, overflowY: "auto", padding: "14px 16px" };
const userBubble: React.CSSProperties = {
  display: "inline-block", background: "linear-gradient(120deg,var(--gold-deep),var(--champagne))", color: "#241a08",
  padding: "8px 12px", borderRadius: "14px 14px 4px 14px", fontSize: 14, textAlign: "left", maxWidth: "85%",
};
const botBubble: React.CSSProperties = {
  display: "inline-block", background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", color: "var(--fg)",
  padding: "8px 12px", borderRadius: "14px 14px 14px 4px", fontSize: 14, whiteSpace: "pre-wrap", maxWidth: "90%", lineHeight: 1.5,
};
const proposalCard: React.CSSProperties = {
  margin: "0 14px 12px", padding: "12px 14px",
  border: "1px solid rgba(233,208,160,0.3)", background: "rgba(233,208,160,0.06)", borderRadius: 14,
};
const inputRow: React.CSSProperties = { display: "flex", gap: 8, padding: 14, borderTop: "1px solid var(--line-soft)" };
