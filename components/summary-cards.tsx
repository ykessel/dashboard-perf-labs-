"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { TrendingUp, TrendingDown, Minus, AlertCircle, Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ConnectionStatus } from "@/components/connection-status"
import { OPERATORS, VALUES_KEY_LABELS, type DateRange } from "@/types/air-quality"
import { useSocket } from "@/hooks/use-socket"
import { cn } from "@/lib/utils"
import { config } from "@/lib/config"

interface SummaryCardsProps {
  dateRange: DateRange
}

interface MetricCardData {
  parameter: string
  value: number
  previousValue?: number
  trend: "up" | "down" | "neutral"
  lastUpdated: Date
}

export const SummaryCards = React.memo(function SummaryCards({ dateRange }: SummaryCardsProps) {
  const [operator, setOperator] = useState<OPERATORS>(OPERATORS.AVG)
  const [metrics, setMetrics] = useState<MetricCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedParams, setSelectedParams] = useState<Set<string>>(new Set(["CO", "NO2", "T", "RH", "PT08S1", "NMHC"]))

  // Real Socket.io connection
  const { isConnected, data: socketData, error: socketError } = useSocket(
    config.development.enableWebSocket ? config.websocket.url : undefined
  )

  // All available parameters to display in cards
  const allParams = useMemo(() => Object.keys(VALUES_KEY_LABELS), [])
  const displayParams = useMemo(() => Array.from(selectedParams), [selectedParams])

  const fetchSummaryData = useCallback(async (selectedOperator: OPERATORS) => {
    try {
      setLoading(true)
      setError(null)

      const fromDate = dateRange.from.toISOString().split("T")[0]
      const toDate = dateRange.to.toISOString().split("T")[0]

      const response = await fetch(
        `/api/air-quality/summary?from=${fromDate}&to=${toDate}&operator=${selectedOperator}`,
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `API Error: ${response.status} - ${response.statusText}`)
      }

      const data = await response.json()

      // Transform API data to our format
      const newMetrics: MetricCardData[] = displayParams.map((param: string) => {
        let currentValue = data[param] || 0

        if (socketData && socketData[param] !== undefined) {
          currentValue = socketData[param]
        }

        const existingMetric = metrics.find((m) => m.parameter === param)
        const previousValue = existingMetric?.value

        let trend: "up" | "down" | "neutral" = "neutral"
        if (previousValue !== undefined && currentValue !== previousValue) {
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

      setMetrics(newMetrics)
    } catch (err) {
      console.error("Error fetching summary data:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }, [dateRange, displayParams, metrics, socketData])

  // Update metrics when real-time data is received
  const updateMetricsWithRealTimeData = useCallback((realTimeData: any) => {
    if (!realTimeData || metrics.length === 0) return

    setMetrics((prevMetrics) =>
      prevMetrics.map((metric) => {
        const newValue = realTimeData[metric.parameter]
        if (newValue !== undefined) {
          const trend = newValue > metric.value ? "up" : newValue < metric.value ? "down" : "neutral"
          return {
            ...metric,
            previousValue: metric.value,
            value: newValue,
            trend,
            lastUpdated: new Date(),
          }
        }
        return metric
      })
    )
  }, [metrics])

  // Update metrics when socket data changes
  useEffect(() => {
    if (socketData) {
      updateMetricsWithRealTimeData(socketData)
    }
  }, [socketData, updateMetricsWithRealTimeData])

  // Fetch data when dependencies change
  useEffect(() => {
    fetchSummaryData(operator)
  }, [fetchSummaryData, operator])

  // Memoize trend icon component
  const TrendIcon = useCallback(({ trend }: { trend: "up" | "down" | "neutral" }) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-400" />
    }
  }, [])

  // Memoize metric card component
  const MetricCard = useCallback(({ metric }: { metric: MetricCardData }) => {
    const label = VALUES_KEY_LABELS[metric.parameter as keyof typeof VALUES_KEY_LABELS]?.label || metric.parameter
    const unit = VALUES_KEY_LABELS[metric.parameter as keyof typeof VALUES_KEY_LABELS]?.unit || ""

    return (
      <Card key={metric.parameter} className="relative overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm font-medium">
            <span className="truncate">{label}</span>
            <TrendIcon trend={metric.trend} />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1">
            <div className="text-2xl font-bold">
              {metric.value.toFixed(2)}
              <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Last updated: {metric.lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }, [TrendIcon])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Summary Metrics</h2>
          <ConnectionStatus isConnected={isConnected} error={socketError} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Summary Metrics</h2>
          <ConnectionStatus isConnected={isConnected} error={socketError} />
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">Summary Metrics</h2>
        <div className="flex items-center gap-4">
          <ConnectionStatus isConnected={isConnected} error={socketError} />
          
          <Select value={operator} onValueChange={(value) => setOperator(value as OPERATORS)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(OPERATORS).map(([key, value]) => (
                <SelectItem key={key} value={value}>
                  {key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Parameters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Select Parameters</h4>
                <div className="grid grid-cols-2 gap-2">
                  {allParams.map((param) => {
                    const label = VALUES_KEY_LABELS[param as keyof typeof VALUES_KEY_LABELS]?.label || param
                    return (
                      <div key={param} className="flex items-center space-x-2">
                        <Checkbox
                          id={param}
                          checked={selectedParams.has(param)}
                          onCheckedChange={(checked) => {
                            setSelectedParams((prev) => {
                              const newSet = new Set(prev)
                              if (checked) {
                                newSet.add(param)
                              } else {
                                newSet.delete(param)
                              }
                              return newSet
                            })
                          }}
                        />
                        <label htmlFor={param} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {label}
                        </label>
                      </div>
                    )
                  })}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {metrics.map((metric) => (
          <MetricCard key={metric.parameter} metric={metric} />
        ))}
      </div>
    </div>
  )
})
