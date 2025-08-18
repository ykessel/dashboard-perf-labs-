"use client"

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react"
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
import { PerformanceWrapper, usePerformanceMonitor } from "@/components/performance-wrapper"

// Memoized individual card component to prevent unnecessary re-renders
const SummaryCard = React.memo<{
  parameter: string
  value: number
  previousValue?: number
  trend: "up" | "down" | "neutral"
  lastUpdated: Date
}>(({ parameter, value, previousValue, trend, lastUpdated }) => {
  const label = VALUES_KEY_LABELS[parameter as keyof typeof VALUES_KEY_LABELS]?.label || parameter
  
  const getTrendIcon = useCallback(() => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }, [trend])

  const getValueColor = useCallback(() => {
    // Add color coding based on parameter values
    if (parameter === "CO" && value > 9) return "text-red-600"
    if (parameter === "NO2" && value > 200) return "text-red-600"
    if (parameter === "T" && (value < 10 || value > 30)) return "text-orange-600"
    return "text-foreground"
  }, [parameter, value])

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
          {label}
          {getTrendIcon()}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-2xl font-bold">
          <span className={getValueColor()}>
            {typeof value === 'number' ? value.toFixed(2) : 'N/A'}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      </CardContent>
    </Card>
  )
})

SummaryCard.displayName = 'SummaryCard'

// Memoized settings component
const SettingsPanel = React.memo<{
  operator: OPERATORS
  setOperator: (operator: OPERATORS) => void
  selectedParams: Set<string>
  setSelectedParams: (params: Set<string> | ((prev: Set<string>) => Set<string>)) => void
}>(({ operator, setOperator, selectedParams, setSelectedParams }) => {
  const handleParamToggle = useCallback((param: string) => {
    setSelectedParams((prev: Set<string>) => {
      const newSet = new Set(prev)
      if (newSet.has(param)) {
        newSet.delete(param)
      } else {
        newSet.add(param)
      }
      return newSet
    })
  }, [setSelectedParams])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium leading-none mb-2">Aggregation Method</h4>
            <Select value={operator} onValueChange={(value) => setOperator(value as OPERATORS)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={OPERATORS.AVG}>Average</SelectItem>
                <SelectItem value={OPERATORS.MAX}>Maximum</SelectItem>
                <SelectItem value={OPERATORS.MIN}>Minimum</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <h4 className="font-medium leading-none mb-2">Display Parameters</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(VALUES_KEY_LABELS).map(([key, labelObj]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={selectedParams.has(key)}
                    onCheckedChange={() => handleParamToggle(key)}
                  />
                  <label htmlFor={key} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {labelObj.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
})

SettingsPanel.displayName = 'SettingsPanel'

export const SummaryCards = React.memo(function SummaryCards() {
  usePerformanceMonitor('SummaryCards')
  
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
  const displayParams = useMemo(() => Array.from(selectedParams), [selectedParams])

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
          ...newPreviousValues,
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
              <SettingsPanel
                operator={operator}
                setOperator={handleOperatorChange}
                selectedParams={selectedParams}
                setSelectedParams={toggleParameter}
              />

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
            <SettingsPanel
              operator={operator}
              setOperator={handleOperatorChange}
              selectedParams={selectedParams}
              setSelectedParams={toggleParameter}
            />

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
            <SummaryCard
              key={param}
              parameter={param}
              value={metric?.value || 0}
              previousValue={metric?.previousValue}
              trend={metric?.trend || "neutral"}
              lastUpdated={metric?.lastUpdated || new Date()}
            />
          )
        })}
        </div>
      )}
    </div>
  )
})
