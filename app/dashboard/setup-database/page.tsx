"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Database, CheckCircle, AlertTriangle, Loader2 } from "lucide-react"
import getSupabaseClient from "@/lib/supabase-global"

export default function SetupDatabase() {
  const [isCreating, setIsCreating] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAutoCreating, setIsAutoCreating] = useState(true)
  const router = useRouter()

  // Automatically create tables when the page loads
  useEffect(() => {
    if (isAutoCreating) {
      createTables()
    }
  }, [isAutoCreating])

  const createTables = async () => {
    setIsCreating(true)
    setError(null)
    setIsAutoCreating(false)

    try {
      const supabase = getSupabaseClient()
      // Create the decisions table
      const { error: createTableError } = await supabase.rpc("create_decisions_table")

      if (createTableError) {
        // If the RPC doesn't exist, we'll try to create the table directly
        const { error: directSqlError } = await supabase.from("decisions").select("id").limit(1)

        // If the table already exists, we're good
        if (!directSqlError || !directSqlError.message.includes("does not exist")) {
          setIsSuccess(true)
          setTimeout(() => {
            router.push("/dashboard")
            router.refresh()
          }, 2000)
          return
        }

        // Try to create the table with direct SQL
        const { error: createError } = await supabase.rpc("exec_sql", {
          sql_query: `
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
              ON decisions
              FOR INSERT
              WITH CHECK (auth.uid() = user_id);
            
            -- Create a policy that allows users to only update their own decisions
              ON decisions
              FOR UPDATE
              USING (auth.uid() = user_id);
            
            -- Create a policy that allows users to only delete their own decisions
              ON decisions
              FOR DELETE
              USING (auth.uid() = user_id);
          `,
        })

        if (createError) {
          throw new Error(
            `Failed to create tables: ${createError.message}. Please create the tables manually in the Supabase dashboard.`,
          )
        }
      }

      // Verify the table was created
      const { error: verifyError } = await supabase.from("decisions").select("id").limit(1)

      if (verifyError) {
        throw new Error(
          `Table creation may have failed: ${verifyError.message}. Please create the tables manually in the Supabase dashboard.`,
        )
      }

      setIsSuccess(true)
      setTimeout(() => {
        router.push("/dashboard")
        router.refresh()
      }, 2000)
    } catch (err: any) {
      console.error("Error creating tables:", err)
      setError(err.message || "An error occurred while creating the database tables.")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Setting Up Database
          </CardTitle>
          <CardDescription>Creating the necessary tables for your Decision Journal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isCreating && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-center">Creating database tables...</p>
              <p className="text-center text-sm text-muted-foreground mt-2">This may take a few moments</p>
            </div>
          )}

          {isSuccess && (
            <Alert className="bg-green-50 dark:bg-green-900/20">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                Database tables created successfully. You'll be redirected to the dashboard in a moment.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isCreating && !isSuccess && error && (
            <div className="bg-muted p-4 rounded-md overflow-auto">
              <h3 className="font-medium mb-2">Manual Setup Instructions:</h3>
              <p className="text-sm mb-4">
                If automatic setup failed, you can create the tables manually in the Supabase SQL Editor:
              </p>
              <pre className="text-xs">
                {`-- Create the decisions table
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
          )}
        </CardContent>
        <CardFooter>
          {!isCreating && !isSuccess && (
            <Button onClick={createTables} disabled={isCreating} className="w-full">
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                </>
              ) : (
                "Try Again"
              )}
            </Button>
          )}
          {isSuccess && (
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              Go to Dashboard
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
