import getSupabaseClient from "@/lib/supabase-global"

export async function simpleSignIn(email: string, password: string) {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error: any) {
    console.error("Sign in error:", error)
    return { data: null, error }
  }
}

export async function simpleSignUp(email: string, password: string) {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error: any) {
    console.error("Sign up error:", error)
    return { data: null, error }
  }
}

export async function simpleSignOut() {
  try {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }

    return { error: null }
  } catch (error: any) {
    console.error("Sign out error:", error)
    return { error }
  }
}

export async function getSimpleUser() {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      console.error("Get user error:", error)
      return null
    }

    return data.user
  } catch (error) {
    console.error("Get user error:", error)
    return null
  }
}
