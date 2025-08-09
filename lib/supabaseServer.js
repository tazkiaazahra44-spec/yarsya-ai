import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.warn("[Supabase] Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL env");
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("[Supabase] Missing SUPABASE_SERVICE_ROLE_KEY env");
}

export function getSupabaseServerClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
    global: { headers: { "X-Client-Info": "yarsya-ai/1.0" } },
  });
}