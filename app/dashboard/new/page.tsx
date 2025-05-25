"use client"

import { FormEvent, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getCurrentUser } from "@/lib/supabase/auth-utils"
import { User } from "@/lib/types"

export default function NewDecision() {
  const [title, setTitle] = useState("")
  const [situation, setSituation] = useState("")
  const [decision, setDecision] = useState("")
  const [reasoning, setReasoning] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingTable, setIsCheckingTable] = useState(true)
  const [user, setUser] = useState<User | null>(null)
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
      } catch (error: unknown) {
        console.error("Auth error:", error)
        // Redirect to login page if authentication fails
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  // Skip checking if the decisions table exists as the database is already created
  useEffect(() => {
    if (!user) return

    // Set isCheckingTable to false immediately
    setIsCheckingTable(false)
  }, [user])

  const handleSubmit = async (e: FormEvent) => {
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
        description: "Your decision has been recorded and analyzing.",
      })

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error("Error creating decision:", error)

      const errorMessage = error instanceof Error ? error.message : String(error);

      // Always show a generic error message since we assume the database exists
      toast({
        title: "Error",
        description: errorMessage || "Failed to create decision. Please try again.",
        variant: "destructive",
      })
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
