import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import StatusPill from "../components/common/StatusPill";
import { useAuth } from "../contexts/AuthContext";
import { useToasts } from "../contexts/ToastContext";

function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp, authMode } = useAuth();
  const { pushToast } = useToasts();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (mode === "login") {
        await signIn({ email: form.email, password: form.password });
        pushToast({ title: "Welcome back", description: "Your workspace is ready." });
      } else {
        await signUp({
          email: form.email,
          password: form.password,
          fullName: form.fullName
        });
        pushToast({
          title: "Account ready",
          description:
            authMode === "supabase"
              ? "Your account was created successfully."
              : "You are using the local preview workspace until Supabase is configured."
        });
      }

      navigate(location.state?.from || "/", { replace: true });
    } catch (error) {
      pushToast({
        title: "Authentication failed",
        description: error.message || "Please check your details and try again."
      });
    } finally {
      setSubmitting(false);
    }
  }

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="min-h-screen bg-[var(--surface)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[36px] bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] p-8 text-white shadow-[0_24px_60px_rgba(11,38,77,0.32)] sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/80">
            DevDNA SaaS
          </p>
          <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
            Turn engineering activity into a strategy your team can actually act on.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/85">
            Secure sign-in, GitHub analytics, learning dashboards, project tracking,
            architecture reviews, and a polished SaaS experience in one workspace.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <StatusPill tone="info">Protected routes</StatusPill>
            <StatusPill tone="info">Light and dark themes</StatusPill>
            <StatusPill tone="info">Supabase-ready CRUD</StatusPill>
          </div>
        </section>

        <Card className="p-6 sm:p-8">
          <div className="flex gap-2 rounded-2xl bg-[var(--panel-muted)] p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                mode === "login"
                  ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                mode === "signup"
                  ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="mt-6">
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
              {mode === "login" ? "Access your workspace" : "Create your DevDNA account"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              {authMode === "supabase"
                ? "Supabase authentication is active."
                : "Supabase is not configured yet, so the app will use local preview mode with persistent browser storage."}
            </p>
          </div>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            {mode === "signup" ? (
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                  Full name
                </span>
                <input
                  required
                  value={form.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                  className="field"
                  placeholder="Your Full Name"
                />
              </label>
            ) : null}

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                Email
              </span>
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="field"
                placeholder="you@gmail.com"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                Password
              </span>
              <input
                required
                minLength={6}
                type="password"
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                className="field"
                placeholder="Minimum 6 characters"
              />
            </label>

            <Button className="mt-2 w-full" size="lg" type="submit" disabled={submitting}>
              {submitting
                ? "Working..."
                : mode === "login"
                  ? "Login to DevDNA"
                  : "Create account"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default AuthPage;
