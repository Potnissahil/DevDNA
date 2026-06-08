const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  githubToken: import.meta.env.VITE_GITHUB_TOKEN
};

export const hasSupabaseConfig = Boolean(env.supabaseUrl && env.supabaseAnonKey);

export default env;
