import { signIn, signUp } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}) {
  const { error, message, next } = await searchParams;

  return (
    <main style={{ maxWidth: 380, margin: "0 auto", padding: "12vh 24px" }}>
      <h1 style={{ fontSize: 28, marginBottom: 4 }}>DIAB</h1>
      <p style={{ color: "var(--muted)", marginTop: 0, marginBottom: 28 }}>
        Sign in to your deal hub.
      </p>

      {error && <p style={banner("#3a1114", "#f5a5a5")}>{error}</p>}
      {message && <p style={banner("#12321a", "#9fe0b0")}>{message}</p>}

      <form>
        <input type="hidden" name="next" value={next ?? "/app"} />
        <label style={label}>Email</label>
        <input name="email" type="email" required autoComplete="email" style={input} />
        <label style={label}>Password</label>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="current-password"
          style={input}
        />

        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button formAction={signIn} style={primaryBtn}>Sign in</button>
          <button formAction={signUp} style={secondaryBtn}>Create account</button>
        </div>
      </form>
    </main>
  );
}

const label: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  color: "var(--muted)",
  margin: "14px 0 6px",
};
const input: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #2a2a33",
  background: "#141419",
  color: "var(--fg)",
  fontSize: 15,
};
const primaryBtn: React.CSSProperties = {
  flex: 1,
  padding: "10px 12px",
  borderRadius: 8,
  border: "none",
  background: "var(--accent)",
  color: "#1a1200",
  fontWeight: 600,
  cursor: "pointer",
};
const secondaryBtn: React.CSSProperties = {
  flex: 1,
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #2a2a33",
  background: "transparent",
  color: "var(--fg)",
  cursor: "pointer",
};
function banner(bg: string, fg: string): React.CSSProperties {
  return { background: bg, color: fg, padding: "10px 12px", borderRadius: 8, fontSize: 14 };
}
