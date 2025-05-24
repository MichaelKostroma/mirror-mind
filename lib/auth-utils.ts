import globalSupabaseClient from "@/lib/supabase-global"

// Track authentication attempts to prevent too many requests
const authAttempts = {
  count: 0,
  lastReset: Date.now(),
  isRateLimited: false,
  rateLimitExpires: 0,
}

// Reset auth attempts counter every 60 seconds
setInterval(() => {
  if (Date.now() - authAttempts.lastReset > 60000) {
    authAttempts.count = 0
    authAttempts.lastReset = Date.now()
  }
}, 10000)

export async function signIn(email: string, password: string) {
  // Check if we're currently rate limited
  if (authAttempts.isRateLimited) {
    if (Date.now() < authAttempts.rateLimitExpires) {
      const secondsRemaining = Math.ceil((authAttempts.rateLimitExpires - Date.now()) / 1000)
      throw new Error(`Too many sign-in attempts. Please try again in ${secondsRemaining} seconds.`)
    } else {
      // Rate limit period has expired
      authAttempts.isRateLimited = false
      authAttempts.count = 0
    }
  }

  // Increment attempt counter
  authAttempts.count++

  // If too many attempts, implement client-side rate limiting
  if (authAttempts.count > 5) {
    authAttempts.isRateLimited = true
    authAttempts.rateLimitExpires = Date.now() + 60000 // 1 minute rate limit
    throw new Error("Too many sign-in attempts. Please try again in 60 seconds.")
  }

  try {
    const { data, error } = await globalSupabaseClient.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // If we get a rate limit error from Supabase
      if (error.message.includes("Too many requests") || error.status === 429) {
        authAttempts.isRateLimited = true
        authAttempts.rateLimitExpires = Date.now() + 60000 // 1 minute rate limit
        throw new Error("You've reached Supabase's rate limit for authentication. Please try again in 60 seconds.")
      }
      throw error
    }

    // Successful login, reset counter
    authAttempts.count = 0
    return { data, error: null }
  } catch (error: any) {
    // Handle rate limit errors
    if (error.message.includes("Too many requests") || error.status === 429) {
      authAttempts.isRateLimited = true
      authAttempts.rateLimitExpires = Date.now() + 60000 // 1 minute rate limit
      throw new Error("You've reached Supabase's rate limit for authentication. Please try again in 60 seconds.")
    }
    return { data: null, error }
  }
}

export async function signUp(email: string, password: string) {
  // Similar rate limiting logic as signIn
  if (authAttempts.isRateLimited) {
    if (Date.now() < authAttempts.rateLimitExpires) {
      const secondsRemaining = Math.ceil((authAttempts.rateLimitExpires - Date.now()) / 1000)
      throw new Error(`Too many sign-up attempts. Please try again in ${secondsRemaining} seconds.`)
    } else {
      authAttempts.isRateLimited = false
      authAttempts.count = 0
    }
  }

  authAttempts.count++

  if (authAttempts.count > 5) {
    authAttempts.isRateLimited = true
    authAttempts.rateLimitExpires = Date.now() + 60000 // 1 minute rate limit
    throw new Error("Too many sign-up attempts. Please try again in 60 seconds.")
  }

  try {
    const { data, error } = await globalSupabaseClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      if (error.message.includes("Too many requests") || error.status === 429) {
        authAttempts.isRateLimited = true
        authAttempts.rateLimitExpires = Date.now() + 60000
        throw new Error("You've reached Supabase's rate limit for authentication. Please try again in 60 seconds.")
      }
      throw error
    }

    authAttempts.count = 0
    return { data, error: null }
  } catch (error: any) {
    if (error.message.includes("Too many requests") || error.status === 429) {
      authAttempts.isRateLimited = true
      authAttempts.rateLimitExpires = Date.now() + 60000
      throw new Error("You've reached Supabase's rate limit for authentication. Please try again in 60 seconds.")
    }
    return { data: null, error }
  }
}

export async function resendConfirmationEmail(email: string) {
  // Rate limiting for email resending
  if (authAttempts.isRateLimited) {
    if (Date.now() < authAttempts.rateLimitExpires) {
      const secondsRemaining = Math.ceil((authAttempts.rateLimitExpires - Date.now()) / 1000)
      throw new Error(`Too many email resend attempts. Please try again in ${secondsRemaining} seconds.`)
    } else {
      authAttempts.isRateLimited = false
      authAttempts.count = 0
    }
  }

  authAttempts.count++

  if (authAttempts.count > 3) {
    // Stricter limit for email resends
    authAttempts.isRateLimited = true
    authAttempts.rateLimitExpires = Date.now() + 120000 // 2 minute rate limit
    throw new Error("Too many email resend attempts. Please try again in 120 seconds.")
  }

  try {
    const { error } = await globalSupabaseClient.auth.resend({
      type: "signup",
      email,
    })

    if (error) {
      if (error.message.includes("Too many requests") || error.status === 429) {
        authAttempts.isRateLimited = true
        authAttempts.rateLimitExpires = Date.now() + 120000
        throw new Error("You've reached Supabase's rate limit for email resending. Please try again in 2 minutes.")
      }
      throw error
    }

    return { error: null }
  } catch (error: any) {
    if (error.message.includes("Too many requests") || error.status === 429) {
      authAttempts.isRateLimited = true
      authAttempts.rateLimitExpires = Date.now() + 120000
      throw new Error("You've reached Supabase's rate limit for email resending. Please try again in 2 minutes.")
    }
    return { error }
  }
}

export async function checkAccountExists(email: string) {
  // Lightweight check with minimal rate limiting
  if (authAttempts.isRateLimited) {
    return { exists: false, error: "Rate limited" }
  }

  try {
    // Use a more lightweight approach that doesn't trigger OTP
    const { data, error } = await globalSupabaseClient.auth.getUser()

    // If we're logged in and this is our email, account exists
    if (data?.user?.email === email) {
      return { exists: true, error: null }
    }

    // Otherwise, we can't reliably check without triggering OTP
    // Just return false without making the API call
    return { exists: false, error: null }
  } catch (error) {
    console.error("Error checking account:", error)
    return { exists: false, error: "Error checking account" }
  }
}
