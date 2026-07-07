import Link from "next/link";
import { DealForm } from "../deal-form";
import { createDeal } from "../actions";

export default function NewDealPage() {
  return (
    <div>
      <Link href="/app" style={{ color: "var(--muted)", fontSize: 13 }}>← Deals</Link>
      <h1 style={{ fontSize: 24, marginTop: 8 }}>New deal</h1>
      <DealForm action={createDeal} submitLabel="Create deal" />
    </div>
  );
}
