"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { analyzeDecision } from "@/lib/openai"

interface DecisionInput {
  title: string
  situation: string
  decision: string
  reasoning?: string
}

export async function createDecision(data: DecisionInput) {
  console.log("🎯 Creating new decision:", data.title)

  const supabase = createClient()

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Error("Not authenticated")
  }

  const userId = session.user.id
  console.log("👤 User ID:", userId)

  // Insert the decision into the database
  const { data: decision, error } = await supabase
      .from("decisions")
      .insert({
        user_id: userId,
        title: data.title,
        situation: data.situation,
        decision: data.decision,
        reasoning: data.reasoning || null,
        analysis_status: "pending",
      })
      .select()
      .single()

  if (error) {
    console.error("❌ Error creating decision:", error)
    throw error
  }

  console.log("✅ Decision created with ID:", decision.id)

  // Trigger the analysis immediately (not in background)
  console.log("🚀 Starting immediate analysis...")

  try {
    await analyzeDecisionNow(decision.id, data)
    console.log("✅ Analysis completed immediately")
  } catch (analysisError) {
    console.error("❌ Immediate analysis failed, will remain pending:", analysisError)
    // Don't throw here - let the decision be created even if analysis fails
  }

  revalidatePath("/dashboard")
  return decision
}

async function analyzeDecisionNow(decisionId: string, data: DecisionInput) {
  console.log("🔬 Analyzing decision immediately:", decisionId)

  const supabase = createClient()

  try {
    // Update status to pending
    console.log("📝 Setting status to pending...")
    await supabase
        .from("decisions")
        .update({
          analysis_status: "pending",
        })
        .eq("id", decisionId)

    // Call the OpenAI API to analyze the decision
    console.log("🤖 Calling OpenAI analysis...")
    const analysis = await analyzeDecision(data)
    console.log("✅ OpenAI analysis result:", analysis)

    // Update the decision with the analysis results
    console.log("💾 Saving analysis to database...")
    const { error } = await supabase
        .from("decisions")
        .update({
          analysis_status: "completed",
          analysis_category: analysis.category,
          cognitive_biases: analysis.cognitive_biases,
          missed_alternatives: analysis.missed_alternatives,
          analysis_summary: analysis.summary,
        })
        .eq("id", decisionId)

    if (error) {
      console.error("❌ Error updating decision with analysis:", error)
      throw error
    }

    console.log("✅ Analysis saved successfully")
    revalidatePath("/dashboard")
    revalidatePath(`/dashboard/decisions/${decisionId}`)
  } catch (error: any) {
    console.error("❌ Error in analyzeDecisionNow:", error)

    // Update the decision to mark the analysis as failed
    await supabase
        .from("decisions")
        .update({
          analysis_status: "failed",
        })
        .eq("id", decisionId)

    revalidatePath("/dashboard")
    revalidatePath(`/dashboard/decisions/${decisionId}`)

    throw error
  }
}

export async function getDecision(id: string) {
  const supabase = createClient()

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Error("Not authenticated")
  }

  const userId = session.user.id

  // Fetch the decision from the database
  const { data: decision, error } = await supabase
      .from("decisions")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single()

  if (error) {
    console.error("Error fetching decision:", error)
    return null
  }

  return decision
}

export async function retryAnalysis(id: string) {
  console.log("🔄 Retrying analysis for decision:", id)

  const supabase = createClient()

  // Get the decision
  const { data: decision, error } = await supabase.from("decisions").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching decision for retry:", error)
    throw error
  }

  // Trigger the analysis
  await analyzeDecisionNow(id, {
    title: decision.title,
    situation: decision.situation,
    decision: decision.decision,
    reasoning: decision.reasoning,
  })

  return { success: true }
}
