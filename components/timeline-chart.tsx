"use client"
import { useState, useCallback } from "react"
import { VALUES_KEY_LABELS, INTERVALS } from "@/types/air-quality"
import TimelineChartClient from "@/components/timeline-chart-client"
import { useDashboard } from "./dashboard-provider"
import { useTimelineData, usePrefetchTimelineData } from "@/hooks/use-air-quality-queries"
import { LoadingState } from "@/components/ui/loading-spinner"

export function TimelineChart() {
  const { dateRange } = useDashboard()
  const [selectedInterval, setSelectedInterval] = useState<INTERVALS>(INTERVALS.MONTHLY)
  const [selectedParameter, setSelectedParameter] = useState<string>("CO")

  // React Query hook for timeline data
  const {
    data,
    isLoading: loading,
    error,
  } = useTimelineData(selectedParameter, dateRange, selectedInterval)

  // Prefetch hook for better UX when switching parameters
  const prefetchMutation = usePrefetchTimelineData()

  // Handle parameter change with prefetching
  const handleParameterChange = useCallback((parameter: string) => {
    setSelectedParameter(parameter)
    
    // Prefetch data for the new parameter
    prefetchMutation.mutate({
      parameter,
      dateRange,
      interval: selectedInterval,
    })
  }, [dateRange, selectedInterval, prefetchMutation])

  return (
    <div className="space-y-6">
      {/* Header - Always present */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground">Timeline Analysis</h2>
          <p className="text-sm text-muted-foreground">
            Visualize parameter trends over time
          </p>
        </div>
      </div>

      {/* Content area with consistent height */}
      <div className="min-h-[500px]">
        {error ? (
          <div className="flex h-[400px] items-center justify-center text-destructive">
            <div className="text-center">
              <p className="font-medium">Error loading timeline data</p>
              <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex h-[400px] items-center justify-center">
            <LoadingState message="Loading timeline data..." />
          </div>
        ) : (
          <TimelineChartClient
            initialData={data || []}
            availableParameters={VALUES_KEY_LABELS}
            selectedInterval={selectedInterval}
            selectedParameter={selectedParameter}
            onIntervalChange={setSelectedInterval}
            onParameterChange={handleParameterChange}
            loadedParameters={new Set([selectedParameter])}
          />
        )}
      </div>
    </div>
  )
}