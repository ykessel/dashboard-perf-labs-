import React from "react"
import { Activity } from "lucide-react"
import type { DateRange } from "@/types/air-quality"
import { DateRangePicker } from "./date-range-picker"

interface DashboardHeaderProps {
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
}

export const DashboardHeader = React.memo(function DashboardHeader({ dateRange, onDateRangeChange }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-6 py-6 max-w-7xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Air Quality Monitor</h1>
            </div>
            <p className="text-sm text-muted-foreground md:text-base">
              Real-time environmental data monitoring and analysis
            </p>
          </div>

          <DateRangePicker 
            dateRange={dateRange} 
            onDateRangeChange={onDateRangeChange} 
          />
        </div>
      </div>
    </header>
  )
})
