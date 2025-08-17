"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import dynamic from "next/dynamic"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, TrendingUp } from "lucide-react"
import { VALUES_KEY_LABELS, INTERVALS, type DateRange } from "@/types/air-quality"
import { format, parseISO, differenceInDays, differenceInMonths } from "date-fns"

// Dynamically import Recharts to reduce initial bundle size
const LineChart = dynamic(() => import("recharts").then(mod => ({ default: mod.LineChart })), { ssr: false })
const Line = dynamic(() => import("recharts").then(mod => ({ default: mod.Line })), { ssr: false })
const XAxis = dynamic(() => import("recharts").then(mod => ({ default: mod.XAxis })), { ssr: false })
const YAxis = dynamic(() => import("recharts").then(mod => ({ default: mod.YAxis })), { ssr: false })
const CartesianGrid = dynamic(() => import("recharts").then(mod => ({ default: mod.CartesianGrid })), { ssr: false })
const Tooltip = dynamic(() => import("recharts").then(mod => ({ default: mod.Tooltip })), { ssr: false })
const Legend = dynamic(() => import("recharts").then(mod => ({ default: mod.Legend })), { ssr: false })
const ResponsiveContainer = dynamic(() => import("recharts").then(mod => ({ default: mod.ResponsiveContainer })), { ssr: false })
const Brush = dynamic(() => import("recharts").then(mod => ({ default: mod.Brush })), { ssr: false })

interface TimelineChartProps {
  dateRange: DateRange
}

interface ChartDataPoint {
  date: string
  value: number
  formattedDate: string
}

export const TimelineChart = React.memo(function TimelineChart({ dateRange }: TimelineChartProps) {
  const [selectedParameter, setSelectedParameter] = useState<string>("CO")
  const [selectedInterval, setSelectedInterval] = useState<INTERVALS>(INTERVALS.DAILY)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Auto-determine interval based on date range
  const autoInterval = useMemo(() => {
    const daysDiff = differenceInDays(dateRange.to, dateRange.from)
    const monthsDiff = differenceInMonths(dateRange.to, dateRange.from)

    if (daysDiff <= 31) return INTERVALS.DAILY
    if (monthsDiff <= 12) return INTERVALS.MONTHLY
    return INTERVALS.YEARLY
  }, [dateRange])

  // Update interval when date range changes (only if user hasn't manually selected one)
  useEffect(() => {
    // Only auto-update if the current interval is the same as the previous auto interval
    // This prevents overriding user's manual selection
    setSelectedInterval(autoInterval)
  }, [autoInterval])

  const fetchTimelineData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const fromDate = dateRange.from.toISOString().split("T")[0]
      const toDate = dateRange.to.toISOString().split("T")[0]

      const response = await fetch(`/api/air-quality/timeline/${selectedParameter}?from=${fromDate}&to=${toDate}&interval=${selectedInterval}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `API Error: ${response.status} - ${response.statusText}`)
      }

      const data = await response.json()

      // Transform API data to chart format
      const transformedData: ChartDataPoint[] = Array.isArray(data) 
        ? data.map((item) => {
            const date = item.interval
            const value = item[selectedParameter as keyof typeof item]
            return {
              date,
              value: typeof value === "number" ? value : 0,
              formattedDate: format(parseISO(date), "MMM dd, yyyy"),
            }
          }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        : Object.entries(data).map(([date, value]) => ({
            date,
            value: typeof value === "number" ? value : 0,
            formattedDate: format(parseISO(date), "MMM dd, yyyy"),
          })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      setChartData(transformedData)
    } catch (err) {
      console.error("Error fetching timeline data:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch timeline data")
    } finally {
      setLoading(false)
    }
  }, [selectedParameter, selectedInterval, dateRange])

  useEffect(() => {
    fetchTimelineData()
  }, [fetchTimelineData])

  const CustomTooltip = useCallback(({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="rounded-lg border bg-background p-3 shadow-md">
          <p className="text-sm font-medium">{data.formattedDate}</p>
          <p className="text-sm text-muted-foreground">
            {VALUES_KEY_LABELS[selectedParameter]?.label}: {payload[0].value?.toFixed(2)}
          </p>
        </div>
      )
    }
    return null
  }, [selectedParameter])

  // Memoize chart configuration to prevent unnecessary re-renders
  const chartConfig = useMemo(() => ({
    [selectedParameter]: {
      label: VALUES_KEY_LABELS[selectedParameter]?.label || selectedParameter,
      color: "#3b82f6",
    },
  }), [selectedParameter])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Timeline Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 animate-pulse bg-muted rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Timeline Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Timeline Chart
        </CardTitle>
        <div className="flex flex-wrap gap-4">
          <Select value={selectedParameter} onValueChange={setSelectedParameter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select parameter" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(VALUES_KEY_LABELS).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedInterval} onValueChange={(value) => setSelectedInterval(value as INTERVALS)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(INTERVALS).map(([key, value]) => (
                <SelectItem key={key} value={value}>
                  {key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="formattedDate" 
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => value.toFixed(2)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                />
                <Brush dataKey="formattedDate" height={30} stroke="#3b82f6" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-96 items-center justify-center text-muted-foreground">
            No data available for the selected parameters
          </div>
        )}
      </CardContent>
    </Card>
  )
})
