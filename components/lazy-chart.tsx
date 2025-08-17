"use client"

import React, { Suspense, lazy, useState, useEffect, useMemo, useCallback } from 'react'
import { INTERVALS } from "@/types/air-quality"
import { LoadingState } from "@/components/ui/loading-spinner"

interface ChartDataPoint {
  date: string
  value: number
  formattedDate: string
}

interface LazyChartProps {
  data: ChartDataPoint[]
  selectedParameter: string
  selectedInterval: string
  parameterColor: string
  parameterLabel: string
  CustomTooltip: React.ComponentType<any>
}

// Helper function to format X-axis labels based on interval - moved outside hook context
const formatXAxisLabel = (value: string, interval: string) => {
  const { format, parseISO } = require('date-fns')
  const date = parseISO(value)
  
  switch (interval) {
    case INTERVALS.DAILY:
      return format(date, "MMM dd")
    case INTERVALS.MONTHLY:
      return format(date, "MMM")
    case INTERVALS.YEARLY:
      return format(date, "yyyy")
    default:
      return format(date, "MMM dd")
  }
}

// Optimized chart component with better performance
const ChartComponent = React.memo(function ChartComponent({ 
  data, 
  selectedParameter, 
  selectedInterval, 
  parameterColor, 
  parameterLabel, 
  CustomTooltip 
}: LazyChartProps) {
  
  // Memoize the chart configuration
  const chartConfig = useMemo(() => ({
    margin: { top: 5, right: 30, left: 20, bottom: 60 },
    strokeWidth: 2,
    dotRadius: 4,
    activeDotRadius: 6,
    brushHeight: 30
  }), [])

  // Memoize the line configuration
  const lineConfig = useMemo(() => ({
    type: "monotone" as const,
    dataKey: "value" as const,
    stroke: parameterColor,
    strokeWidth: chartConfig.strokeWidth,
    dot: { 
      fill: parameterColor, 
      strokeWidth: chartConfig.strokeWidth, 
      r: chartConfig.dotRadius 
    },
    activeDot: { 
      r: chartConfig.activeDotRadius, 
      stroke: parameterColor, 
      strokeWidth: chartConfig.strokeWidth 
    },
    name: parameterLabel
  }), [parameterColor, parameterLabel, chartConfig])

  // Memoize the axis configuration
  const axisConfig = useMemo(() => ({
    xAxis: {
      dataKey: "date" as const,
      tickFormatter: (value: string) => formatXAxisLabel(value, selectedInterval),
      angle: -45,
      textAnchor: "end" as const,
      height: 60,
      interval: "preserveStartEnd" as const
    },
    yAxis: {
      tickFormatter: (value: number) => value.toFixed(1)
    }
  }), [selectedInterval])

  // Memoize the brush configuration
  const brushConfig = useMemo(() => ({
    dataKey: "date" as const,
    height: chartConfig.brushHeight,
    stroke: parameterColor,
    tickFormatter: (value: string) => formatXAxisLabel(value, selectedInterval)
  }), [parameterColor, selectedInterval, chartConfig.brushHeight])

  return (
    <div className="h-[400px] w-full">
      <Suspense fallback={<ChartFallback />}>
        <LazyChartComponent
          data={data}
          chartConfig={chartConfig}
          lineConfig={lineConfig}
          axisConfig={axisConfig}
          brushConfig={brushConfig}
          CustomTooltip={CustomTooltip}
        />
      </Suspense>
    </div>
  )
})

// Lazy load the entire chart component as one unit with better error handling
const LazyChartComponent = lazy(() => 
  import('recharts').then((module) => {
    const { 
      LineChart, 
      Line, 
      XAxis, 
      YAxis, 
      CartesianGrid, 
      Tooltip, 
      Legend, 
      ResponsiveContainer, 
      Brush 
    } = module
    
    return {
      default: function LazyChartComponent({ 
        data, 
        chartConfig,
        lineConfig,
        axisConfig,
        brushConfig,
        CustomTooltip 
      }: any) {
        
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={chartConfig.margin}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis {...axisConfig.xAxis} />
              <YAxis {...axisConfig.yAxis} />
              <Tooltip content={CustomTooltip} />
              <Legend />
              <Line {...lineConfig} />
              <Brush {...brushConfig} />
            </LineChart>
          </ResponsiveContainer>
        )
      }
    }
  }).catch(() => {
    // Fallback if chart library fails to load
    return {
      default: function ChartError() {
        return (
          <div className="flex h-[400px] items-center justify-center text-destructive">
            Failed to load chart. Please refresh the page.
          </div>
        )
      }
    }
  })
)

const ChartFallback = React.memo(() => (
  <div className="flex h-[400px] items-center justify-center">
    <LoadingState message="Loading chart..." />
  </div>
))

export const LazyChart = React.memo(function LazyChart({
  data,
  selectedParameter,
  selectedInterval,
  parameterColor,
  parameterLabel,
  CustomTooltip
}: LazyChartProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [showFallback, setShowFallback] = useState(true)

  // Optimized loading strategy
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFallback(false)
    }, 50) // Reduced from 100ms to 50ms
    return () => clearTimeout(timer)
  }, [])

  // Track when chart is loaded
  useEffect(() => {
    if (data.length > 0) {
      setIsLoaded(true)
    }
  }, [data])

  // Memoize the chart props to prevent unnecessary re-renders
  const chartProps = useMemo(() => ({
    data,
    selectedParameter,
    selectedInterval,
    parameterColor,
    parameterLabel,
    CustomTooltip
  }), [data, selectedParameter, selectedInterval, parameterColor, parameterLabel, CustomTooltip])

  return (
    <div className="h-[400px] w-full">
      {showFallback && !isLoaded ? (
        <ChartFallback />
      ) : (
        <ChartComponent {...chartProps} />
      )}
    </div>
  )
})
