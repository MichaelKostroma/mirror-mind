import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, CheckCircle, AlertTriangle } from "lucide-react"

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

interface DecisionCardProps {
  decision: Decision
}

export function DecisionCard({ decision }: DecisionCardProps) {
  // Default values for missing properties
  const status = decision.analysis_status || "pending"

  const statusConfig = {
    pending: {
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      icon: Clock,
      animate: true,
    },
    completed: {
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      icon: CheckCircle,
      animate: false,
    },
    failed: {
      className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      icon: AlertTriangle,
      animate: false,
    },
  }

  const StatusIcon = statusConfig[status].icon

  // Safely format date with fallback
  let formattedDate = "Unknown date"
  try {
    if (decision.created_at) {
      formattedDate = formatDistanceToNow(new Date(decision.created_at), { addSuffix: true })
    }
  } catch (error) {
    console.error("Error formatting date:", error)
  }

  // Truncate situation text
  const truncatedSituation =
    decision.situation.length > 120 ? `${decision.situation.substring(0, 120)}...` : decision.situation

  return (
    <Card className="overflow-hidden h-full flex flex-col transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2 flex-none">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="line-clamp-1">{decision.title}</CardTitle>
          <Badge variant="outline" className={statusConfig[status].className}>
            <StatusIcon className={`mr-1 h-3 w-3 ${statusConfig[status].animate ? "animate-pulse" : ""}`} />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
        <CardDescription className="flex items-center text-xs">{formattedDate}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="line-clamp-3 text-sm text-muted-foreground">{truncatedSituation}</p>
        {decision.analysis_category && (
          <Badge variant="secondary" className="mt-3">
            {decision.analysis_category}
          </Badge>
        )}
      </CardContent>
      <CardFooter className="flex-none pt-2">
        <Link href={`/dashboard/decisions/${decision.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
