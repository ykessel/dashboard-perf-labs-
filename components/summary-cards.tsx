"use client"

import React, { useState, useMemo, useEffect, useRef } from "react"
import { TrendingUp, TrendingDown, Minus, AlertCircle, Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ConnectionStatus } from "@/components/connection-status"
import { OPERATORS, VALUES_KEY_LABELS } from "@/types/air-quality"
import { useUnifiedSocket } from "@/hooks/use-unified-socket"
import { cn } from "@/lib/utils"

export const SummaryCards = React.memo(function SummaryCards() {
  const [operator, setOperator] = useState<OPERATORS>(OPERATORS.AVG)
  const [selectedParams, setSelectedParams] = useState<Set<string>>(new Set(["CO", "NO2", "T", "RH", "PT08S1", "NMHC"]))
  const [previousValues, setPreviousValues] = useState<Record<string, number>>({})
  
  // Use ref to track if we've already processed the current data
  const processedDataRef = useRef<{ socketData: any }>({ socketData: null })

  // Socket.IO connection (real only)
  const { 
    isConnected, 
    data: socketData, 
    error: socketError, 
  } = useUnifiedSocket({
    useSimulator: false, // Use real Socket.IO only
    simulatorOptions: {
      enabled: false,
    }
  })

  // All available parameters to display in cards
  const allParams = Object.keys(VALUES_KEY_LABELS)
  const displayParams = Array.from(selectedParams)

  // Transform Socket.IO data to our format with real-time updates
  const metrics = useMemo(() => {
    if (!socketData) return []

    return displayParams.map((param: string) => {
      const currentValue = socketData[param] || 0

      // Calculate trend based on previous value
      const previousValue = previousValues[param]
      let trend: "up" | "down" | "neutral" = "neutral"
      
      if (previousValue !== undefined && Math.abs(currentValue - previousValue) > 0.001) {
          trend = currentValue > previousValue ? "up" : "down"
        }

        return {
          parameter: param,
          value: currentValue,
          previousValue,
          trend,
          lastUpdated: new Date(),
        }
      })
  }, [socketData, displayParams, previousValues])

  // Update previous values when data changes
  useEffect(() => {
    // Check if data has actually changed
    const currentData = { socketData }
    const previousData = processedDataRef.current
    
    if (currentData.socketData === previousData.socketData) {
      return // No change, skip update
    }
    
    // Update processed data ref
    processedDataRef.current = currentData
    
    if (!socketData) return

    setPreviousValues(prev => {
      const newPreviousValues: Record<string, number> = {}
      let hasChanges = false
      
      displayParams.forEach((param: string) => {
        const currentValue = socketData[param] || 0
        
        // Only update if we have a current value and it's different from the previous
        if (currentValue !== 0 || socketData[param] !== undefined) {
          const previousValue = prev[param]
          if (previousValue === undefined || Math.abs(currentValue - previousValue) > 0.001) {
            newPreviousValues[param] = previousValue !== undefined ? previousValue : currentValue
            hasChanges = true
          }
        }
      })
      
      // Only update state if there are actual changes
      if (hasChanges) {
        return {
          ...prev,
          ...newPreviousValues
        }
      }
      
      return prev
    })
  }, [socketData, displayParams])

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
        return "text-green-700 dark:text-green-400"
      case "down":
        return "text-red-700 dark:text-red-400"
      default:
        return "text-gray-900 dark:text-gray-100"
    }
  }

  // Loading state when not connected
  const isLoading = !isConnected

  if (socketError) {
    return (
      <div className="space-y-4">
        {/* Header Section - Mobile Optimized */}
        <div className="space-y-3 sm:space-y-4">
          {/* Title and Info */}
          <div className="space-y-1 sm:space-y-2">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
              Environmental Metrics Summary 
              <span className="text-xs sm:text-sm font-normal text-gray-600 dark:text-gray-400 ml-2">
                ({selectedParams.size} de {allParams.length} parámetros)
              </span>
            </h2>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              🔄 Datos en tiempo real via WebSocket
            </p>
          </div>

          {/* Controls - Mobile Stacked, Desktop Horizontal */}
          <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Connection Status */}
            <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3">
              <ConnectionStatus isConnected={isConnected} hasError={!!socketError} />
            </div>

            {/* Controls Container */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              {/* Parameters Button */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center justify-center gap-2 w-full sm:w-auto h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm" 
                    aria-label="Configure parameters"
                  >
                    <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
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
                          className="flex-1 sm:flex-none text-xs"
                        >
                          <span className="hidden sm:inline">Predeterminados</span>
                          <span className="sm:hidden">Default</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={selectAllParameters} 
                          aria-label="Select all parameters"
                          className="flex-1 sm:flex-none text-xs"
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
                <SelectTrigger className="w-full sm:w-32 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm" aria-label="Select aggregation operator">
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
          <AlertDescription>
            {String(socketError)}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section - Mobile Optimized */}
      <div className="space-y-3 sm:space-y-4">
        {/* Title and Info */}
        <div className="space-y-1 sm:space-y-2">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
            Environmental Metrics Summary
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {selectedParams.size} de {allParams.length} parámetros seleccionados
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            🔄 Datos en tiempo real via WebSocket
          </p>
        </div>

        {/* Controls - Mobile Stacked, Desktop Horizontal */}
        <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Connection Status */}
          <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3">
            <ConnectionStatus isConnected={isConnected} hasError={!!socketError} />
          </div>

          {/* Controls Container */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            {/* Parameters Button */}
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center justify-center gap-2 w-full sm:w-auto h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm" 
                  aria-label="Configure parameters"
                >
                  <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
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
                        className="flex-1 sm:flex-none text-xs"
                      >
                        <span className="hidden sm:inline">Predeterminados</span>
                        <span className="sm:hidden">Default</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={selectAllParameters} 
                        aria-label="Select all parameters"
                        className="flex-1 sm:flex-none text-xs"
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
              <SelectTrigger className="w-full sm:w-32 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm" aria-label="Select aggregation operator">
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
        <div className="flex h-32 items-center justify-center text-gray-600 dark:text-gray-400">
          <p>Selecciona al menos un parámetro para ver los datos</p>
        </div>
      ) : (
        <div className="grid gap-2 sm:gap-3 md:gap-4 lg:gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 layout-stable">
          {displayParams.map((param: string) => {
          const metric = metrics.find((m) => m.parameter === param)
          const label = VALUES_KEY_LABELS[param]?.label || param

          return (
            <Card key={param} className="relative overflow-hidden card-hover border-0 shadow-sm min-h-[140px] sm:min-h-[130px] md:min-h-[120px] performance-optimized py-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate pr-2">{label}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-3 sm:px-2">
                <div className="flex items-center justify-between h-full min-h-[80px] sm:min-h-[60px]">
                  <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-2xl sm:text-2xl md:text-2xl lg:text-2xl font-bold transition-all duration-500 truncate leading-tight",
                        isLoading ? "text-muted-foreground" : getTrendColor(metric?.trend || "neutral"),
                        metric?.trend !== "neutral" && "animate-pulse"
                      )}
                    >
                      {isLoading ? "--" : metric?.value?.toFixed(2) || "0.00"}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white w-fit">
                        {operator}
                      </span>
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
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <span className="text-sm">Connecting...</span>
                  </div>
                </div>
              )}

              {metric && metric.trend !== "neutral" && !isLoading && (
                <div
                  className={cn(
                    "absolute top-2 right-2 h-3 w-3 rounded-full animate-pulse shadow-sm",
                    metric.trend === "up" ? "bg-green-500" : "bg-red-500",
                  )}
                />
              )}
            </Card>
          )
        })}
        </div>
      )}
    </div>
  )
})
