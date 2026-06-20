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
import { validateEmail, validateSignIn, validateSignUp } from "../utils/authValidation";

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
  const { signIn, signUp, requestPasswordReset, authMode } = useAuth();
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
      description: "The saved account was removed from this device."
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

  function handleForgotPassword() {
    setMode("login");
    setAuthView("reset");
    setFieldErrors({});
  }

  function handleBackToLogin() {
    setMode("login");
    setAuthView("form");
    setFieldErrors({});
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
        pushToast({ title: "Logged in successfully.", description: "Welcome back." });
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
            description: `We sent a confirmation link to ${result.email}. Log in after confirming your email.`
          });
          setMode("login");
          setForm({ ...blankForm, email: result.email });
          setAuthView("form");
          return;
        }

        pushToast({
          title: "Account created successfully.",
          description:
            authMode === "supabase"
              ? "Your account is ready to use."
              : "Demo mode is active. Your data will be stored in this browser."
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

  async function handleResetSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setFieldErrors({});

    const emailError = validateEmail(form.email);
    if (emailError) {
      setFieldErrors({ email: emailError });
      setSubmitting(false);
      return;
    }

    try {
      await requestPasswordReset(form.email);
      pushToast({
        title: "Password reset link sent.",
        description: "Check your email."
      });
      setAuthView("form");
    } catch (error) {
      pushToast({
        title: "Unable to send reset email",
        description: error.message || "Please try again."
      });
    } finally {
      setSubmitting(false);
    }
  }

  const showPicker = authView === "picker" && mode === "login" && rememberedAccounts.length > 0;
  const showResetForm = authView === "reset";

  return (
    <div className="min-h-screen bg-[var(--surface)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[36px] bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] p-8 text-white shadow-[0_24px_60px_rgba(11,38,77,0.32)] sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/80">
            DevDNA
          </p>
          <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
            Track your learning, projects, and GitHub activity in one place.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/85">
            Sign in to manage your skills, learning goals, projects, and profile from a single dashboard.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <StatusPill tone="info">Skills tracking</StatusPill>
            <StatusPill tone="info">Learning goals</StatusPill>
            <StatusPill tone="info">GitHub activity</StatusPill>
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
          ) : showResetForm ? (
            <>
              <div className="mt-2">
                <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
                  Reset your password
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  Enter your email address and we&apos;ll send you a password reset link.
                </p>
              </div>

              <form className="mt-8 space-y-4" onSubmit={handleResetSubmit}>
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
                    placeholder="e.g. priya@example.com"
                  />
                  {fieldErrors.email ? (
                    <p className="mt-2 text-sm text-[var(--tone-error-text)]">{fieldErrors.email}</p>
                  ) : null}
                </label>

                <Button className="mt-2 w-full" size="lg" type="submit" disabled={submitting}>
                  {submitting ? "Sending..." : "Send reset link"}
                </Button>
              </form>

              <Button
                variant="ghost"
                size="sm"
                className="mt-4"
                onClick={handleBackToLogin}
              >
                Back to log in
              </Button>
            </>
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
                  Log in
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
                  Sign up
                </button>
              </div>

              <div className="mt-6">
                <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
                  {mode === "login" ? "Log in to DevDNA" : "Create your DevDNA account"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  {authMode === "supabase"
                    ? "Use your account details to access the application."
                    : "Demo mode is active. Your data will be saved in this browser."}
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
                {mode === "login" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3"
                    onClick={handleForgotPassword}
                  >
                    Forgot Password?
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
                      placeholder="e.g. Priya Mehta"
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
                    placeholder="e.g. priya@example.com"
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
                      placeholder="Enter your password again"
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
                      ? "Log in"
                      : "Sign up"}
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
