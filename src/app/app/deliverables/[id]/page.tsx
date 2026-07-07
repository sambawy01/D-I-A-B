import Link from "next/link";
import { notFound } from "next/navigation";
import { getDeliverable } from "@/lib/deliverables";
import { getDeal } from "@/lib/deals";
import { listAssets, signedUrl, listComments } from "@/lib/assets";
import { deliverableStatusLabel } from "@/lib/format";
import { ImageAnnotator, type Pin } from "../image-annotator";
import { uploadAsset, setAssetStatus, addComment, resolveComment } from "../actions";

export default async function DeliverablePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deliverable = await getDeliverable(id);
  if (!deliverable) notFound();

  const deal = await getDeal(deliverable.dealId);
  const assets = await listAssets(id);
  const latest = assets[0] ?? null;
  const url = latest ? await signedUrl(latest.storagePath) : null;
  const rawComments = latest ? await listComments(latest.id) : [];

  const comments: Pin[] = rawComments.map((c) => ({
    id: c.id,
    x: c.posX != null ? Number(c.posX) : 0.5,
    y: c.posY != null ? Number(c.posY) : 0.5,
    body: c.body,
    resolved: c.resolved,
  }));

  return (
    <div>
      <Link href={deal ? `/app/deals/${deal.id}` : "/app"} style={{ color: "var(--muted)", fontSize: 13 }}>
        ← {deal ? deal.title : "Deals"}
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 8 }}>
        <h1 style={{ fontSize: 24, margin: 0 }}>{deliverable.title}</h1>
        <span style={{ color: "var(--muted)", fontSize: 14 }}>
          {deliverableStatusLabel(deliverable.status)}
          {deliverable.dueDate ? ` · due ${deliverable.dueDate}` : ""}
        </span>
      </div>

      {/* Latest asset + approval */}
      {latest && url ? (
        <div style={{ marginTop: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ color: "var(--muted)", fontSize: 13 }}>
              Version {latest.version} · {latest.status.replace("_", " ")}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <form action={setAssetStatus.bind(null, id, latest.id)}>
                <input type="hidden" name="status" value="changes_requested" />
                <button type="submit" style={changesBtn}>Request changes</button>
              </form>
              <form action={setAssetStatus.bind(null, id, latest.id)}>
                <input type="hidden" name="status" value="approved" />
                <button type="submit" style={approveBtn}>Approve</button>
              </form>
            </div>
          </div>

          <ImageAnnotator
            imageUrl={url}
            watermark={latest.watermarkApplied}
            deliverableId={id}
            comments={comments}
            addComment={addComment.bind(null, latest.id, id)}
            resolveComment={resolveComment}
          />
        </div>
      ) : (
        <p style={{ color: "var(--muted)", marginTop: 18 }}>No draft uploaded yet.</p>
      )}

      {/* Upload new version */}
      <form action={uploadAsset.bind(null, id)} style={uploadForm}>
        <input type="file" name="file" accept="image/*" required style={{ color: "var(--fg)" }} />
        <label style={{ fontSize: 13, color: "var(--muted)", display: "flex", gap: 6, alignItems: "center" }}>
          <input type="checkbox" name="watermark" defaultChecked /> draft watermark
        </label>
        <button type="submit" style={uploadBtn}>Upload {latest ? "new version" : "draft"}</button>
      </form>

      {/* Version history */}
      {assets.length > 1 && (
        <div style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 14, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Versions
          </h2>
          {assets.map((a) => (
            <div key={a.id} style={{ fontSize: 13, color: "var(--muted)", padding: "4px 0" }}>
              v{a.version} · {a.status.replace("_", " ")} · {String(a.createdAt).slice(0, 10)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const uploadForm: React.CSSProperties = {
  display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap",
  marginTop: 24, padding: "14px", border: "1px solid #1e1e26", borderRadius: 10, background: "#0e0e13",
};
const uploadBtn: React.CSSProperties = { border: "none", background: "var(--accent)", color: "#1a1200", fontWeight: 600, borderRadius: 8, padding: "8px 16px", cursor: "pointer" };
const approveBtn: React.CSSProperties = { border: "none", background: "#2f7d4f", color: "#eafff0", fontWeight: 600, borderRadius: 8, padding: "7px 14px", cursor: "pointer" };
const changesBtn: React.CSSProperties = { border: "1px solid #4a3a1f", background: "transparent", color: "#e2b33f", borderRadius: 8, padding: "7px 14px", cursor: "pointer" };
