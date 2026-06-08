import supabase from "../lib/supabase";
import { getProfile, saveProfile } from "../lib/localStore";

const PROFILE_COLUMNS = "id, full_name, role, github_username, bio, created_at, updated_at";

export async function fetchProfile(user) {
  if (!user) {
    return null;
  }

  if (supabase) {
    const { data, error } = await supabase
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("id", user.id)
      .maybeSingle();
    if (error) throw error;

    if (data) {
      return data;
    }

    const nextProfile = {
      id: user.id,
      full_name: user.user_metadata?.full_name || "",
      role: "Engineer",
      github_username: "",
      bio: ""
    };

    const { data: created, error: insertError } = await supabase
      .from("profiles")
      .upsert(nextProfile)
      .select(PROFILE_COLUMNS)
      .single();
    if (insertError) throw insertError;
    return created;
  }

  return getProfile();
}

export async function updateProfile(userId, updates) {
  if (supabase) {
    const { data, error } = await supabase
      .from("profiles")
      .upsert({ id: userId, ...updates })
      .select(PROFILE_COLUMNS)
      .single();
    if (error) throw error;
    return data;
  }

  return saveProfile({ ...getProfile(), ...updates });
}
