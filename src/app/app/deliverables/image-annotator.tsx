"use client";

import { useRef, useState, useTransition } from "react";

export type Pin = { id: string; x: number; y: number; body: string; resolved: boolean };

type Props = {
  imageUrl: string;
  watermark: boolean;
  deliverableId: string;
  comments: Pin[];
  addComment: (formData: FormData) => Promise<void>;
  resolveComment: (commentId: string, deliverableId: string) => Promise<void>;
};

const clamp = (n: number) => Math.min(1, Math.max(0, n));

export function ImageAnnotator({ imageUrl, watermark, deliverableId, comments, addComment, resolveComment }: Props) {
  const [draft, setDraft] = useState<{ x: number; y: number } | null>(null);
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const wrapRef = useRef<HTMLDivElement>(null);

  function onImageClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    setDraft({ x: clamp((e.clientX - rect.left) / rect.width), y: clamp((e.clientY - rect.top) / rect.height) });
    setText("");
  }

  function submitDraft() {
    if (!draft || !text.trim()) return;
    const fd = new FormData();
    fd.set("posX", String(draft.x));
    fd.set("posY", String(draft.y));
    fd.set("body", text.trim());
    startTransition(async () => { await addComment(fd); setDraft(null); setText(""); });
  }

  const open = comments.filter((c) => !c.resolved);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 264px", gap: 18, alignItems: "start" }}>
      <div ref={wrapRef} onClick={onImageClick} style={{ position: "relative", cursor: "crosshair", lineHeight: 0, borderRadius: "var(--r-md)", overflow: "hidden", border: "1px solid var(--glass-border)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="Asset draft" style={{ width: "100%", display: "block" }} />
        {watermark && <div style={watermarkOverlay}>DRAFT — FOR APPROVAL</div>}

        {open.map((c, i) => (
          <span key={c.id} style={{ ...pin, left: `${c.x * 100}%`, top: `${c.y * 100}%` }} title={c.body}>{i + 1}</span>
        ))}

        {draft && (
          <div style={{ ...draftBox, left: `${draft.x * 100}%`, top: `${draft.y * 100}%` }} onClick={(e) => e.stopPropagation()}>
            <textarea autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="Comment on this spot…" rows={2}
              className="field" style={{ fontSize: 13, resize: "vertical" }} />
            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <button onClick={submitDraft} disabled={pending} className="btn btn-primary btn-sm">Add</button>
              <button onClick={() => setDraft(null)} className="btn btn-ghost btn-sm">Cancel</button>
            </div>
          </div>
        )}
      </div>

      <div>
        <p className="eyebrow" style={{ marginBottom: 10 }}>{open.length} open · click to add</p>
        {open.map((c, i) => (
          <div key={c.id} className="card" style={{ padding: "9px 11px", marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={pinInline}>{i + 1}</span>
              <span style={{ flex: 1, fontSize: 14 }}>{c.body}</span>
            </div>
            <button onClick={() => startTransition(() => resolveComment(c.id, deliverableId))} disabled={pending}
              className="btn btn-ghost btn-sm" style={{ marginTop: 6, fontSize: 12, padding: "3px 10px" }}>Resolve</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const pin: React.CSSProperties = {
  position: "absolute", transform: "translate(-50%,-50%)", width: 24, height: 24, borderRadius: 999,
  background: "linear-gradient(120deg,var(--gold-deep),var(--champagne))", color: "#241a08", fontSize: 12, fontWeight: 700,
  display: "grid", placeItems: "center", cursor: "default", boxShadow: "0 2px 12px rgba(216,184,120,0.55)", border: "1px solid rgba(255,246,226,0.6)",
};
const pinInline: React.CSSProperties = {
  width: 20, height: 20, borderRadius: 999, background: "linear-gradient(120deg,var(--gold-deep),var(--champagne))",
  color: "#241a08", fontSize: 11, fontWeight: 700, display: "grid", placeItems: "center", flex: "0 0 auto",
};
const draftBox: React.CSSProperties = {
  position: "absolute", transform: "translate(-50%, 12px)", zIndex: 5, width: 224, padding: 8,
  background: "rgba(12,12,19,0.92)", backdropFilter: "blur(14px)", border: "1px solid var(--glass-border)", borderRadius: 12,
};
const watermarkOverlay: React.CSSProperties = {
  position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "rgba(255,255,255,0.26)",
  fontWeight: 800, fontSize: "clamp(18px, 5vw, 46px)", letterSpacing: 3, transform: "rotate(-18deg)",
  pointerEvents: "none", userSelect: "none", fontFamily: "var(--font-display), serif",
};
