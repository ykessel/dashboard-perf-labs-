"use client"

import React, { useState, useMemo } from "react"
import { TrendingUp, TrendingDown, Minus, AlertCircle, Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ConnectionStatus } from "@/components/connection-status"
import { OPERATORS, VALUES_KEY_LABELS } from "@/types/air-quality"
import { useSocket } from "@/hooks/use-socket"
import { useDashboard } from "@/components/dashboard-provider"
import { useSummaryData } from "@/hooks/use-air-quality-queries"
import { cn } from "@/lib/utils"
import { config } from "@/lib/config"

interface MetricCardData {
  parameter: string
  value: number
  previousValue?: number
  trend: "up" | "down" | "neutral"
  lastUpdated: Date
}

export const SummaryCards = React.memo(function SummaryCards() {
  const { dateRange } = useDashboard()
  const [operator, setOperator] = useState<OPERATORS>(OPERATORS.AVG)
  const [selectedParams, setSelectedParams] = useState<Set<string>>(new Set(["CO", "NO2", "T", "RH", "PT08S1", "NMHC"]))

  // Real Socket.io connection
  const { isConnected, data: socketData, error: socketError } = useSocket(
    config.development.enableWebSocket ? config.websocket.url : undefined
  )

  // React Query hook for summary data
  const { data: summaryData, isLoading, error, refetch } = useSummaryData(dateRange, operator)

  // All available parameters to display in cards
  const allParams = Object.keys(VALUES_KEY_LABELS)
  const displayParams = Array.from(selectedParams)

  // Transform API data to our format with real-time updates
  const metrics = useMemo(() => {
    if (!summaryData) return []

    return displayParams.map((param: string) => {
      let currentValue = summaryData[param] || 0

      // Override with real-time data if available
      if (socketData && socketData[param] !== undefined) {
        currentValue = socketData[param]
      }

      return {
        parameter: param,
        value: currentValue,
        trend: "neutral" as const, // Simplified for now
        lastUpdated: new Date(),
      }
    })
  }, [summaryData, socketData, displayParams])

  const handleOperatorChange = (newOperator: string) => {
    const validOperator = newOperator as OPERATORS
    if (Object.values(OPERATORS).includes(validOperator)) {
      setOperator(validOperator)
    }
  }

  const toggleParameter = (param: string) => {
    setSelectedParams(prev => {
      const newSet = new Set(prev)
      if (newSet.has(param)) {
        // No permitir deseleccionar si solo queda uno
        if (newSet.size > 1) {
          newSet.delete(param)
        }
      } else {
        newSet.add(param)
      }
      return newSet
    })
  }

  const selectAllParameters = () => {
    setSelectedParams(new Set(allParams))
  }

  const selectDefaultParameters = () => {
    setSelectedParams(new Set(["CO", "NO2", "T", "RH", "PT08S1", "NMHC"]))
  }

  const getTrendIcon = (trend: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getTrendColor = (trend: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return "text-green-600"
      case "down":
        return "text-red-600"
      default:
        return "text-card-foreground"
    }
  }

  const getParameterColor = (param: string) => {
    const colors = {
      CO: "bg-primary",
      PT08S1: "bg-blue-500",
      NMHC: "bg-green-500",
      C6H6: "bg-purple-500",
      PT08S2: "bg-indigo-500",
      NOx: "bg-orange-500",
      PT08S3: "bg-pink-500",
      NO2: "bg-secondary",
      PT08S4: "bg-teal-500",
      PT08S5: "bg-cyan-500",
      T: "bg-accent",
      RH: "bg-chart-3",
      AH: "bg-yellow-500",
    }
    return colors[param as keyof typeof colors] || "bg-primary"
  }

  if (error && !socketError) {
    return (
      <div className="space-y-4">
        {/* Header Section - Mobile Optimized */}
        <div className="space-y-4">
          {/* Title and Info */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              Environmental Metrics Summary 
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({selectedParams.size} de {allParams.length} parámetros)
              </span>
            </h2>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              🔄 Real-time data via WebSocket (updates every 2s)
            </p>
          </div>

          {/* Controls - Mobile Stacked, Desktop Horizontal */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Connection Status - Always visible */}
            <div className="flex items-center justify-center sm:justify-start">
              <ConnectionStatus isConnected={isConnected} hasError={!!socketError} />
            </div>

            {/* Controls Container */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Parameters Button */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center justify-center gap-2 w-full sm:w-auto" 
                    aria-label="Configure parameters"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Parámetros</span>
                    <span className="sm:hidden">Configurar</span>
                    <span className="text-xs">({selectedParams.size})</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[calc(100vw-2rem)] sm:w-80 bg-background/95 backdrop-blur-sm" align="center">
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={selectDefaultParameters} 
                          aria-label="Select default parameters"
                          className="flex-1 sm:flex-none"
                        >
                          <span className="hidden sm:inline">Predeterminados</span>
                          <span className="sm:hidden">Default</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={selectAllParameters} 
                          aria-label="Select all parameters"
                          className="flex-1 sm:flex-none"
                        >
                          <span className="hidden sm:inline">Todos</span>
                          <span className="sm:hidden">All</span>
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                      {allParams.map((param) => (
                        <div key={param} className="flex items-center space-x-3">
                          <Checkbox
                            id={`error-${param}`}
                            checked={selectedParams.has(param)}
                            onCheckedChange={() => toggleParameter(param)}
                          />
                          <label htmlFor={`error-${param}`} className="text-sm font-normal cursor-pointer text-foreground">
                            {VALUES_KEY_LABELS[param]?.label || param}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Operator Select */}
              <Select value={operator} onValueChange={handleOperatorChange}>
                <SelectTrigger className="w-full sm:w-32" aria-label="Select aggregation operator">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={OPERATORS.AVG}>Average</SelectItem>
                  <SelectItem value={OPERATORS.MIN}>Minimum</SelectItem>
                  <SelectItem value={OPERATORS.MAX}>Maximum</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section - Mobile Optimized */}
      <div className="space-y-4">
        {/* Title and Info */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            Environmental Metrics Summary
          </h2>
          <p className="text-sm text-muted-foreground">
            {selectedParams.size} de {allParams.length} parámetros seleccionados
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            🔄 Real-time data via WebSocket (updates every 2s)
          </p>
        </div>

        {/* Controls - Mobile Stacked, Desktop Horizontal */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Connection Status - Always visible */}
          <div className="flex items-center justify-center sm:justify-start">
            <ConnectionStatus isConnected={isConnected} hasError={!!socketError} />
          </div>

          {/* Controls Container */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Parameters Button */}
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center justify-center gap-2 w-full sm:w-auto" 
                  aria-label="Configure parameters"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Parámetros</span>
                  <span className="sm:hidden">Configurar</span>
                  <span className="text-xs">({selectedParams.size})</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[calc(100vw-2rem)] sm:w-80 bg-background/95 backdrop-blur-sm" align="center">
                <div className="space-y-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={selectDefaultParameters} 
                        aria-label="Select default parameters"
                        className="flex-1 sm:flex-none"
                      >
                        <span className="hidden sm:inline">Predeterminados</span>
                        <span className="sm:hidden">Default</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={selectAllParameters} 
                        aria-label="Select all parameters"
                        className="flex-1 sm:flex-none"
                      >
                        <span className="hidden sm:inline">Todos</span>
                        <span className="sm:hidden">All</span>
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                    {allParams.map((param) => (
                      <div key={param} className="flex items-center space-x-3">
                        <Checkbox
                          id={param}
                          checked={selectedParams.has(param)}
                          onCheckedChange={() => toggleParameter(param)}
                        />
                        <label htmlFor={param} className="text-sm font-normal cursor-pointer text-foreground">
                          {VALUES_KEY_LABELS[param]?.label || param}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Operator Select */}
            <Select value={operator} onValueChange={handleOperatorChange}>
              <SelectTrigger className="w-full sm:w-32" aria-label="Select aggregation operator">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={OPERATORS.AVG}>Average</SelectItem>
                <SelectItem value={OPERATORS.MIN}>Minimum</SelectItem>
                <SelectItem value={OPERATORS.MAX}>Maximum</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {displayParams.length === 0 ? (
        <div className="flex h-32 items-center justify-center text-muted-foreground">
          <p>Selecciona al menos un parámetro para ver los datos</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 md:gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {displayParams.map((param: string) => {
          const metric = metrics.find((m) => m.parameter === param)
          const label = VALUES_KEY_LABELS[param]?.label || param

          return (
            <Card key={param} className="relative overflow-hidden card-hover border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate pr-2">{label}</CardTitle>
                <div
                  className={cn(
                    "h-6 w-6 sm:h-8 sm:w-8 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0",
                    `${getParameterColor(param)}/10`,
                  )}
                >
                  <div
                    className={cn("h-3 w-3 sm:h-4 sm:w-4 rounded-full transition-all duration-300", getParameterColor(param))}
                  ></div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-base sm:text-lg md:text-xl lg:text-2xl font-bold transition-all duration-500 truncate",
                        isLoading ? "text-muted-foreground" : getTrendColor(metric?.trend || "neutral"),
                      )}
                    >
                      {isLoading ? "--" : metric?.value?.toFixed(2) || "0.00"}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary w-fit">
                        {operator}
                      </span>
                      {metric?.lastUpdated && (
                        <p className="text-xs text-muted-foreground">{metric.lastUpdated.toLocaleTimeString()}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                    {!isLoading && metric && (
                      <div className="transition-all duration-300">{getTrendIcon(metric.trend)}</div>
                    )}
                  </div>
                </div>
              </CardContent>

              {/* Enhanced loading indicator */}
              {isLoading && (
                <div className="absolute inset-0 bg-card/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <span className="text-sm">Updating...</span>
                  </div>
                </div>
              )}

              {metric && metric.trend !== "neutral" && !isLoading && (
                <div
                  className={cn(
                    "absolute top-2 right-2 h-2 w-2 rounded-full animate-pulse",
                    metric.trend === "up" ? "bg-green-500" : "bg-red-500",
                  )}
                />
              )}
            </Card>
          )
        })}
        </div>
      )}

      {socketError && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>WebSocket connection error: {socketError}. Real-time updates unavailable.</AlertDescription>
        </Alert>
      )}
    </div>
  )
})
