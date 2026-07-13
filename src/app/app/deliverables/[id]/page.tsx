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
    <div className="reveal reveal-1">
      <Link href={deal ? `/app/deals/${deal.id}` : "/app"} className="nav-link" style={{ fontSize: 13 }}>
        ← {deal ? deal.title : "Deals"}
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 14, flexWrap: "wrap", gap: 10 }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 8 }}>Approval</p>
          <h1 className="display" style={{ fontSize: 34, margin: 0 }}>{deliverable.title}</h1>
        </div>
        <span className="chip">{deliverableStatusLabel(deliverable.status)}{deliverable.dueDate ? ` · due ${deliverable.dueDate}` : ""}</span>
      </div>

      {latest && url ? (
        <div style={{ marginTop: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ color: "var(--muted)", fontSize: 13 }}>Version {latest.version} · {latest.status.replace("_", " ")}</span>
            <div style={{ display: "flex", gap: 8 }}>
              <form action={setAssetStatus.bind(null, id, latest.id)}>
                <input type="hidden" name="status" value="changes_requested" />
                <button type="submit" className="btn btn-ghost btn-sm" style={{ color: "var(--gold)", borderColor: "rgba(216,184,120,0.35)" }}>Request changes</button>
              </form>
              <form action={setAssetStatus.bind(null, id, latest.id)}>
                <input type="hidden" name="status" value="approved" />
                <button type="submit" className="btn btn-primary btn-sm">Approve</button>
              </form>
            </div>
          </div>

          <ImageAnnotator imageUrl={url} watermark={latest.watermarkApplied} deliverableId={id}
            comments={comments} addComment={addComment.bind(null, latest.id, id)} resolveComment={resolveComment} />
        </div>
      ) : (
        <p style={{ color: "var(--muted)", marginTop: 20 }}>No draft uploaded yet.</p>
      )}

      <form action={uploadAsset.bind(null, id)} className="glass" style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", marginTop: 26, padding: 16 }}>
        <input type="file" name="file" accept="image/*" required style={{ color: "var(--fg)", fontSize: 13 }} />
        <label style={{ fontSize: 13, color: "var(--muted)", display: "flex", gap: 6, alignItems: "center" }}>
          <input type="checkbox" name="watermark" defaultChecked /> draft watermark
        </label>
        <button type="submit" className="btn btn-primary">Upload {latest ? "new version" : "draft"}</button>
      </form>

      {assets.length > 1 && (
        <div style={{ marginTop: 24 }}>
          <p className="eyebrow" style={{ marginBottom: 8 }}>Versions</p>
          {assets.map((a) => (
            <div key={a.id} style={{ fontSize: 13, color: "var(--muted)", padding: "3px 0" }}>
              v{a.version} · {a.status.replace("_", " ")} · {String(a.createdAt).slice(0, 10)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
