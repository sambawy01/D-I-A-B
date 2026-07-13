import { Logo } from "../logo";
import { signIn, signUp } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}) {
  const { error, message, next } = await searchParams;

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div className="glass reveal reveal-1" style={{ width: "100%", maxWidth: 400, padding: "34px 32px" }}>
        <div style={{ marginBottom: 22 }}>
          <Logo size={30} />
        </div>
        <h1 className="display" style={{ fontSize: 30, margin: "0 0 6px" }}>Welcome back</h1>
        <p style={{ color: "var(--muted)", marginTop: 0, marginBottom: 24, fontSize: 15 }}>
          Sign in to your deal hub.
        </p>

        {error && <p style={banner("rgba(220,90,90,0.12)", "#f2b0b0", "rgba(220,90,90,0.3)")}>{error}</p>}
        {message && <p style={banner("rgba(90,200,140,0.1)", "#9fe6bd", "rgba(90,200,140,0.28)")}>{message}</p>}

        <form>
          <input type="hidden" name="next" value={next ?? "/app"} />
          <label className="field-label">Email</label>
          <input name="email" type="email" required autoComplete="email" className="field" />
          <div style={{ height: 14 }} />
          <label className="field-label">Password</label>
          <input name="password" type="password" required minLength={6} autoComplete="current-password" className="field" />

          <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
            <button formAction={signIn} className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}>Sign in</button>
            <button formAction={signUp} className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }}>Create account</button>
          </div>
        </form>
      </div>
    </main>
  );
}

function banner(bg: string, fg: string, border: string): React.CSSProperties {
  return {
    background: bg, color: fg, padding: "10px 13px", borderRadius: 10,
    fontSize: 14, border: `1px solid ${border}`, marginBottom: 16,
  };
}
