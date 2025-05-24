import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Cache the client to avoid "Multiple GoTrueClient instances" warning
let supabaseClient: ReturnType<typeof createClientComponentClient> | null = null

export function createClient() {
  if (supabaseClient) return supabaseClient

  try {
    supabaseClient = createClientComponentClient()
    return supabaseClient
  } catch (error) {
    console.error("Error creating Supabase client:", error)
    throw error
  }
}
