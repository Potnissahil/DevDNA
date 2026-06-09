import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AccountPicker from "../components/auth/AccountPicker";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import StatusPill from "../components/common/StatusPill";
import { useAuth } from "../contexts/AuthContext";
import { useToasts } from "../contexts/ToastContext";
import {
  listRememberedAccounts,
  removeRememberedAccount
} from "../lib/accountStore";
import { validateSignIn, validateSignUp } from "../utils/authValidation";

const blankForm = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: ""
};

function AuthPage() {
  const rememberedOnLoad = listRememberedAccounts();
  const [mode, setMode] = useState("login");
  const [authView, setAuthView] = useState(
    rememberedOnLoad.length ? "picker" : "form"
  );
  const [rememberedAccounts, setRememberedAccounts] = useState(rememberedOnLoad);
  const [form, setForm] = useState(blankForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp, authMode } = useAuth();
  const { pushToast } = useToasts();
  const navigate = useNavigate();
  const location = useLocation();

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: "" }));
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setFieldErrors({});
    if (nextMode === "signup") {
      setAuthView("form");
    }
  }

  function handleContinueAccount(account) {
    setForm({
      ...blankForm,
      email: account.email
    });
    setMode("login");
    setAuthView("form");
    setFieldErrors({});
  }

  function handleRemoveAccount(email) {
    const nextAccounts = removeRememberedAccount(email);
    setRememberedAccounts(nextAccounts);
    if (!nextAccounts.length) {
      setAuthView("form");
    }
    pushToast({
      title: "Account removed",
      description: "This account was removed from your saved list on this device."
    });
  }

  function handleUseAnotherAccount() {
    setForm(blankForm);
    setMode("login");
    setAuthView("form");
    setFieldErrors({});
  }

  function handleBackToPicker() {
    const accounts = listRememberedAccounts();
    setRememberedAccounts(accounts);
    if (accounts.length) {
      setAuthView("picker");
      setFieldErrors({});
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setFieldErrors({});

    const validationErrors =
      mode === "login"
        ? validateSignIn({ email: form.email, password: form.password })
        : validateSignUp({
            fullName: form.fullName,
            email: form.email,
            password: form.password,
            confirmPassword: form.confirmPassword
          });

    if (Object.keys(validationErrors).length) {
      setFieldErrors(validationErrors);
      setSubmitting(false);
      return;
    }

    try {
      if (mode === "login") {
        await signIn({ email: form.email, password: form.password });
        pushToast({ title: "Welcome back", description: "Your workspace is ready." });
        navigate(location.state?.from || "/", { replace: true });
      } else {
        const result = await signUp({
          email: form.email,
          password: form.password,
          fullName: form.fullName
        });

        if (result.needsEmailConfirmation) {
          pushToast({
            title: "Confirm your email",
            description: `We sent a confirmation link to ${result.email}. Sign in after confirming.`
          });
          setMode("login");
          setForm({ ...blankForm, email: result.email });
          setAuthView("form");
          return;
        }

        pushToast({
          title: "Account ready",
          description:
            authMode === "supabase"
              ? "Your account was created successfully."
              : "You are using the local preview workspace until Supabase is configured."
        });
        navigate(location.state?.from || "/", { replace: true });
      }
    } catch (error) {
      pushToast({
        title: "Authentication failed",
        description: error.message || "Please check your details and try again."
      });
    } finally {
      setSubmitting(false);
    }
  }

  const showPicker = authView === "picker" && mode === "login" && rememberedAccounts.length > 0;

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
          {showPicker ? (
            <AccountPicker
              accounts={rememberedAccounts}
              onContinue={handleContinueAccount}
              onRemove={handleRemoveAccount}
              onUseAnother={handleUseAnotherAccount}
            />
          ) : (
            <>
              <div className="flex gap-2 rounded-2xl bg-[var(--panel-muted)] p-1">
                <button
                  type="button"
                  onClick={() => switchMode("login")}
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
                  onClick={() => switchMode("signup")}
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
                {rememberedAccounts.length && mode === "login" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3"
                    onClick={handleBackToPicker}
                  >
                    Back to saved accounts
                  </Button>
                ) : null}
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
                      placeholder="Your full name"
                    />
                    {fieldErrors.fullName ? (
                      <p className="mt-2 text-sm text-[var(--tone-error-text)]">
                        {fieldErrors.fullName}
                      </p>
                    ) : null}
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
                    readOnly={mode === "login" && Boolean(form.email) && rememberedAccounts.some(
                      (account) => account.email === form.email.trim().toLowerCase()
                    )}
                  />
                  {fieldErrors.email ? (
                    <p className="mt-2 text-sm text-[var(--tone-error-text)]">{fieldErrors.email}</p>
                  ) : null}
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                    Password
                  </span>
                  <input
                    required
                    minLength={mode === "signup" ? 8 : 6}
                    type="password"
                    value={form.password}
                    onChange={(event) => updateField("password", event.target.value)}
                    className="field"
                    placeholder={
                      mode === "signup"
                        ? "At least 8 characters with letters and numbers"
                        : "Enter your password"
                    }
                  />
                  {fieldErrors.password ? (
                    <p className="mt-2 text-sm text-[var(--tone-error-text)]">
                      {fieldErrors.password}
                    </p>
                  ) : null}
                </label>

                {mode === "signup" ? (
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                      Confirm password
                    </span>
                    <input
                      required
                      minLength={8}
                      type="password"
                      value={form.confirmPassword}
                      onChange={(event) => updateField("confirmPassword", event.target.value)}
                      className="field"
                      placeholder="Re-enter your password"
                    />
                    {fieldErrors.confirmPassword ? (
                      <p className="mt-2 text-sm text-[var(--tone-error-text)]">
                        {fieldErrors.confirmPassword}
                      </p>
                    ) : null}
                  </label>
                ) : null}

                <Button className="mt-2 w-full" size="lg" type="submit" disabled={submitting}>
                  {submitting
                    ? "Working..."
                    : mode === "login"
                      ? "Login to DevDNA"
                      : "Create account"}
                </Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

export default AuthPage;
