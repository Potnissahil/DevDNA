import supabase from "../lib/supabase";
import { deleteRecord, listCollection, saveRecord } from "../lib/localStore";

const TABLES = {
  skills: { table: "skills", orderBy: "created_at" },
  learning_goals: { table: "learning_goals", orderBy: "target_date" },
  projects: { table: "projects", orderBy: "created_at" }
};

export async function listRecords(resource, userId) {
  const config = TABLES[resource];

  if (supabase) {
    const { data, error } = await supabase
      .from(config.table)
      .select("*")
      .eq("user_id", userId)
      .order(config.orderBy, { ascending: false });
    if (error) throw error;
    return data;
  }

  return listCollection(resource);
}

export async function upsertRecord(resource, userId, record) {
  if (supabase) {
    const { data, error } = await supabase
      .from(TABLES[resource].table)
      .upsert({ ...record, user_id: userId })
      .select("*")
      .single();
    if (error) throw error;
    return data;
  }

  return saveRecord(resource, record);
}

export async function removeRecord(resource, id) {
  if (supabase) {
    const { error } = await supabase.from(TABLES[resource].table).delete().eq("id", id);
    if (error) throw error;
    return;
  }

  deleteRecord(resource, id);
}
