import Link from "next/link";
import { DealForm } from "../deal-form";
import { createDeal } from "../actions";

export default function NewDealPage() {
  return (
    <div className="reveal reveal-1">
      <Link href="/app" className="nav-link" style={{ fontSize: 13 }}>← Deals</Link>
      <p className="eyebrow" style={{ margin: "18px 0 8px" }}>New</p>
      <h1 className="display" style={{ fontSize: 34, marginTop: 0 }}>Create a deal</h1>
      <DealForm action={createDeal} submitLabel="Create deal" />
    </div>
  );
}
