const ERROR_MESSAGES = {
  user_already_exists: "This email is already registered. Try logging in instead.",
  email_exists: "This email is already registered. Try logging in instead.",
  invalid_credentials: "Invalid email or password. Please try again.",
  email_not_confirmed: "Please confirm your email before logging in.",
  weak_password: "Password is too weak. Use at least 8 characters with letters and numbers.",
  signup_disabled: "Sign up is currently disabled. Contact support.",
  over_request_rate_limit: "Too many attempts. Please wait a moment and try again."
};

export function formatAuthError(error) {
  const code = error?.code || "";
  const message = error?.message || "";

  if (ERROR_MESSAGES[code]) {
    return new Error(ERROR_MESSAGES[code]);
  }

  if (/already registered|already exists/i.test(message)) {
    return new Error(ERROR_MESSAGES.user_already_exists);
  }

  if (/invalid login credentials/i.test(message)) {
    return new Error(ERROR_MESSAGES.invalid_credentials);
  }

  if (/email not confirmed/i.test(message)) {
    return new Error(ERROR_MESSAGES.email_not_confirmed);
  }

  return new Error(message || "Authentication failed. Please try again.");
}
