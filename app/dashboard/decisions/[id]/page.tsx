"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, AlertTriangle, ShieldAlert } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { DecisionAnalysis } from "@/components/decision-analysis"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import getSupabaseClient from "@/lib/supabase-global"
import { getCurrentUser } from "@/lib/supabase/auth-utils"
import { MirrorLogo } from "@/components/mirror-logo"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function DecisionPage({ params }: PageProps) {
  // Use React.use() to unwrap the params Promise
  const resolvedParams = use(params)
  const [decision, setDecision] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [authError, setAuthError] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loadDecision = async () => {
      try {
        setIsLoading(true)
        setError(null)
        setAuthError(false)

        // Check authentication first
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          setAuthError(true)
          setIsLoading(false)
          return
        }

        setUser(currentUser)

        // Validate the ID parameter
        if (!resolvedParams.id || typeof resolvedParams.id !== "string") {
          setError("Invalid decision ID")
          setIsLoading(false)
          return
        }

        // Get the decision data
        const supabase = getSupabaseClient()
        const { data: decisionData, error: decisionError } = await supabase
            .from("decisions")
            .select("*")
            .eq("id", resolvedParams.id)
            .eq("user_id", currentUser.id)
            .single()

        if (decisionError) {
          console.error("Database error:", decisionError)

          if (decisionError.code === "PGRST116") {
            // No rows returned - decision not found
            setError("Decision not found or you don't have permission to view it")
          } else {
            setError(`Database error: ${decisionError.message}`)
          }
          setIsLoading(false)
          return
        }

        if (!decisionData) {
          setError("Decision not found")
          setIsLoading(false)
          return
        }

        setDecision(decisionData)
      } catch (err: any) {
        console.error("Error loading decision:", err)
        setError(err.message || "An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    loadDecision()
  }, [resolvedParams.id])

  if (isLoading) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <MirrorLogo size="sm" withText={false} className="animate-pulse" />
          </div>
        </div>
    )
  }

  if (authError) {
    return (
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link href="/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              You need to be logged in to view this decision. Please log in and try again.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Link href="/login">
              <Button>Go to Login</Button>
            </Link>
          </div>
        </div>
    )
  }

  if (error) {
    return (
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link href="/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading Decision</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Link href="/dashboard">
              <Button>Return to Dashboard</Button>
            </Link>
          </div>
        </div>
    )
  }

  if (!decision) {
    return (
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link href="/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Decision Not Found</AlertTitle>
            <AlertDescription>
              The decision you're looking for doesn't exist or you don't have permission to view it.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Link href="/dashboard">
              <Button>Return to Dashboard</Button>
            </Link>
          </div>
        </div>
    )
  }

  // Safely format the date
  let formattedDate = "Unknown date"
  if (decision.created_at) {
    try {
      formattedDate = formatDistanceToNow(new Date(decision.created_at), { addSuffix: true })
    } catch (dateError) {
      console.error("Error formatting date:", dateError)
      formattedDate = "Invalid date"
    }
  }

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  }

  return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">{decision.title || "Untitled Decision"}</h1>
          <Badge variant="outline" className={statusColors[decision.analysis_status] || statusColors.pending}>
            {decision.analysis_status === "pending" && <Clock className="mr-1 h-3 w-3 animate-pulse" />}
            {(decision.analysis_status || "pending").charAt(0).toUpperCase() +
                (decision.analysis_status || "pending").slice(1)}
          </Badge>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Decision Details</CardTitle>
              <CardDescription>{formattedDate}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Situation</h3>
                <p className="whitespace-pre-line">{decision.situation || "No situation provided"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Decision</h3>
                <p className="whitespace-pre-line">{decision.decision || "No decision provided"}</p>
              </div>
              {decision.reasoning && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Your Reasoning</h3>
                    <p className="whitespace-pre-line">{decision.reasoning}</p>
                  </div>
              )}
            </CardContent>
          </Card>

          {decision.analysis_status === "pending" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Analysis in Progress</CardTitle>
                  <CardDescription>We're analyzing your decision. This may take a minute.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center py-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="rounded-full bg-muted p-3 mb-4">
                      <Clock className="h-6 w-6 animate-pulse text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                      Our AI is carefully analyzing your decision to provide valuable insights.
                    </p>
                  </div>
                </CardContent>
              </Card>
          ) : decision.analysis_status === "failed" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Failed</CardTitle>
                  <CardDescription>We encountered an error while analyzing your decision.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center py-6">
                  <div className="flex flex-col items-center text-center">
                    <p className="text-muted-foreground mb-4">
                      Sorry, we couldn't complete the analysis. Please try again.
                    </p>
                    <Link href="/dashboard">
                      <Button>Return to Dashboard</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
          ) : (
              <DecisionAnalysis decision={decision} />
          )}
        </div>
      </div>
  )
}
