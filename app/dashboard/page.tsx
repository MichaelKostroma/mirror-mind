"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DecisionCard } from "@/components/decision-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, AlertTriangle, RefreshCcw, Search, Filter } from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import getSupabaseClient from "@/lib/supabase-global"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getCurrentUser } from "@/lib/supabase/auth-utils"
import { useToast } from "@/components/ui/use-toast"
import { MirrorLogo } from "@/components/mirror-logo"
import { Decision, User } from "@/lib/types"

export default function Dashboard() {
  const [decisions, setDecisions] = useState<Decision[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "alphabetical">("newest")
  const [hasPendingDecisions, setHasPendingDecisions] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Show welcome toast if user just logged in
  useEffect(() => {
    if (typeof window !== "undefined") {
      const justLoggedIn = localStorage.getItem("just_logged_in")
      if (justLoggedIn === "true") {
        // Remove the flag
        localStorage.removeItem("just_logged_in")

        // Show welcome toast after a short delay to ensure the page is loaded
        setTimeout(() => {
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in to Mirror Mind.",
            duration: 4000, // Show for 4 seconds
          })
        }, 500)
      }
    }
  }, [toast])

  // Check authentication using secure method
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          window.location.href = "/login"
          return
        }
        setUser(currentUser)
      } catch (error: unknown) {
        console.error("Auth error:", error)
        window.location.href = "/login"
      }
    }

    checkAuth()
  }, [router])

  // Fetch decisions
  const fetchDecisions = async (userId: string) => {
    try {
      const supabase = getSupabaseClient()
      // Skip table existence check as the database is already created

      // Fetch decisions with retry logic for rate limiting
      let retries = 0
      const maxRetries = 3
      let success = false

      while (!success && retries < maxRetries) {
        try {
          const { data, error: fetchError } = await supabase
              .from("decisions")
              .select("id, user_id, title, situation, decision, created_at, analysis_status, analysis_category")
              .eq("user_id", userId)
              .order("created_at", { ascending: false }) as { data: Decision[] | null, error: any }

          if (fetchError) {
            // If it's a rate limit error, retry after a delay
            if (
                fetchError.message?.includes("429") ||
                fetchError.message?.includes("Too Many") ||
                fetchError.message?.includes("rate limit")
            ) {
              retries++
              // Exponential backoff
              await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retries)))
              continue
            }
            throw fetchError
          }

          setDecisions((data || []) as Decision[])

          // Check if there are any pending decisions
          const pendingCount = ((data || []) as Decision[]).filter((d) => d.analysis_status === "pending").length
          setHasPendingDecisions(pendingCount > 0)

          success = true
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          if (
              errorMessage.includes("429") ||
              errorMessage.includes("Too Many") ||
              errorMessage.includes("rate limit")
          ) {
            retries++
            // Exponential backoff
            await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retries)))
            continue
          }
          throw err
        }
      }

      if (!success) {
        throw new Error("Failed to fetch decisions after multiple retries")
      }
    } catch (err) {
      console.error("Error fetching decisions:", err)
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return
    fetchDecisions(user.id)
  }, [user])

  // Auto-refresh when there are pending decisions
  useEffect(() => {
    if (!user || !hasPendingDecisions) return

    console.log("🔄 Setting up auto-refresh for pending decisions")

    const interval = setInterval(() => {
      console.log("🔄 Auto-refreshing decisions...")
      fetchDecisions(user.id)
    }, 10000) // Refresh every 10 seconds

    return () => {
      console.log("🛑 Clearing auto-refresh interval")
      clearInterval(interval)
    }
  }, [user, hasPendingDecisions])

  const handleRefresh = () => {
    if (user) {
      fetchDecisions(user.id)
    }
  }

  // Filter and sort decisions
  const filteredAndSortedDecisions = decisions
      ? decisions
          .filter((decision) => {
            if (!searchQuery.trim()) return true
            const query = searchQuery.toLowerCase().trim()
            return (
                decision.title?.toLowerCase().includes(query) ||
                decision.situation?.toLowerCase().includes(query) ||
                decision.decision?.toLowerCase().includes(query) ||
                (decision.analysis_category && decision.analysis_category.toLowerCase().includes(query))
            )
          })
          .sort((a, b) => {
            if (sortOrder === "newest") {
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            } else if (sortOrder === "oldest") {
              return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            } else {
              // alphabetical - handle cases where title might be undefined or null
              return (a.title || "").localeCompare(b.title || "")
            }
          })
      : []

  // If not authenticated yet or still loading, show branded loading screen
  if (!user || isLoading) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <MirrorLogo size="sm" withText={false} className="animate-pulse" />
          </div>
        </div>
    )
  }

  if (error) {
    // Check if it's a rate limit error
    const isRateLimitError =
        error.message?.includes("Too Many Requests") ||
        error.message?.includes("429") ||
        (error.message?.includes("JSON") && error.message?.includes("Too Many"))

    return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Your Decisions</h1>
            <Button onClick={handleRefresh}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{isRateLimitError ? "Rate Limit Exceeded" : "Error"}</AlertTitle>
            <AlertDescription>
              {isRateLimitError
                  ? "You've reached Supabase's rate limit. Please wait a moment and try again."
                  : "An unexpected error occurred. Please try refreshing the page."}
              {!isRateLimitError && error.message && <p className="mt-2 text-sm">Details: {error.message}</p>}
            </AlertDescription>
          </Alert>
          {isRateLimitError && (
              <Card>
                <CardHeader>
                  <CardTitle>What's happening?</CardTitle>
                  <CardDescription>
                    Your application is making too many requests to the database in a short period.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    This is common during development or when many users are accessing the application simultaneously.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Try refreshing the page in a few moments. If the issue persists, consider upgrading your Supabase plan
                    for higher rate limits.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={handleRefresh}>
                    Try Again
                  </Button>
                </CardFooter>
              </Card>
          )}
        </div>
    )
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Your Decisions</h1>
          <Link href="/dashboard/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Decision
            </Button>
          </Link>
        </div>

        {decisions && decisions.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search decisions..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Filter className="mr-2 h-4 w-4" />
                    Sort: {sortOrder.charAt(0).toUpperCase() + sortOrder.slice(1)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortOrder("newest")}>Newest First</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder("oldest")}>Oldest First</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder("alphabetical")}>Alphabetical</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
        )}

        {!decisions || decisions.length === 0 ? (
            <EmptyState />
        ) : filteredAndSortedDecisions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No decisions found matching "{searchQuery}"</p>
              <Button variant="link" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>
            </div>
        ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedDecisions.map((decision) => (
                  <DecisionCard key={decision.id} decision={decision} />
              ))}
            </div>
        )}
      </div>
  )
}
