import supabase from "../lib/supabase";
import { getProfile, saveProfile } from "../lib/localStore";

const DEMO_SESSION_KEY = "devdna-demo-session";

function buildLocalUser(email) {
  return {
    id: "local-preview-user",
    email
  };
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

  const session = JSON.parse(raw);
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
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.session;
  }

  const session = { access_token: "local-preview-token", user: buildLocalUser(email) };
  window.localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function signUp({ email, password, fullName }) {
  if (supabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    if (error) throw error;
    return data.session;
  }

  const session = { access_token: "local-preview-token", user: buildLocalUser(email) };
  window.localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
  saveProfile({ ...getProfile(), full_name: fullName });
  return session;
}

export async function signOut() {
  if (supabase) {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return;
  }

  window.localStorage.removeItem(DEMO_SESSION_KEY);
}
