import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { SupabaseClient } from "@supabase/supabase-js"

// Define a global variable to store the client instance
let supabaseClient: SupabaseClient | null = null

export default function getSupabaseClient() {
  // If the client already exists, return it
  if (supabaseClient) {
    return supabaseClient
  }

  // Otherwise, create a new client and store it
  supabaseClient = createClientComponentClient()
  return supabaseClient
}
