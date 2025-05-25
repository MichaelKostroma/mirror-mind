import { NextResponse } from "next/server"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { analyzeDecision } from "@/lib/openai"
import { DecisionData } from "@/lib/types"
import { NextRequest } from "next/server"

// Specify Node.js runtime for OpenAI SDK compatibility
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
    console.log("🎯 Create decision endpoint called")

    try {
        const body = await request.json()
        console.log("📝 Request body:", body)

        const { title, situation, decision, reasoning } = body

        if (!title || !situation || !decision) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const supabase = createServerComponentClient({ cookies })

        // Get the current user
        const {
            data: { session },
        } = await supabase.auth.getSession()

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        console.log("👤 User authenticated:", session.user.email)

        // Insert the decision into the database
        console.log("💾 Creating decision...")
        const { data: newDecision, error: insertError } = await supabase
            .from("decisions")
            .insert({
                user_id: session.user.id,
                title,
                situation,
                decision,
                reasoning: reasoning || null,
                analysis_status: "pending",
            })
            .select()
            .single()

        if (insertError) {
            console.error("❌ Error creating decision:", insertError)
            throw insertError
        }

        console.log("✅ Decision created with ID:", newDecision.id)

        // Start analysis in the background without awaiting it
        console.log("🚀 Starting background analysis...")
        const backgroundTask = analyzeDecisionInBackground(newDecision.id, { title, situation, decision, reasoning })

        // Use waitUntil to ensure the background task completes even after response is returned
        if (request.signal?.waitUntil) {
            request.signal.waitUntil(backgroundTask);
        } else {
            // For non-Vercel environments (like local development), start the task without awaiting
            // This won't block the response, but the task might not complete if the server terminates too quickly
            backgroundTask.catch(error => console.error("❌ Background analysis error:", error));
        }

        // Create and return the response object immediately
        return NextResponse.json({
            success: true,
            decision: newDecision,
            message: "Decision created successfully. Analysis is starting in the background.",
        })
    } catch (error: unknown) {
        console.error("❌ Create decision error:", error)
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            {
                error: errorMessage,
                success: false,
            },
            { status: 500 },
        )
    }
}

// Background analysis function (runs without blocking the response)
async function analyzeDecisionInBackground(
    decisionId: string,
    data: DecisionData,
) {
    console.log("🔬 Starting background analysis for decision:", decisionId)

    try {
        // Create a new Supabase client for the background operation
        const cookieStore = cookies()
        const supabase = createServerComponentClient({ cookies: () => cookieStore })

        // Update status to pending (in case it wasn't set)
        await supabase.from("decisions").update({ analysis_status: "pending" }).eq("id", decisionId)

        console.log("🤖 Calling OpenAI for analysis...")

        // Call OpenAI analysis
        const analysis = await analyzeDecision({
            title: data.title,
            situation: data.situation,
            decision: data.decision,
            reasoning: data.reasoning,
        })

        console.log("✅ Background analysis completed:", analysis)

        // Update with results
        const { error: updateError } = await supabase
            .from("decisions")
            .update({
                analysis_status: "completed",
                analysis_category: analysis.category,
                cognitive_biases: analysis.cognitive_biases,
                missed_alternatives: analysis.missed_alternatives,
                analysis_summary: analysis.summary,
            })
            .eq("id", decisionId)

        if (updateError) {
            console.error("❌ Error updating decision with analysis:", updateError)
            throw updateError
        }

        console.log("✅ Background analysis saved to database")
    } catch (analysisError: unknown) {
        console.error("❌ Background analysis failed:", analysisError)

        try {
            // Mark as failed
            const supabase = createServerComponentClient({ cookies })
            await supabase.from("decisions").update({ analysis_status: "failed" }).eq("id", decisionId)
            console.log("📝 Decision marked as failed")
        } catch (markFailedError: unknown) {
            console.error("❌ Error marking decision as failed:", markFailedError)
        }
    }
}
