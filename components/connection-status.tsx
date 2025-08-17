"use client"

import React from "react"
import { Wifi, WifiOff, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ConnectionStatusProps {
  isConnected: boolean
  hasError?: boolean
  className?: string
}

export const ConnectionStatus = React.memo(function ConnectionStatus({ isConnected, hasError, className }: ConnectionStatusProps) {
  if (hasError) {
    return (
      <Badge variant="destructive" className={cn("flex items-center gap-1.5 px-3 py-1.5", className)}>
        <div className="h-2 w-2 rounded-full bg-destructive animate-pulse"></div>
        <AlertCircle className="h-3 w-3" />
        Connection Error
      </Badge>
    )
  }

  return (
    <Badge variant={isConnected ? "default" : "secondary"} className={cn("flex items-center gap-1.5 px-3 py-1.5", className)}>
      <div className={cn("h-2 w-2 rounded-full", isConnected ? "bg-green-500 animate-pulse" : "bg-muted-foreground")}></div>
      {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
      {isConnected ? "Live" : "Offline"}
    </Badge>
  )
})
