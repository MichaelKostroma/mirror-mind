import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import Link from "next/link"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Sparkles className="h-10 w-10 text-primary" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No decisions yet</h3>
      <p className="mb-4 mt-2 text-sm text-muted-foreground">
        You haven&apos;t created any decisions yet. Start by creating your first decision.
      </p>
      <Link href="/dashboard/new">
        <Button>Create your first decision</Button>
      </Link>
    </div>
  )
}
