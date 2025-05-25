import getSupabaseClient from "@/lib/supabase-global"

// Re-export getSupabaseClient as createClient for backward compatibility
export function createClient() {
  return getSupabaseClient()
}
