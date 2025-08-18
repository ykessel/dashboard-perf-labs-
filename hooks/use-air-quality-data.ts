import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import type { DateRange } from '@/types/air-quality'

interface AirQualityData {
  timestamp: string
  pm25: number
  pm10: number
  co: number
  no2: number
  so2: number
  o3: number
}

interface UseAirQualityDataOptions {
  dateRange: DateRange
  enabled?: boolean
}

// Memoized fetch function to prevent unnecessary re-renders
const fetchAirQualityData = async (dateRange: DateRange): Promise<AirQualityData[]> => {
  const params = new URLSearchParams({
    from: dateRange.from.toISOString(),
    to: dateRange.to.toISOString(),
  })
  
  const response = await fetch(`/api/air-quality?${params}`, {
    headers: {
      'Cache-Control': 'max-age=300', // 5 minutes cache
    },
  })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch air quality data: ${response.statusText}`)
  }
  
  return response.json()
}

export function useAirQualityData({ dateRange, enabled = true }: UseAirQualityDataOptions) {
  // Memoize the query key to prevent unnecessary re-fetches
  const queryKey = useMemo(() => ['air-quality', dateRange.from.toISOString(), dateRange.to.toISOString()], [dateRange])
  
  return useQuery({
    queryKey,
    queryFn: () => fetchAirQualityData(dateRange),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// Optimized hook for summary statistics
export function useAirQualitySummary(dateRange: DateRange) {
  const { data, isLoading, error } = useAirQualityData({ dateRange })
  
  const summary = useMemo(() => {
    if (!data || data.length === 0) return null
    
    const values = {
      pm25: data.map(d => d.pm25).filter(v => v !== null && !isNaN(v)),
      pm10: data.map(d => d.pm10).filter(v => v !== null && !isNaN(v)),
      co: data.map(d => d.co).filter(v => v !== null && !isNaN(v)),
      no2: data.map(d => d.no2).filter(v => v !== null && !isNaN(v)),
      so2: data.map(d => d.so2).filter(v => v !== null && !isNaN(v)),
      o3: data.map(d => d.o3).filter(v => v !== null && !isNaN(v)),
    }
    
    return {
      pm25: {
        avg: values.pm25.length > 0 ? values.pm25.reduce((a, b) => a + b, 0) / values.pm25.length : 0,
        max: values.pm25.length > 0 ? Math.max(...values.pm25) : 0,
        min: values.pm25.length > 0 ? Math.min(...values.pm25) : 0,
      },
      pm10: {
        avg: values.pm10.length > 0 ? values.pm10.reduce((a, b) => a + b, 0) / values.pm10.length : 0,
        max: values.pm10.length > 0 ? Math.max(...values.pm10) : 0,
        min: values.pm10.length > 0 ? Math.min(...values.pm10) : 0,
      },
      co: {
        avg: values.co.length > 0 ? values.co.reduce((a, b) => a + b, 0) / values.co.length : 0,
        max: values.co.length > 0 ? Math.max(...values.co) : 0,
        min: values.co.length > 0 ? Math.min(...values.co) : 0,
      },
      no2: {
        avg: values.no2.length > 0 ? values.no2.reduce((a, b) => a + b, 0) / values.no2.length : 0,
        max: values.no2.length > 0 ? Math.max(...values.no2) : 0,
        min: values.no2.length > 0 ? Math.min(...values.no2) : 0,
      },
      so2: {
        avg: values.so2.length > 0 ? values.so2.reduce((a, b) => a + b, 0) / values.so2.length : 0,
        max: values.so2.length > 0 ? Math.max(...values.so2) : 0,
        min: values.so2.length > 0 ? Math.min(...values.so2) : 0,
      },
      o3: {
        avg: values.o3.length > 0 ? values.o3.reduce((a, b) => a + b, 0) / values.o3.length : 0,
        max: values.o3.length > 0 ? Math.max(...values.o3) : 0,
        min: values.o3.length > 0 ? Math.min(...values.o3) : 0,
      },
    }
  }, [data])
  
  return { summary, isLoading, error }
}
