import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { GenericSchema } from "@supabase/supabase-js/dist/module/lib/types"

// Define a global variable to store the client instance
let supabaseClient: SupabaseClient<unknown, never, GenericSchema> | null = null

export default function getSupabaseClient() {
  // If the client already exists, return it
  if (supabaseClient) {
    return supabaseClient
  }

  // Otherwise, create a new client and store it
  supabaseClient = createClientComponentClient<unknown, never, GenericSchema>()
  return supabaseClient
}
