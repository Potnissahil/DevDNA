import { createClient } from "@supabase/supabase-js";
import env, { hasSupabaseConfig } from "./env";

let supabase = null;

if (hasSupabaseConfig) {
  supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
}

export default supabase;
