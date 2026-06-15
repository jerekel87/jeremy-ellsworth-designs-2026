import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";

export default function Login() {
  const { session, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) navigate(from, { replace: true });
  }, [session, from, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message === "Invalid login credentials" ? "Wrong email or password." : (err.message || "Could not sign in."));
      setBusy(false);
    }
  }

  return (
    <main className="login-bare">
      <div className="login-stack">
        <Link className="login-back" to="/" aria-label="Back to je.design">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5m6 6-6-6 6-6" /></svg>
        </Link>
        <div className="login-card">
          <img src="/assets/img/logo-white.webp" alt="je.design" width="44" height="42" />
          <h1>Studio <em>CMS</em></h1>
          <p>Sign in to manage the site content.</p>
          <form onSubmit={handleSubmit}>
            <label>
              <span>Email</span>
              <input type="email" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </label>
            <label>
              <span>Password</span>
              <input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            </label>
            <button className="btn btn--solid" type="submit" disabled={busy}><span>{busy ? "Signing in…" : "Sign in"}</span></button>
          </form>
          {error && <p className="login-note" style={{ color: "#c0392b" }}>{error}</p>}
          <p className="login-foot">Admin access only — there are no self-serve signups.</p>
        </div>
      </div>
    </main>
  );
}
