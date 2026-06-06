// Server-only usage analytics: records each searched username to Supabase.
// Safe by design: if env vars are missing or the insert fails, it never throws,
// so analytics can never break a page render.

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Only create the client when configured, so the app runs without analytics.
const supabase = url && key ? createClient(url, key) : null;

export async function recordSearch(username: string, persona?: string) {
  if (!supabase) return; // analytics disabled (no env vars set)

  try {
    const { error } = await supabase
      .from("searches")
      .insert({ username, persona });
    if (error) console.warn("recordSearch failed:", error.message);
  } catch (e) {
    console.warn("recordSearch error:", e);
  }
}
