import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Only protect dashboard routes
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    try {
      // Create a Supabase client configured to use cookies
      const supabase = createMiddlewareClient({ req, res })

      // Refresh session if expired - required for Server Components
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      console.log(`[MIDDLEWARE] Dashboard access - Session exists: ${!!session}, Error: ${!!error}`)

      // If no session and not already on login page, redirect to login
      if (!session && req.nextUrl.pathname !== "/login") {
        console.log(`[MIDDLEWARE] No session found, redirecting to login`)
        const redirectUrl = new URL("/login", req.url)
        return NextResponse.redirect(redirectUrl)
      }

      // If we have a session, allow access
      if (session) {
        console.log(`[MIDDLEWARE] Valid session found for user: ${session.user?.email}`)
        return res
      }
    } catch (error) {
      console.error("[MIDDLEWARE] Error checking session:", error)
      // On error, redirect to login to be safe
      const redirectUrl = new URL("/login", req.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
