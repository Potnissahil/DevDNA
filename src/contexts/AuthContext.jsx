import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getInitialAuthState,
  requestPasswordReset as authRequestPasswordReset,
  signIn as authSignIn,
  signOut as authSignOut,
  signUp as authSignUp,
  subscribeToAuthChanges
} from "../services/authService";
import { fetchProfile, updateProfile as persistProfile } from "../services/profileService";
import { saveRememberedAccount } from "../lib/accountStore";

const AuthContext = createContext(null);

function rememberAccount(user, profile) {
  if (!user?.email) {
    return;
  }

  saveRememberedAccount({
    email: user.email,
    full_name: profile?.full_name || user.user_metadata?.full_name || "",
    avatar: user.user_metadata?.avatar_url || null
  });
}

function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState("local");
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      const initial = await getInitialAuthState();
      if (!mounted) return;

      setAuthMode(initial.mode);
      setSession(initial.session);
      setUser(initial.user);

      if (initial.user) {
        const nextProfile = await fetchProfile(initial.user);
        if (mounted) setProfile(nextProfile);
      }

      setLoading(false);
    }

    bootstrap();

    const unsubscribe = subscribeToAuthChanges(async (nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (nextSession?.user) {
        const nextProfile = await fetchProfile(nextSession.user);
        setProfile(nextProfile);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  async function signIn(credentials) {
    const nextSession = await authSignIn(credentials);
    if (!nextSession?.user) {
      throw new Error("Unable to sign in. Please try again.");
    }

    setSession(nextSession);
    setUser(nextSession.user);
    const nextProfile = await fetchProfile(nextSession.user);
    setProfile(nextProfile);
    rememberAccount(nextSession.user, nextProfile);
    return { profile: nextProfile };
  }

  async function signUp(credentials) {
    const result = await authSignUp(credentials);

    if (result.needsEmailConfirmation) {
      return {
        needsEmailConfirmation: true,
        email: credentials.email.trim().toLowerCase()
      };
    }

    if (!result.session?.user) {
      throw new Error("Unable to complete sign up. Please try again.");
    }

    setSession(result.session);
    setUser(result.session.user);
    const nextProfile = await fetchProfile(result.session.user);
    setProfile(nextProfile);
    rememberAccount(result.session.user, nextProfile);

    return {
      needsEmailConfirmation: false,
      profile: nextProfile
    };
  }

  async function signOut() {
    await authSignOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  }

  async function requestPasswordReset(email) {
    await authRequestPasswordReset(email);
  }

  async function updateProfile(updates) {
    const nextProfile = await persistProfile(user.id, updates);
    setProfile(nextProfile);
    rememberAccount(user, nextProfile);
    return nextProfile;
  }

  const value = useMemo(
    () => ({
      authMode,
      loading,
      session,
      user,
      profile,
      isAuthenticated: Boolean(user),
      signIn,
      signUp,
      signOut,
      requestPasswordReset,
      updateProfile
    }),
    [authMode, loading, profile, session, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export { AuthProvider, useAuth };
