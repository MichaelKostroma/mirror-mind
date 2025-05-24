import { MirrorLogo } from "@/components/mirror-logo"

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
        <MirrorLogo size="sm" withText={false} className="animate-pulse" />
      </div>
    </div>
  )
}
