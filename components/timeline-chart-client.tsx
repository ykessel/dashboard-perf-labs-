"use client"
import React, { useState, useMemo, useCallback } from "react"
import dynamic from "next/dynamic"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import type { INTERVALS } from "@/types/air-quality"
import { LoadingState } from "@/components/ui/loading-spinner"

// Lazy load the chart component with better loading strategy
const LazyChart = dynamic(() => import("./lazy-chart").then(mod => mod.LazyChart), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] items-center justify-center">
      <LoadingState message="Loading chart..." />
    </div>
  ),
})

interface TimelineChartClientProps {
  initialData: { date: string; value: number; formattedDate: string; [key: string]: any }[]
  availableParameters: Record<string, { label: string }>
  selectedInterval: INTERVALS
  selectedParameter: string
  onIntervalChange: (interval: INTERVALS) => void
  onParameterChange: (parameter: string) => void
  loadedParameters: Set<string>
}

export default function TimelineChartClient({ 
  initialData, 
  availableParameters, 
  selectedInterval, 
  selectedParameter,
  onIntervalChange,
  onParameterChange,
}: TimelineChartClientProps) {

  // Filter and transform data based on selected parameter - memoized for performance
  const chartData = useMemo(() => {
    if (!initialData || initialData.length === 0) {
      return []
    }
    
    return initialData
      .filter(item => item[selectedParameter] !== undefined && item[selectedParameter] !== null)
      .map((item) => ({
        date: item.date,
        value: item[selectedParameter] || 0,
        formattedDate: item.formattedDate,
        count: item.count
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [initialData, selectedParameter])

  // Memoized parameter color
  const parameterColor = useMemo(() => {
    const PARAMETER_COLORS = {
      CO: "#15803d",
      NO2: "#6366f1",
      RH: "#ec4899",
      T: "#f59e0b",
      AH: "#8b5cf6",
      PT08S1: "#dc2626",
      NMHC: "#7c3aed",
      C6H6: "#059669",
      PT08S2: "#ea580c",
      NOx: "#be185d",
      PT08S3: "#0891b2",
      PT08S4: "#65a30d",
      PT08S5: "#c2410c",
    } as const
    return PARAMETER_COLORS[selectedParameter as keyof typeof PARAMETER_COLORS] || "#15803d"
  }, [selectedParameter])

  // Memoized parameter label
  const parameterLabel = useMemo(() => {
    return availableParameters[selectedParameter]?.label || selectedParameter
  }, [availableParameters, selectedParameter])

  // Check if we have data for the selected parameter
  const hasData = chartData.length > 0

  // Memoized tooltip component
  const CustomTooltip = useCallback(({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null
    const data = payload[0].payload
    return (
      <div className="rounded-lg border bg-background p-3 shadow-md">
        <p className="text-sm font-medium">{data.formattedDate}</p>
        <p className="text-sm text-muted-foreground">
          {parameterLabel}: {payload[0].value?.toFixed(2)}
        </p>
        <p className="text-xs text-muted-foreground">
          Interval: {selectedInterval}
        </p>
      </div>
    )
  }, [parameterLabel, selectedInterval])

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
        <div className="flex gap-3">
          <Select value={selectedParameter} onValueChange={onParameterChange}>
            <SelectTrigger className="w-48" aria-label="Select air quality parameter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(availableParameters).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedInterval} onValueChange={(v) => onIntervalChange(v as INTERVALS)}>
            <SelectTrigger className="w-32" aria-label="Select time interval">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Card con gráfico */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span>{parameterLabel} Timeline</span>
              <span className="text-sm font-normal text-muted-foreground">
                Interval: {selectedInterval}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[400px]">
            {!hasData ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No data available for {parameterLabel} in the selected date range.
              </div>
            ) : (
              <LazyChart
                data={chartData}
                selectedParameter={selectedParameter}
                selectedInterval={selectedInterval}
                parameterColor={parameterColor}
                parameterLabel={parameterLabel}
                CustomTooltip={CustomTooltip}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
