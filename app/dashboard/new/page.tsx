"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import getSupabaseClient from "@/lib/supabase-global"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Database, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getCurrentUser } from "@/lib/supabase/auth-utils"

export default function NewDecision() {
  const [title, setTitle] = useState("")
  const [situation, setSituation] = useState("")
  const [decision, setDecision] = useState("")
  const [reasoning, setReasoning] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTableMissing, setIsTableMissing] = useState(false)
  const [isCheckingTable, setIsCheckingTable] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          router.push("/login")
          return
        }
        setUser(currentUser)
      } catch (error) {
        console.error("Auth error:", error)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  // Check if the decisions table exists
  useEffect(() => {
    if (!user) return

    async function checkTable() {
      try {
        const supabase = getSupabaseClient()
        const { error } = await supabase.from("decisions").select("id").limit(1).maybeSingle()

        if (error && error.message.includes("relation") && error.message.includes("does not exist")) {
          setIsTableMissing(true)
        }
      } catch (error) {
        console.error("Error checking table:", error)
        setIsTableMissing(true)
      } finally {
        setIsCheckingTable(false)
      }
    }

    checkTable()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!user) {
        throw new Error("Not authenticated")
      }

      // Use the new API endpoint that handles both creation and analysis
      const response = await fetch("/api/create-decision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          situation,
          decision,
          reasoning: reasoning || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create decision")
      }

      toast({
        title: "Decision created",
        description: "Your decision has been recorded and is being analyzed.",
      })

      router.push("/dashboard")
      router.refresh()
    } catch (error: any) {
      console.error("Error creating decision:", error)

      if (error.message?.includes("relation") && error.message?.includes("does not exist")) {
        setIsTableMissing(true)
        toast({
          title: "Database not set up",
          description: "The database tables haven't been created yet. Please set up your database.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to create decision. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user || isCheckingTable) {
    return (
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-6">
            <Link href="/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
          <h1 className="text-3xl font-bold mb-6">Record a New Decision</h1>
          <Card>
            <CardContent className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p>Loading...</p>
              </div>
            </CardContent>
          </Card>
        </div>
    )
  }

  if (isTableMissing) {
    return (
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-6">
            <Link href="/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
          <h1 className="text-3xl font-bold mb-6">Database Setup Required</h1>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
                Database Setup Required
              </CardTitle>
              <CardDescription>The database tables for Mirror Mind haven't been created yet.</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Missing Database Tables</AlertTitle>
                <AlertDescription>
                  Please go to the dashboard for instructions on how to set up your database.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
    )
  }

  return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-6">Record a New Decision</h1>
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Decision Details</CardTitle>
              <CardDescription>Record the details of your decision for AI analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    placeholder="Give your decision a clear title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="situation">
                  Situation
                  <span className="text-muted-foreground ml-1 text-sm">(What's the context?)</span>
                </Label>
                <Textarea
                    id="situation"
                    placeholder="Describe the situation or problem you're facing"
                    rows={4}
                    value={situation}
                    onChange={(e) => setSituation(e.target.value)}
                    required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="decision">
                  Decision
                  <span className="text-muted-foreground ml-1 text-sm">(What did you decide?)</span>
                </Label>
                <Textarea
                    id="decision"
                    placeholder="What decision did you make or are you planning to make?"
                    rows={3}
                    value={decision}
                    onChange={(e) => setDecision(e.target.value)}
                    required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reasoning">
                  Your Reasoning
                  <span className="text-muted-foreground ml-1 text-sm">(Optional)</span>
                </Label>
                <Textarea
                    id="reasoning"
                    placeholder="Why did you make this decision? What factors influenced you?"
                    rows={3}
                    value={reasoning}
                    onChange={(e) => setReasoning(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit for Analysis"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
  )
}
