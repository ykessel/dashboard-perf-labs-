import { DateRange, INTERVALS, OPERATORS } from "@/types/air-quality"

// Base API configuration
const API_BASE_URL = "https://api-challenge.dofleini.com"
const API_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
  "Cookie": "AWSALB=JGHBe5fSSlnnPkz4uUaEBhMq+1SyTiiP1B5rHV6U6ATjUoMobkDtYGL6P6zz6wWqzC41i3yGM5X3g1ucGh0irNU4S56cXccnxHv+I9ryYZde8esRZlJlc45Ua+sN; AWSALBCORS=JGHBe5fSSlnnPkz4uUaEBhMq+1SyTiiP1B5rHV6U6ATjUoMobkDtYGL6P6zz6wWqzC41i3yGM5X3g1ucGh0irNU4S56cXccnxHv+I9ryYZde8esRZlJlc45Ua+sN; AWSALB=5K9ymwaiwA940cWqKcV72dwh3PQmR2Gelddb73m66dNxTj2txNCE/VwrxJbz6TDROU6cDwFdvoHrhrj9KpUjEV4EXsKLQ8vzo3MM3gT/rQPZXmndebsfpRJ/pfGc; AWSALBCORS=5K9ymwaiwA940cWqKcV72dwh3PQmR2Gelddb73m66dNxTj2txNCE/VwrxJbz6TDROU6cDwFdvoHrhrj9KpUjEV4EXsKLQ8vzo3MM3gT/rQPZXmndebsfpRJ/pfGc",
}

// Helper function to format date range
const formatDateRange = (dateRange: DateRange) => {
  return {
    from: dateRange.from.toISOString().split("T")[0],
    to: dateRange.to.toISOString().split("T")[0],
  }
}

// Generic fetch function with error handling
async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: API_HEADERS,
    ...options,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `API Error: ${response.status} - ${response.statusText}`)
  }

  return response.json()
}

// API endpoints
export const airQualityAPI = {
  // Summary data
  getSummary: async (dateRange: DateRange, operator: OPERATORS) => {
    const { from, to } = formatDateRange(dateRange)
    const url = `${API_BASE_URL}/air-quality/summary?from=${from}&to=${to}&operator=${operator}`
    return fetchAPI<Record<string, number>>(url)
  },

  // Timeline data for a specific parameter
  getTimeline: async (parameter: string, dateRange: DateRange, interval: INTERVALS) => {
    const { from, to } = formatDateRange(dateRange)
    const url = `${API_BASE_URL}/air-quality/timeline/${parameter}?from=${from}&to=${to}&interval=${interval}`
    return fetchAPI<Array<{ interval: string; [key: string]: any; count: number }>>(url)
  },

  // Range data (historical data table)
  getRange: async (dateRange: DateRange) => {
    const { from, to } = formatDateRange(dateRange)
    const url = `${API_BASE_URL}/air-quality/range?from=${from}&to=${to}`
    return fetchAPI<Array<{ Date: string; _id?: string; [key: string]: any }>>(url)
  },
}

// Query keys for React Query
export const queryKeys = {
  summary: (dateRange: DateRange, operator: OPERATORS) => 
    ['air-quality', 'summary', dateRange.from.toISOString(), dateRange.to.toISOString(), operator],
  
  timeline: (parameter: string, dateRange: DateRange, interval: INTERVALS) => 
    ['air-quality', 'timeline', parameter, dateRange.from.toISOString(), dateRange.to.toISOString(), interval],
  
  range: (dateRange: DateRange) => 
    ['air-quality', 'range', dateRange.from.toISOString(), dateRange.to.toISOString()],
}
