import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthBackdrop from "../components/auth/AuthBackdrop";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import StatusPill from "../components/common/StatusPill";
import { useAuth } from "../contexts/AuthContext";
import { validatePassword } from "../utils/authValidation";

function getStrengthTier(password) {
  if (!password) {
    return 0;
  }

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Za-z]/.test(password) && /\d/.test(password)) score += 1;
  if (password.length >= 12 || /[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.max(score, password.length >= 8 ? 1 : 0);
}

const STRENGTH_META = {
  1: { label: "Weak", textClass: "text-[var(--tone-error-text)]", barClass: "bg-[var(--tone-error-text)]/70" },
  2: { label: "Medium", textClass: "text-[var(--tone-warning-text)]", barClass: "bg-[var(--tone-warning-text)]/70" },
  3: { label: "Strong", textClass: "text-[var(--tone-success-text)]", barClass: "bg-[var(--tone-success-text)]/70" }
};

function StrengthMeter({ password }) {
  const tier = getStrengthTier(password);
  const meta = STRENGTH_META[tier];

  return (
    <div className="mt-3" aria-live="polite">
      <div className="flex gap-1.5">
        {[1, 2, 3].map((segment) => (
          <span
            key={segment}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              tier >= segment && meta ? meta.barClass : "bg-[var(--panel-muted)]"
            }`}
          />
        ))}
      </div>
      {meta ? (
        <p className={`mt-1.5 text-xs font-medium ${meta.textClass}`}>
          Password strength: {meta.label}
        </p>
      ) : null}
    </div>
  );
}

function VisibilityButton({ visible, onToggle, label }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      aria-pressed={visible}
      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="h-5 w-5">
        <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
          <circle cx="12" cy="12" r="3" />
          {!visible ? <path d="M4 20 20 4" /> : null}
        </g>
      </svg>
    </button>
  );
}

function describeResetError(error) {
  const message = error?.message || "";

  if (/session/i.test(message)) {
    return "This reset link is invalid or has expired. Please request a new reset email.";
  }
  if (/expired|invalid/i.test(message)) {
    return "This reset link is invalid or has expired. Please request a new reset email.";
  }
  if (/different/i.test(message)) {
    return "Your new password must be different from the previous one.";
  }
  if (/network|fetch/i.test(message)) {
    return "Network problem. Check your connection and try again.";
  }

  return message || "Unable to update your password. Please try again.";
}

function ResetPasswordPage() {
  const { authMode, loading, isAuthenticated, updatePassword, signOut } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "success") {
      return;
    }
    if (loading) {
      setStatus("checking");
      return;
    }
    if (authMode !== "supabase") {
      setStatus("unavailable");
    } else if (isAuthenticated) {
      setStatus("form");
    } else {
      setStatus("invalid");
    }
  }, [loading, authMode, isAuthenticated, status]);

  const passwordsMatch = confirmPassword === password;
  const matchState =
    !confirmPassword ? "idle" : passwordsMatch ? "match" : "mismatch";

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    const errors = {};
    const passwordError = validatePassword(password, { forSignUp: true });
    if (passwordError) {
      errors.password = passwordError;
    }
    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your new password.";
    } else if (!passwordsMatch) {
      errors.confirmPassword = "Passwords do not match.";
    }
    setFieldErrors(errors);

    if (Object.keys(errors).length) {
      return;
    }

    setSubmitting(true);
    try {
      await updatePassword(password);
      setStatus("success");
      await signOut();
    } catch (error) {
      setFormError(describeResetError(error));
    } finally {
      setSubmitting(false);
    }
  }

  function handleBackToLogin() {
    navigate("/auth", { replace: true });
  }

  function handleRequestNewLink() {
    navigate("/auth", { replace: true });
  }

  return (
    <div className="relative min-h-screen bg-[var(--surface)] px-4 py-10 sm:px-6">
      <AuthBackdrop />

      <div className="mx-auto flex w-full max-w-md flex-col items-center">
        <Card className={`w-full p-7 sm:p-9 auth-enter`}>
          {status === "checking" ? (
            <div className="flex flex-col items-center py-10 text-center">
              <span
                aria-hidden="true"
                className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)]/30 border-t-[var(--accent)]"
              />
              <p className="mt-4 text-sm text-[var(--text-secondary)]">
                Verifying your reset link...
              </p>
            </div>
          ) : status === "success" ? (
            <div className="flex flex-col items-center py-4 text-center">
              <span
                aria-hidden="true"
                className="auth-enter flex h-14 w-14 items-center justify-center rounded-full bg-[var(--tone-success-bg)]"
              >
                <svg viewBox="0 0 24 24" className="h-7 w-7 text-[var(--tone-success-text)]">
                  <path
                    d="M5 13l4 4L19 7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                Password updated successfully.
              </h2>
              <p className="mt-2 max-w-xs text-sm leading-6 text-[var(--text-secondary)]">
                Your password has been changed. You can now sign in with your new password.
              </p>
              <Button className="mt-7 w-full" size="lg" onClick={handleBackToLogin}>
                Back to Login
              </Button>
            </div>
          ) : status === "invalid" || status === "unavailable" ? (
            <div className="flex flex-col items-center py-4 text-center">
              <span
                aria-hidden="true"
                className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--tone-warning-bg)]"
              >
                <svg viewBox="0 0 24 24" className="h-7 w-7 text-[var(--tone-warning-text)]">
                  <path
                    d="M12 8v5m0 3.5h.01M10.3 4.2 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                {status === "unavailable"
                  ? "Password reset unavailable"
                  : "Reset link is invalid"}
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--text-secondary)]">
                {status === "unavailable"
                  ? "Password recovery requires a Supabase connection. This session is running in demo mode."
                  : "This password reset link is invalid or has expired. Request a new reset email to continue."}
              </p>
              <Button className="mt-7 w-full" size="lg" onClick={handleRequestNewLink}>
                Back to Login
              </Button>
            </div>
          ) : (
            <>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.34em] text-[var(--accent)]">
                <span
                  aria-hidden="true"
                  className="h-px w-6 bg-[linear-gradient(90deg,var(--accent),var(--accent-2))]"
                ></span>
                DevDNA
              </p>

              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-[1.7rem]">
                Reset your password
              </h1>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                Create a new password for your account.
              </p>

              {formError ? (
                <div
                  role="alert"
                  className="mt-5 rounded-2xl border border-[var(--tone-error-text)]/30 bg-[var(--tone-error-text)]/10 px-4 py-3"
                >
                  <p className="text-sm leading-6 text-[var(--tone-error-text)]">
                    {formError}
                  </p>
                  <button
                    type="button"
                    onClick={handleRequestNewLink}
                    className="mt-1 text-sm font-semibold text-[var(--accent)] underline-offset-4 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded"
                  >
                    Request a new reset email
                  </button>
                </div>
              ) : null}

              <form className="mt-7 space-y-5" onSubmit={handleSubmit} noValidate>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                    New Password
                  </span>
                  <span className="relative block">
                    <input
                      id="new-password"
                      required
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setFieldErrors((current) => ({ ...current, password: "" }));
                      }}
                      autoComplete="new-password"
                      minLength={8}
                      aria-invalid={Boolean(fieldErrors.password)}
                      className="field pr-12"
                      placeholder="At least 8 characters with letters and numbers"
                    />
                    <VisibilityButton
                      visible={showPassword}
                      onToggle={() => setShowPassword((current) => !current)}
                      label={showPassword ? "Hide password" : "Show password"}
                    />
                  </span>
                  {fieldErrors.password ? (
                    <p className="mt-2 text-sm text-[var(--tone-error-text)]">
                      {fieldErrors.password}
                    </p>
                  ) : (
                    <StrengthMeter password={password} />
                  )}
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                    Confirm Password
                  </span>
                  <span className="relative block">
                    <input
                      id="confirm-password"
                      required
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(event) => {
                        setConfirmPassword(event.target.value);
                        setFieldErrors((current) => ({
                          ...current,
                          confirmPassword: ""
                        }));
                      }}
                      onBlur={() => setConfirmTouched(true)}
                      autoComplete="new-password"
                      aria-invalid={Boolean(fieldErrors.confirmPassword)}
                      className="field pr-12"
                      placeholder="Enter your new password again"
                    />
                    <VisibilityButton
                      visible={showConfirmPassword}
                      onToggle={() => setShowConfirmPassword((current) => !current)}
                      label={showConfirmPassword ? "Hide password" : "Show password"}
                    />
                  </span>
                  {fieldErrors.confirmPassword ? (
                    <p className="mt-2 text-sm text-[var(--tone-error-text)]">
                      {fieldErrors.confirmPassword}
                    </p>
                  ) : matchState === "match" ? (
                    <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-[var(--tone-success-text)]">
                      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                        <path
                          d="M5 13l4 4L19 7"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Passwords match.
                    </p>
                  ) : matchState === "mismatch" ? (
                    <p
                      className={`mt-2 text-sm ${
                        confirmTouched
                          ? "text-[var(--tone-error-text)]"
                          : "text-[var(--text-secondary)]"
                      }`}
                    >
                      Passwords don&apos;t match yet.
                    </p>
                  ) : null}
                </label>

                <Button
                  className="mt-2 w-full"
                  size="lg"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span
                        aria-hidden="true"
                        className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                      />
                      Updating password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>

              <div className="mt-5 flex items-center justify-between gap-3">
                <StatusPill tone="info">Secure Supabase auth</StatusPill>
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="rounded-lg text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >
                  Cancel and log in
                </button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
