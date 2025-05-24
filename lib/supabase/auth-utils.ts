import getSupabaseClient from "@/lib/supabase-global"

// Track authentication attempts with better persistence
const getAuthAttempts = () => {
  if (typeof window === "undefined")
    return { count: 0, lastReset: Date.now(), isRateLimited: false, rateLimitExpires: 0 }

  const stored = localStorage.getItem("auth_attempts")
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      // Reset if more than 5 minutes have passed
      if (Date.now() - parsed.lastReset > 300000) {
        const reset = { count: 0, lastReset: Date.now(), isRateLimited: false, rateLimitExpires: 0 }
        localStorage.setItem("auth_attempts", JSON.stringify(reset))
        return reset
      }
      return parsed
    } catch {
      // If parsing fails, reset
      const reset = { count: 0, lastReset: Date.now(), isRateLimited: false, rateLimitExpires: 0 }
      localStorage.setItem("auth_attempts", JSON.stringify(reset))
      return reset
    }
  }

  const initial = { count: 0, lastReset: Date.now(), isRateLimited: false, rateLimitExpires: 0 }
  localStorage.setItem("auth_attempts", JSON.stringify(initial))
  return initial
}

const updateAuthAttempts = (attempts: any) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_attempts", JSON.stringify(attempts))
  }
}

export async function signIn(email: string, password: string) {
  const authAttempts = getAuthAttempts()

  // Check if we're currently rate limited
  if (authAttempts.isRateLimited && Date.now() < authAttempts.rateLimitExpires) {
    const secondsRemaining = Math.ceil((authAttempts.rateLimitExpires - Date.now()) / 1000)
    throw new Error(`Too many sign-in attempts. Please try again in ${secondsRemaining} seconds.`)
  }

  // Reset rate limit if expired
  if (authAttempts.isRateLimited && Date.now() >= authAttempts.rateLimitExpires) {
    authAttempts.isRateLimited = false
    authAttempts.count = 0
    authAttempts.lastReset = Date.now()
    updateAuthAttempts(authAttempts)
  }

  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Increment attempt counter on error
      authAttempts.count++

      // If too many attempts, implement rate limiting
      if (authAttempts.count >= 3) {
        authAttempts.isRateLimited = true
        authAttempts.rateLimitExpires = Date.now() + 60000 // 1 minute
        updateAuthAttempts(authAttempts)
        throw new Error("Too many failed sign-in attempts. Please try again in 60 seconds.")
      }

      updateAuthAttempts(authAttempts)

      // Handle specific Supabase errors
      if (error.message.includes("Too many requests") || error.status === 429) {
        authAttempts.isRateLimited = true
        authAttempts.rateLimitExpires = Date.now() + 120000 // 2 minutes for server rate limits
        updateAuthAttempts(authAttempts)
        throw new Error("Server rate limit exceeded. Please try again in 2 minutes.")
      }

      throw error
    }

    // Successful login, reset counter
    authAttempts.count = 0
    authAttempts.isRateLimited = false
    authAttempts.lastReset = Date.now()
    updateAuthAttempts(authAttempts)

    return { data, error: null }
  } catch (error: any) {
    // Handle network or other errors
    if (error.message.includes("Too many requests") || error.status === 429) {
      const authAttempts = getAuthAttempts()
      authAttempts.isRateLimited = true
      authAttempts.rateLimitExpires = Date.now() + 120000
      updateAuthAttempts(authAttempts)
      throw new Error("Server rate limit exceeded. Please try again in 2 minutes.")
    }
    throw error
  }
}

export async function signUp(email: string, password: string) {
  const authAttempts = getAuthAttempts()

  // Check if we're currently rate limited
  if (authAttempts.isRateLimited && Date.now() < authAttempts.rateLimitExpires) {
    const secondsRemaining = Math.ceil((authAttempts.rateLimitExpires - Date.now()) / 1000)
    throw new Error(`Too many sign-up attempts. Please try again in ${secondsRemaining} seconds.`)
  }

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
      // Increment attempt counter on error
      authAttempts.count++

      if (authAttempts.count >= 3) {
        authAttempts.isRateLimited = true
        authAttempts.rateLimitExpires = Date.now() + 60000
        updateAuthAttempts(authAttempts)
        throw new Error("Too many failed sign-up attempts. Please try again in 60 seconds.")
      }

      updateAuthAttempts(authAttempts)

      if (error.message.includes("Too many requests") || error.status === 429) {
        authAttempts.isRateLimited = true
        authAttempts.rateLimitExpires = Date.now() + 120000
        updateAuthAttempts(authAttempts)
        throw new Error("Server rate limit exceeded. Please try again in 2 minutes.")
      }

      throw error
    }

    // Successful signup, reset counter
    authAttempts.count = 0
    authAttempts.isRateLimited = false
    updateAuthAttempts(authAttempts)

    return { data, error: null }
  } catch (error: any) {
    if (error.message.includes("Too many requests") || error.status === 429) {
      const authAttempts = getAuthAttempts()
      authAttempts.isRateLimited = true
      authAttempts.rateLimitExpires = Date.now() + 120000
      updateAuthAttempts(authAttempts)
      throw new Error("Server rate limit exceeded. Please try again in 2 minutes.")
    }
    throw error
  }
}

export async function resendConfirmationEmail(email: string) {
  const authAttempts = getAuthAttempts()

  // Stricter rate limiting for email resends
  if (authAttempts.isRateLimited && Date.now() < authAttempts.rateLimitExpires) {
    const secondsRemaining = Math.ceil((authAttempts.rateLimitExpires - Date.now()) / 1000)
    throw new Error(`Too many email resend attempts. Please try again in ${secondsRemaining} seconds.`)
  }

  try {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    })

    if (error) {
      authAttempts.count++

      if (authAttempts.count >= 2) {
        authAttempts.isRateLimited = true
        authAttempts.rateLimitExpires = Date.now() + 300000 // 5 minutes for email resends
        updateAuthAttempts(authAttempts)
        throw new Error("Too many email resend attempts. Please try again in 5 minutes.")
      }

      updateAuthAttempts(authAttempts)

      if (error.message.includes("Too many requests") || error.status === 429) {
        authAttempts.isRateLimited = true
        authAttempts.rateLimitExpires = Date.now() + 300000
        updateAuthAttempts(authAttempts)
        throw new Error("Server rate limit exceeded. Please try again in 5 minutes.")
      }

      throw error
    }

    return { error: null }
  } catch (error: any) {
    if (error.message.includes("Too many requests") || error.status === 429) {
      const authAttempts = getAuthAttempts()
      authAttempts.isRateLimited = true
      authAttempts.rateLimitExpires = Date.now() + 300000
      updateAuthAttempts(authAttempts)
      throw new Error("Server rate limit exceeded. Please try again in 5 minutes.")
    }
    return { error }
  }
}

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
