import OpenAI from "openai"
import { DecisionData, AnalysisResult } from "@/lib/types"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function analyzeDecision(data: DecisionData): Promise<AnalysisResult> {
  console.log("🤖 Starting OpenAI analysis for decision:", data.title)
  console.log("🔑 got key:", process.env.OPENAI_API_KEY?.slice(0,4))
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured")
  }

  const detectLanguageResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a language detection expert. Your only task is to identify the language of the text provided. Respond with just the ISO language code (e.g., 'en' for English, 'es' for Spanish, 'fr' for French, etc.)."
      },
      {
        role: "user",
        content: `${data.title}\n${data.situation}\n${data.decision}\n${data.reasoning || ""}`
      }
    ],
    max_tokens: 10,
    temperature: 0.1,
  });

  const detectedLanguage = detectLanguageResponse.choices[0].message.content?.trim() || "en";
  console.log("🌐 Detected language:", detectedLanguage);

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

    // Reuse the same OpenAI client instance
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
              `You are an expert decision analyst. Your job is to analyze decisions and provide insights about cognitive biases, missed alternatives, and the quality of the decision-making process. Always respond with valid JSON. Respond in the same language as the user's input (detected as: ${detectedLanguage}). The field names in the JSON should still be in English. The "category" field value should always be in English, but all other values should be in the detected language.`,
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
  } catch (error) {
    console.error("❌ OpenAI analysis error:", error)

    // Log specific error details
    if (error instanceof Error) {
      const apiError = error;
      if ('status' in apiError) {
        console.error("❌ HTTP Status:", apiError.status)
      }
      if ('code' in apiError) {
        console.error("❌ Error Code:", apiError.code)
      }
    }

    throw error
  }
}
