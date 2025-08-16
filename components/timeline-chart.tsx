"use client"

import { useState, useEffect, useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, TrendingUp } from "lucide-react"
import { VALUES_KEY_LABELS, INTERVALS, type DateRange } from "@/types/air-quality"
import { format, parseISO, differenceInDays, differenceInMonths } from "date-fns"

interface TimelineChartProps {
  dateRange: DateRange
}

interface ChartDataPoint {
  date: string
  value: number
  formattedDate: string
}

export function TimelineChart({ dateRange }: TimelineChartProps) {
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

  const fetchTimelineData = async () => {
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
  }

  useEffect(() => {
    fetchTimelineData()
  }, [selectedParameter, selectedInterval, dateRange])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="rounded-lg border bg-background p-3 shadow-md">
          <p className="text-sm font-medium">{data.formattedDate}</p>
          <p className="text-sm text-muted-foreground">
            {VALUES_KEY_LABELS[selectedParameter]?.label}: {payload[0].value?.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">
            Interval: {selectedInterval}
          </p>
        </div>
      )
    }
    return null
  }

  const getParameterColor = () => {
    const colors = {
      CO: "#15803d",
      PT08S1: "#84cc16",
      NMHC: "#059669",
      C6H6: "#0d9488",
      PT08S2: "#0891b2",
      NOx: "#0284c7",
      PT08S3: "#3b82f6",
      NO2: "#6366f1",
      PT08S4: "#8b5cf6",
      PT08S5: "#a855f7",
      T: "#d946ef",
      RH: "#ec4899",
      AH: "#f43f5e",
    }
    return colors[selectedParameter as keyof typeof colors] || "#15803d"
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-foreground">Timeline Analysis</h2>
          <div className="flex gap-2">
            <Select value={selectedParameter} onValueChange={setSelectedParameter}>
              <SelectTrigger className="w-48" aria-label="Select air quality parameter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(VALUES_KEY_LABELS).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedInterval} onValueChange={(value) => setSelectedInterval(value as INTERVALS)}>
              <SelectTrigger className="w-32" aria-label="Select time interval">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={INTERVALS.DAILY}>Daily</SelectItem>
                <SelectItem value={INTERVALS.MONTHLY}>Monthly</SelectItem>
                <SelectItem value={INTERVALS.YEARLY}>Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground">Timeline Analysis</h2>
          <p className="text-sm text-muted-foreground">
            Visualize parameter trends over time with interactive controls
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedParameter} onValueChange={setSelectedParameter}>
            <SelectTrigger className="w-48" aria-label="Select air quality parameter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(VALUES_KEY_LABELS).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedInterval} onValueChange={(value) => setSelectedInterval(value as INTERVALS)}>
            <SelectTrigger className="w-32" aria-label="Select time interval">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={INTERVALS.DAILY}>Daily</SelectItem>
              <SelectItem value={INTERVALS.MONTHLY}>Monthly</SelectItem>
              <SelectItem value={INTERVALS.YEARLY}>Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span>{VALUES_KEY_LABELS[selectedParameter]?.label} Timeline</span>
              <span className="text-sm font-normal text-muted-foreground">
                Interval: {selectedInterval.charAt(0).toUpperCase() + selectedInterval.slice(1)}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="flex h-[400px] items-center justify-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                Loading {selectedInterval} data for {VALUES_KEY_LABELS[selectedParameter]?.label}...
              </div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex h-[400px] items-center justify-center text-muted-foreground">
              No data available for the selected period
            </div>
          ) : (
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => format(parseISO(value), "MMM dd")}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval="preserveStartEnd"
                  />
                  <YAxis tickFormatter={(value) => value.toFixed(1)} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={getParameterColor()}
                    strokeWidth={2}
                    dot={{ fill: getParameterColor(), strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: getParameterColor(), strokeWidth: 2 }}
                    name={VALUES_KEY_LABELS[selectedParameter]?.label}
                  />
                  {/* Brush for zoom functionality */}
                  <Brush
                    dataKey="date"
                    height={30}
                    stroke={getParameterColor()}
                    tickFormatter={(value) => format(parseISO(value), "MMM dd")}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
