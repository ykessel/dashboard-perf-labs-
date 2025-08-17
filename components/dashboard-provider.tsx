"use client"

import { createContext, useContext, useState } from "react"
import type { DateRange } from "@/types/air-quality"

interface DashboardContextType {
  dateRange: DateRange
  setDateRange: (range: DateRange) => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({
  defaultDateRange,
  children,
}: {
  defaultDateRange: DateRange
  children: React.ReactNode
}) {
  const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange)

  return (
    <DashboardContext.Provider value={{ dateRange, setDateRange }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider")
  return ctx
}
