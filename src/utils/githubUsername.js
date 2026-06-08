const USERNAME_PATTERN = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

export function normalizeGitHubUsername(value) {
  if (value == null) {
    return "";
  }

  return String(value).trim();
}

export function validateGitHubUsername(value) {
  const username = normalizeGitHubUsername(value);

  if (!username) {
    return { valid: true, username: "" };
  }

  if (username.length > 39) {
    return {
      valid: false,
      error: "GitHub username must be 39 characters or fewer."
    };
  }

  if (!USERNAME_PATTERN.test(username)) {
    return {
      valid: false,
      error:
        "GitHub username can only use letters, numbers, and hyphens (not at the start or end)."
    };
  }

  return { valid: true, username };
}
