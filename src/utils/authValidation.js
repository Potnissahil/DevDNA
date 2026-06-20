const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export function validateEmail(email) {
  const value = email.trim();
  if (!value) {
    return "Email is required.";
  }
  if (!EMAIL_PATTERN.test(value)) {
    return "Enter a valid email address.";
  }
  return "";
}

export function validatePassword(password, { forSignUp = false } = {}) {
  if (!password) {
    return "Password is required.";
  }
  if (forSignUp && !PASSWORD_PATTERN.test(password)) {
    return "Use at least 8 characters with both letters and numbers.";
  }
  if (!forSignUp && password.length < 6) {
    return "Enter at least 6 characters.";
  }
  return "";
}

export function validateSignUp({ fullName, email, password, confirmPassword }) {
  const errors = {};

  const trimmedName = fullName.trim();
  if (!trimmedName) {
    errors.fullName = "Full name is required.";
  }

  const emailError = validateEmail(email);
  if (emailError) {
    errors.email = emailError;
  }

  const passwordError = validatePassword(password, { forSignUp: true });
  if (passwordError) {
    errors.password = passwordError;
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

export function validateSignIn({ email, password }) {
  const errors = {};

  const emailError = validateEmail(email);
  if (emailError) {
    errors.email = emailError;
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    errors.password = passwordError;
  }

  return errors;
}
