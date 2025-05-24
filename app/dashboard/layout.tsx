import type React from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ErrorBoundary } from "@/components/error-boundary"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex-1 container py-6">
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
    </div>
  )
}
