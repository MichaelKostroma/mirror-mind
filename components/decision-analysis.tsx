import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

interface Decision {
  id: string
  title: string
  situation: string
  decision: string
  reasoning?: string | null
  created_at: string
  analysis_status: "pending" | "completed" | "failed"
  analysis_category?: string | null
  cognitive_biases?: string[] | null
  missed_alternatives?: string[] | null
  analysis_summary?: string | null
}

interface DecisionAnalysisProps {
  decision: Decision
}

export function DecisionAnalysis({ decision }: DecisionAnalysisProps) {
  // Check if we have analysis data
  const hasAnalysisData =
    decision.analysis_category ||
    (decision.cognitive_biases && decision.cognitive_biases.length > 0) ||
    (decision.missed_alternatives && decision.missed_alternatives.length > 0) ||
    decision.analysis_summary

  if (!hasAnalysisData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Analysis</CardTitle>
          <CardDescription>Analysis completed but no insights were generated</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              The analysis completed successfully, but no specific insights were generated for this decision. This can
              happen with very straightforward decisions or when the AI couldn't identify specific patterns.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Analysis</CardTitle>
          <CardDescription>Insights and observations about your decision</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {decision.analysis_category && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Decision Category</h3>
              <Badge variant="secondary" className="text-sm">
                {decision.analysis_category}
              </Badge>
            </div>
          )}

          {decision.cognitive_biases && decision.cognitive_biases.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Potential Cognitive Biases</h3>
              <ul className="space-y-2">
                {decision.cognitive_biases.map((bias, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{bias}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {decision.missed_alternatives && decision.missed_alternatives.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Missed Alternatives</h3>
              <ul className="space-y-2">
                {decision.missed_alternatives.map((alternative, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{alternative}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {decision.analysis_summary && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Summary</h3>
              <p className="whitespace-pre-line">{decision.analysis_summary}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
