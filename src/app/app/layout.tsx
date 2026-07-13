import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { computeNudges } from "@/lib/nudges";
import { signOut } from "@/app/login/actions";
import { Logo } from "@/app/logo";
import { HermesChat } from "./hermes-chat";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const nudges = await computeNudges();

  return (
    <div style={{ minHeight: "100vh" }}>
      <header
        className="glass"
        style={{
          position: "sticky", top: 0, zIndex: 30,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 22px", borderRadius: 0,
          borderLeft: "none", borderRight: "none", borderTop: "none",
        }}
      >
        <nav style={{ display: "flex", gap: 26, alignItems: "center" }}>
          <Link href="/app" aria-label="DIAB home"><Logo size={26} /></Link>
          <Link href="/app" className="nav-link">Deals</Link>
          <Link href="/app/calendar" className="nav-link">Calendar</Link>
          <Link href="/app/deals/new" className="nav-link">New deal</Link>
        </nav>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <span style={{ color: "var(--faint)", fontSize: 13 }}>{user.email}</span>
          <form action={signOut}>
            <button type="submit" className="btn btn-ghost btn-sm">Sign out</button>
          </form>
        </div>
      </header>

      <main style={{ padding: "34px 24px", maxWidth: 1120, margin: "0 auto" }}>{children}</main>
      <HermesChat nudges={nudges} />
    </div>
  );
}
