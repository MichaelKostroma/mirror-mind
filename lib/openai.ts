import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface DecisionData {
  title: string
  situation: string
  decision: string
  reasoning?: string
}

interface AnalysisResult {
  category: string
  cognitive_biases: string[]
  missed_alternatives: string[]
  summary: string
}

export async function analyzeDecision(data: DecisionData): Promise<AnalysisResult> {
  console.log("🤖 Starting OpenAI analysis for decision:", data.title)

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured")
  }

  const prompt = `
    Analyze the following decision:
    
    Title: ${data.title}
    Situation: ${data.situation}
    Decision: ${data.decision}
    Reasoning: ${data.reasoning || "Not provided"}
    
    Please provide:
    1. A category for this decision (e.g., emotional, strategic, impulsive, etc.)
    2. A list of potential cognitive biases that might have influenced this decision
    3. Alternative options or considerations that might have been overlooked
    4. A summary of the analysis
    
    Format your response as JSON with the following structure:
    {
      "category": "string",
      "cognitive_biases": ["string", "string", ...],
      "missed_alternatives": ["string", "string", ...],
      "summary": "string"
    }
  `

  try {
    console.log("📡 Making OpenAI API call...")

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
              "You are an expert decision analyst. Your job is to analyze decisions and provide insights about cognitive biases, missed alternatives, and the quality of the decision-making process. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
      temperature: 0.7,
    })

    console.log("✅ OpenAI API call successful")
    console.log("📊 Usage:", response.usage)

    const content = response.choices[0].message.content

    if (!content) {
      throw new Error("No content in OpenAI response")
    }

    console.log("📝 Raw OpenAI response:", content)

    const analysis = JSON.parse(content) as AnalysisResult

    // Validate the response structure
    if (!analysis.category || !analysis.cognitive_biases || !analysis.missed_alternatives || !analysis.summary) {
      throw new Error("Invalid analysis structure from OpenAI")
    }

    console.log("✅ Analysis completed successfully:", analysis)
    return analysis
  } catch (error: any) {
    console.error("❌ OpenAI analysis error:", error)

    // Log specific error details
    if (error.status) {
      console.error("❌ HTTP Status:", error.status)
    }
    if (error.code) {
      console.error("❌ Error Code:", error.code)
    }

    throw error
  }
}
