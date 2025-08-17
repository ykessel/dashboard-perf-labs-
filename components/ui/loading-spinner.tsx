import React from "react"
import { cn } from "@/lib/utils"

interface LoadingStateProps {
  message?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingState({ 
  message = "Loading...", 
  size = "md",
  className 
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  }

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <div 
        className={cn(
          "animate-spin rounded-full border-2 border-primary border-t-transparent",
          sizeClasses[size]
        )}
        style={{
          animationDuration: '0.8s',
          willChange: 'transform'
        }}
      />
      {message && (
        <span className="text-sm text-muted-foreground font-medium">
          {message}
        </span>
      )}
    </div>
  )
}

// Optimized spinner for critical loading states
export function CriticalLoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-32">
      <div 
        className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
        style={{
          animationDuration: '0.8s',
          willChange: 'transform'
        }}
      />
    </div>
  )
}
