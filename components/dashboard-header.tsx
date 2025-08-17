"use client"

import React from "react"
import { Activity } from "lucide-react"
import { DateRangePicker } from "./date-range-picker"
import { useDashboard } from "./dashboard-provider"

export const DashboardHeader = React.memo(function DashboardHeader() {
  const { dateRange, setDateRange } = useDashboard()
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-6 py-4 max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">Air Quality Monitor</h1>
            </div>
            <p className="text-xs text-muted-foreground md:text-sm">
              Real-time environmental data monitoring and analysis
            </p>
          </div>

          <DateRangePicker 
            dateRange={dateRange} 
            onDateRangeChange={setDateRange} 
          />
        </div>
      </div>
    </header>
  )
})
