import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DateRange, INTERVALS, OPERATORS } from '@/types/air-quality'
import { airQualityAPI, queryKeys } from '@/lib/api-client'
import { format, parseISO } from 'date-fns'

// Helper function to format dates based on interval
const formatDateByInterval = (dateString: string, interval: INTERVALS) => {
  const date = parseISO(dateString)
  switch (interval) {
    case INTERVALS.DAILY:
      return format(date, "MMM dd, yyyy")
    case INTERVALS.MONTHLY:
      return format(date, "MMM yyyy")
    case INTERVALS.YEARLY:
      return format(date, "yyyy")
    default:
      return format(date, "MMM dd, yyyy")
  }
}

// Summary data hook
export function useSummaryData(dateRange: DateRange, operator: OPERATORS) {
  return useQuery({
    queryKey: queryKeys.summary(dateRange, operator),
    queryFn: () => airQualityAPI.getSummary(dateRange, operator),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// Timeline data hook
export function useTimelineData(
  parameter: string, 
  dateRange: DateRange, 
  interval: INTERVALS,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: queryKeys.timeline(parameter, dateRange, interval),
    queryFn: async () => {
      const rawData = await airQualityAPI.getTimeline(parameter, dateRange, interval)
      
      // Transform data to include formatted dates and value field
      return rawData.map((item) => ({
        date: item.interval,
        value: item[parameter] || 0,
        [parameter]: item[parameter] || 0,
        count: item.count,
        formattedDate: formatDateByInterval(item.interval, interval),
      }))
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// Multiple timeline data hook (for parameter switching)
export function useMultipleTimelineData(
  parameters: string[],
  dateRange: DateRange,
  interval: INTERVALS
) {
  const queries = parameters.map(parameter => 
    useTimelineData(parameter, dateRange, interval, false)
  )

  const isLoading = queries.some(query => query.isLoading)
  const isError = queries.some(query => query.isError)
  const error = queries.find(query => query.isError)?.error

  // Merge all data by date
  const mergedData = queries.reduce((acc, query) => {
    if (query.data) {
      query.data.forEach((item) => {
        const existingIndex = acc.findIndex(d => d.date === item.date)
        if (existingIndex >= 0) {
          acc[existingIndex] = { ...acc[existingIndex], ...item }
        } else {
          acc.push(item)
        }
      })
    }
    return acc
  }, [] as any[])

  return {
    data: mergedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    isLoading,
    isError,
    error,
    queries,
  }
}

// Range data hook (historical data table)
export function useRangeData(dateRange: DateRange) {
  return useQuery({
    queryKey: queryKeys.range(dateRange),
    queryFn: async () => {
      const apiData = await airQualityAPI.getRange(dateRange)
      
      // Transform API data to table format
      const transformedData = Array.isArray(apiData) 
        ? apiData.map((item, index) => ({
            date: item.Date,
            _id: item._id || `row-${index}`,
            ...item,
          }))
        : Object.entries(apiData).map(([date, values], index) => ({
            date,
            _id: `row-${index}`,
            ...(values as Record<string, number>),
          }))

      // Remove duplicates and sort by date
      return transformedData
        .filter((item, index, self) => 
          index === self.findIndex(t => t._id === item._id)
        )
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// Prefetch hook for better UX
export function usePrefetchTimelineData() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({
      parameter,
      dateRange,
      interval,
    }: {
      parameter: string
      dateRange: DateRange
      interval: INTERVALS
    }) => {
      await queryClient.prefetchQuery({
        queryKey: queryKeys.timeline(parameter, dateRange, interval),
        queryFn: () => airQualityAPI.getTimeline(parameter, dateRange, interval),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
      })
    },
  })
}

// Invalidate queries hook
export function useInvalidateQueries() {
  const queryClient = useQueryClient()
  
  return {
    invalidateSummary: () => queryClient.invalidateQueries({ queryKey: ['air-quality', 'summary'] }),
    invalidateTimeline: () => queryClient.invalidateQueries({ queryKey: ['air-quality', 'timeline'] }),
    invalidateRange: () => queryClient.invalidateQueries({ queryKey: ['air-quality', 'range'] }),
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: ['air-quality'] }),
  }
}
