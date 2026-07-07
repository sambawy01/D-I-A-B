import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { signOut } from "@/app/login/actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div style={{ minHeight: "100vh" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 24px",
          borderBottom: "1px solid #1e1e26",
        }}
      >
        <nav style={{ display: "flex", gap: 18, alignItems: "baseline" }}>
          <Link href="/app" style={{ fontWeight: 700, textDecoration: "none", color: "var(--fg)" }}>
            DIAB
          </Link>
          <Link href="/app" style={navLink}>Deals</Link>
          <Link href="/app/calendar" style={navLink}>Calendar</Link>
          <Link href="/app/deals/new" style={navLink}>New deal</Link>
        </nav>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <span style={{ color: "var(--muted)", fontSize: 13 }}>{user.email}</span>
          <form action={signOut}>
            <button type="submit" style={signOutBtn}>Sign out</button>
          </form>
        </div>
      </header>
      <main style={{ padding: "28px 24px", maxWidth: 1100, margin: "0 auto" }}>{children}</main>
    </div>
  );
}

const navLink: React.CSSProperties = { color: "var(--muted)", textDecoration: "none", fontSize: 14 };
const signOutBtn: React.CSSProperties = {
  padding: "6px 12px",
  borderRadius: 8,
  border: "1px solid #2a2a33",
  background: "transparent",
  color: "var(--fg)",
  cursor: "pointer",
  fontSize: 13,
};
