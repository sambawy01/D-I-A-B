"use client";

import { useRef, useState, useTransition } from "react";

export type Pin = { id: string; x: number; y: number; body: string; resolved: boolean };

type Props = {
  imageUrl: string;
  watermark: boolean;
  deliverableId: string;
  comments: Pin[];
  addComment: (formData: FormData) => Promise<void>; // pre-bound with assetId + deliverableId
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
    startTransition(async () => {
      await addComment(fd);
      setDraft(null);
      setText("");
    });
  }

  const open = comments.filter((c) => !c.resolved);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 260px", gap: 16, alignItems: "start" }}>
      <div ref={wrapRef} onClick={onImageClick} style={{ position: "relative", cursor: "crosshair", lineHeight: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="Asset draft" style={{ width: "100%", borderRadius: 10, display: "block" }} />

        {watermark && <div style={watermarkOverlay}>DRAFT — FOR APPROVAL</div>}

        {open.map((c, i) => (
          <span key={c.id} style={{ ...pin, left: `${c.x * 100}%`, top: `${c.y * 100}%` }} title={c.body}>
            {i + 1}
          </span>
        ))}

        {draft && (
          <div
            style={{ ...draftBox, left: `${draft.x * 100}%`, top: `${draft.y * 100}%` }}
            onClick={(e) => e.stopPropagation()}
          >
            <textarea
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Comment on this spot…"
              rows={2}
              style={draftInput}
            />
            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <button onClick={submitDraft} disabled={pending} style={okBtn}>Add</button>
              <button onClick={() => setDraft(null)} style={cancelBtn}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      <div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>
          {open.length} open comment{open.length === 1 ? "" : "s"} · click the image to add
        </div>
        {open.map((c, i) => (
          <div key={c.id} style={commentCard}>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={pinInline}>{i + 1}</span>
              <span style={{ flex: 1, fontSize: 14 }}>{c.body}</span>
            </div>
            <button
              onClick={() => startTransition(() => resolveComment(c.id, deliverableId))}
              disabled={pending}
              style={resolveBtn}
            >
              Resolve
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const pin: React.CSSProperties = {
  position: "absolute", transform: "translate(-50%,-50%)",
  width: 22, height: 22, borderRadius: 999, background: "var(--accent)", color: "#1a1200",
  fontSize: 12, fontWeight: 700, display: "grid", placeItems: "center", cursor: "default",
  boxShadow: "0 2px 8px rgba(0,0,0,.5)",
};
const pinInline: React.CSSProperties = {
  width: 20, height: 20, borderRadius: 999, background: "var(--accent)", color: "#1a1200",
  fontSize: 11, fontWeight: 700, display: "grid", placeItems: "center", flex: "0 0 auto",
};
const draftBox: React.CSSProperties = {
  position: "absolute", transform: "translate(-50%, 12px)", zIndex: 5,
  background: "#0e0e13", border: "1px solid #2a2a33", borderRadius: 10, padding: 8, width: 220,
};
const draftInput: React.CSSProperties = {
  width: "100%", background: "#141419", color: "var(--fg)", border: "1px solid #2a2a33",
  borderRadius: 6, padding: "6px 8px", fontSize: 13, resize: "vertical", lineHeight: 1.4,
};
const okBtn: React.CSSProperties = { border: "none", background: "var(--accent)", color: "#1a1200", fontWeight: 600, borderRadius: 6, padding: "5px 12px", cursor: "pointer" };
const cancelBtn: React.CSSProperties = { border: "1px solid #2a2a33", background: "transparent", color: "var(--fg)", borderRadius: 6, padding: "5px 12px", cursor: "pointer" };
const commentCard: React.CSSProperties = {
  border: "1px solid #1e1e26", borderRadius: 10, padding: "8px 10px", marginBottom: 8, background: "#101015",
};
const resolveBtn: React.CSSProperties = {
  marginTop: 6, border: "1px solid #2a2a33", background: "transparent", color: "var(--muted)",
  borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontSize: 12,
};
const watermarkOverlay: React.CSSProperties = {
  position: "absolute", inset: 0, display: "grid", placeItems: "center",
  color: "rgba(255,255,255,.28)", fontWeight: 800, fontSize: "clamp(18px, 5vw, 44px)",
  letterSpacing: 2, transform: "rotate(-18deg)", pointerEvents: "none", userSelect: "none",
};
