import getSupabaseClient from "@/lib/supabase-global"

// Secure function to get current user
export async function getCurrentUser() {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.getUser()
    if (error) {
      console.error("Error getting user:", error)
      return null
    }
    return data.user
  } catch (error) {
    console.error("Error getting user:", error)
    return null
  }
}
