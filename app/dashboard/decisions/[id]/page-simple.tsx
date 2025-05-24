import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { notFound, redirect } from "next/navigation"
import { DecisionAnalysis } from "@/components/decision-analysis"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface PageProps {
  params: {
    id: string
  }
}

async function getDecisionData(id: string, userId: string) {
  const supabase = createClient()

  const { data: decision, error } = await supabase
    .from("decisions")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single()

  return { decision, error }
}

async function getCurrentUser() {
  const supabase = createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  return { user, error }
}

export default async function DecisionPage({ params }: PageProps) {
  // Validate the ID parameter first
  if (!params.id || typeof params.id !== "string") {
    notFound()
  }

  // Get the current user
  const { user, error: userError } = await getCurrentUser()

  if (userError || !user) {
    redirect("/login")
  }

  // Get the decision data
  const { decision, error } = await getDecisionData(params.id, user.id)

  // Handle database errors
  if (error) {
    console.error("Database error:", error)

    if (error.code === "PGRST116") {
      // No rows returned
      notFound()
    }

    // For other database errors, show an error page
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
          <AlertDescription>
            We encountered an error while loading this decision. Please try again or return to the dashboard.
            <br />
            <span className="text-xs mt-2 block">Error: {error.message}</span>
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

  if (!decision) {
    notFound()
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
