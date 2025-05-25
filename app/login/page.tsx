"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { Mail, AlertTriangle, RefreshCw, Eye, EyeOff, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MirrorLogo } from "@/components/mirror-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import getSupabaseClient from "@/lib/supabase-global"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false)
  const [isResendingEmail, setIsResendingEmail] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginSuccess, setLoginSuccess] = useState(false)
  const { toast } = useToast()

  const clearAuthCache = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_attempts")
      setLoginError(null)
      toast({
        title: "Cache cleared",
        description: "You can try logging in again.",
      })
    }
  }

  const handleResendConfirmation = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address first.",
        variant: "destructive",
      })
      return
    }

    setIsResendingEmail(true)
    setLoginError(null)

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      })

      if (error) {
        throw error
      }

      toast({
        title: "Email sent",
        description: "We've sent you a new confirmation email. Please check your inbox.",
      })
    } catch (error: any) {
      console.error(error)
      toast({
        title: "Error",
        description: error?.message || "Failed to resend confirmation email.",
        variant: "destructive",
      })
    } finally {
      setIsResendingEmail(false)
    }
  }

  const navigateToDashboard = () => {
    console.log("Navigating to dashboard...")

    // Store the login success flag
    localStorage.setItem("just_logged_in", "true")

    // Use the most reliable navigation method
    window.location.replace("/dashboard")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!email.includes("@") || !email.includes(".")) {
      setLoginError("Please enter a valid email address")
      return
    }

    if (password.length < 6) {
      setLoginError("Password must be at least 6 characters long")
      return
    }

    setIsLoading(true)
    setShowEmailConfirmation(false)
    setLoginError(null)

    try {
      const supabase = getSupabaseClient()

      // Simple, direct sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        console.error("Sign in error:", error)

        // Handle specific error cases with better messaging
        if (error.message?.includes("Invalid login credentials")) {
          setLoginError("The email or password you entered is incorrect. Please check your credentials and try again.")
        } else if (error.message?.includes("Email not confirmed")) {
          setShowEmailConfirmation(true)
          setLoginError("Please confirm your email address before logging in.")
        } else if (error.message?.includes("Too many requests")) {
          setLoginError("Too many login attempts. Please wait a moment and try again.")
        } else if (error.message?.includes("User not found")) {
          setLoginError("No account found with this email address. Please sign up first.")
        } else {
          setLoginError(error?.message || "An error occurred during login. Please try again.")
        }
        setIsLoading(false)
        return
      }

      if (data?.user) {
        console.log("Login successful, user:", data.user)

        // Clear any previous errors
        setLoginError(null)
        setLoginSuccess(true)

        // Navigate after a short delay to ensure the session is set
        setTimeout(navigateToDashboard, 1000)
      }
    } catch (error: any) {
      console.error("Unexpected error:", error)
      setLoginError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
      <div className="flex min-h-screen flex-col">
        <header className="border-b py-4">
          <div className="container flex items-center justify-between">
            <Link href="/">
              <MirrorLogo />
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <div className="flex flex-1 items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center mb-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <MirrorLogo size="sm" withText={false} />
                </div>
              </div>
              <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
              <CardDescription className="text-center">
                Enter your email and password to access your account
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                      id="email"
                      type="email"
                      placeholder="yourname@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                  />
                </div>
                <div className="space-y-2">

                  <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                    </Button>
                  </div>
                </div>

                {loginError && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="space-y-2">
                        <p>{loginError}</p>
                        {loginError.includes("Too many") && (
                            <Button type="button" variant="outline" size="sm" onClick={clearAuthCache} className="w-full">
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Clear Cache & Try Again
                            </Button>
                        )}
                        {loginError.includes("No account found") && (
                            <div className="pt-2">
                              <Link href="/signup">
                                <Button variant="outline" size="sm" className="w-full">
                                  Create an Account
                                </Button>
                              </Link>
                            </div>
                        )}
                      </AlertDescription>
                    </Alert>
                )}

                {showEmailConfirmation && (
                    <Alert>
                      <Mail className="h-4 w-4" />
                      <AlertDescription className="flex flex-col space-y-2">
                    <span>
                      Your email address hasn't been confirmed yet. Please check your email and click the confirmation
                      link.
                    </span>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleResendConfirmation}
                            disabled={isResendingEmail}
                            className="w-fit"
                        >
                          {isResendingEmail ? "Sending..." : "Resend confirmation email"}
                        </Button>
                      </AlertDescription>
                    </Alert>
                )}
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading || loginSuccess}>
                  {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
                      </>
                  ) : loginSuccess ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Redirecting...
                      </>
                  ) : (
                      "Sign In"
                  )}
                </Button>

                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="text-primary hover:underline">
                    Sign up
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
  )
}
