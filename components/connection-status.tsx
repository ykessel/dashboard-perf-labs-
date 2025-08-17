"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConnectionStatusProps {
  isConnected: boolean
  hasError: boolean
  className?: string
}

export const ConnectionStatus = React.memo(function ConnectionStatus({ isConnected, hasError, className }: ConnectionStatusProps) {
  if (hasError) {
    return (
      <Badge variant="destructive" className={cn("flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white border-red-700", className)}>
        <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
        <AlertCircle className="h-3 w-3" />
        Connection Error
      </Badge>
    )
  }

  return (
    <Badge 
      variant={isConnected ? "default" : "secondary"} 
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5",
        isConnected 
          ? "bg-green-600 text-white border-green-700" 
          : "bg-gray-600 text-white border-gray-700",
        className
      )}
    >
      <div className={cn(
        "h-2 w-2 rounded-full", 
        isConnected ? "bg-white animate-pulse" : "bg-gray-300"
      )}></div>
      {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
      {isConnected ? "Live" : "Offline"}
    </Badge>
  )
})
