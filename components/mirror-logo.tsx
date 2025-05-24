import { Sparkles } from "lucide-react"

interface MirrorLogoProps {
  size?: "sm" | "md" | "lg"
  withText?: boolean
  className?: string
}

export function MirrorLogo({ size = "md", withText = true, className = "" }: MirrorLogoProps) {
  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <Sparkles className={`${sizeClasses[size]} text-primary transition-colors`} />
      </div>
      {withText && <span className={`font-bold transition-colors ${textSizeClasses[size]}`}>Mirror Mind</span>}
    </div>
  )
}
