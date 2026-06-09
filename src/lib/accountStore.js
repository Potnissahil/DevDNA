const STORAGE_KEY = "devdna-remembered-accounts";
const MAX_ACCOUNTS = 5;

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export function listRememberedAccounts() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

export function saveRememberedAccount({ email, full_name, avatar }) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return listRememberedAccounts();
  }

  const entry = {
    email: normalizedEmail,
    full_name: (full_name || "").trim(),
    avatar: avatar || null,
    lastUsedAt: new Date().toISOString()
  };

  const accounts = listRememberedAccounts().filter(
    (account) => account.email !== normalizedEmail
  );
  accounts.unshift(entry);

  const nextAccounts = accounts.slice(0, MAX_ACCOUNTS);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAccounts));
  return nextAccounts;
}

export function removeRememberedAccount(email) {
  const normalizedEmail = normalizeEmail(email);
  const accounts = listRememberedAccounts().filter(
    (account) => account.email !== normalizedEmail
  );
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  return accounts;
}
