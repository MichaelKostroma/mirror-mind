"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { DecisionCard } from "@/components/decision-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Database, AlertTriangle, RefreshCcw } from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

function ClientDashboard() {
  const { supabase, user } = useSupabase()
  const [decisions, setDecisions] = useState<any[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isTableMissing, setIsTableMissing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const fetchDecisions = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Check if the table exists
        const { error: tableCheckError } = await supabase.from("decisions").select("id").limit(1)

        if (
          tableCheckError &&
          tableCheckError.message.includes("relation") &&
          tableCheckError.message.includes("does not exist")
        ) {
          setIsTableMissing(true)
          setIsLoading(false)
          return
        }

        // Fetch decisions
        const { data, error: fetchError } = await supabase
          .from("decisions")
          .select("id, title, situation, decision, created_at, analysis_status, analysis_category")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (fetchError) {
          throw fetchError
        }

        setDecisions(data)
      } catch (err: any) {
        console.error("Error fetching decisions:", err)
        setError(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDecisions()
  }, [supabase, user, router])

  const handleRefresh = () => {
    window.location.reload()
  }

  if (isTableMissing) {
    return <DatabaseSetupGuide />
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Your Decisions</h1>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
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

      {!decisions || decisions.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {decisions.map((decision) => (
            <DecisionCard key={decision.id} decision={decision} />
          ))}
        </div>
      )}
    </div>
  )
}

export default ClientDashboard

function DatabaseSetupGuide() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Database Setup Required</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Database Setup Required
          </CardTitle>
          <CardDescription>The database tables for Decision Journal haven't been created yet.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Missing Database Tables</AlertTitle>
            <AlertDescription>
              The "decisions" table doesn't exist in your Supabase database. Click the button below to create the
              necessary tables.
            </AlertDescription>
          </Alert>

          <div className="bg-muted p-4 rounded-md overflow-auto">
            <pre className="text-xs">
              {`-- This will create the decisions table and set up the necessary security policies
CREATE TABLE IF NOT EXISTS decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  situation TEXT NOT NULL,
  decision TEXT NOT NULL,
  reasoning TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  analysis_status TEXT NOT NULL DEFAULT 'pending',
  analysis_category TEXT,
  cognitive_biases TEXT[],
  missed_alternatives TEXT[],
  analysis_summary TEXT
);

-- Create an index on user_id for faster queries
CREATE INDEX IF NOT EXISTS decisions_user_id_idx ON decisions(user_id);

-- Set up Row Level Security (RLS)
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to only see their own decisions
CREATE POLICY "Users can only view their own decisions"
  ON decisions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create a policy that allows users to only insert their own decisions
CREATE POLICY "Users can only insert their own decisions"
  ON decisions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create a policy that allows users to only update their own decisions
CREATE POLICY "Users can only update their own decisions"
  ON decisions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create a policy that allows users to only delete their own decisions
CREATE POLICY "Users can only delete their own decisions"
  ON decisions
  FOR DELETE
  USING (auth.uid() = user_id);`}
            </pre>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Link href="/dashboard/setup-database" className="w-full">
            <Button className="w-full">Create Database Tables</Button>
          </Link>
          <p className="text-sm text-muted-foreground text-center">
            After creating the tables, you'll be redirected back to the dashboard.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
