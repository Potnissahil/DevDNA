import supabase from "../lib/supabase";
import { getProfile, saveProfile } from "../lib/localStore";
import { formatAuthError } from "../utils/authErrors";

const DEMO_SESSION_KEY = "devdna-demo-session";

function buildLocalUser(email) {
  return {
    id: "local-preview-user",
    email: email.trim().toLowerCase()
  };
}

function parseLocalSession(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    window.localStorage.removeItem(DEMO_SESSION_KEY);
    return null;
  }
}

export async function getInitialAuthState() {
  if (supabase) {
    const {
      data: { session }
    } = await supabase.auth.getSession();
    return { mode: "supabase", session, user: session?.user ?? null };
  }

  const raw = window.localStorage.getItem(DEMO_SESSION_KEY);
  if (!raw) {
    return { mode: "local", session: null, user: null };
  }

  const session = parseLocalSession(raw);
  if (!session?.user) {
    return { mode: "local", session: null, user: null };
  }

  return { mode: "local", session, user: session.user };
}

export function subscribeToAuthChanges(callback) {
  if (!supabase) {
    return () => {};
  }

  const {
    data: { subscription }
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });

  return () => subscription.unsubscribe();
}

export async function signIn({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password
    });
    if (error) {
      throw formatAuthError(error);
    }
    if (!data.session?.user) {
      throw new Error("Unable to sign in. Please try again.");
    }
    return data.session;
  }

  const session = {
    access_token: "local-preview-token",
    user: buildLocalUser(normalizedEmail)
  };
  window.localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function signUp({ email, password, fullName }) {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = fullName.trim();

  if (supabase) {
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: { data: { full_name: trimmedName } }
    });
    if (error) {
      throw formatAuthError(error);
    }

    const needsEmailConfirmation = !data.session && Boolean(data.user);

    return {
      session: data.session,
      user: data.user ?? data.session?.user ?? null,
      needsEmailConfirmation
    };
  }

  const session = {
    access_token: "local-preview-token",
    user: buildLocalUser(normalizedEmail)
  };
  window.localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
  saveProfile({ ...getProfile(), full_name: trimmedName });

  return {
    session,
    user: session.user,
    needsEmailConfirmation: false
  };
}

export async function signOut() {
  if (supabase) {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw formatAuthError(error);
    }
    return;
  }

  window.localStorage.removeItem(DEMO_SESSION_KEY);
}
