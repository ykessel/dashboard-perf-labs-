"use client"

import { Suspense, useState, lazy } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import dynamic from "next/dynamic"

// Dynamic imports to reduce initial bundle size
const SummaryCards = dynamic(() => import("@/components/summary-cards").then(mod => ({ default: mod.SummaryCards })), {
  loading: () => <div className="h-64 animate-pulse bg-muted rounded-lg" />,
  ssr: false,
})

const TimelineChart = dynamic(() => import("@/components/timeline-chart").then(mod => ({ default: mod.TimelineChart })), {
  loading: () => <div className="h-96 animate-pulse bg-muted rounded-lg" />,
  ssr: false,
})

const HistoricalDataTable = dynamic(() => import("@/components/historical-data-table").then(mod => ({ default: mod.HistoricalDataTable })), {
  loading: () => <div className="h-96 animate-pulse bg-muted rounded-lg" />,
  ssr: false,
})

import type { DateRange } from "@/types/air-quality"

// Default date range for initial load
const defaultDateRange: DateRange = {
  from: new Date(2004, 2, 1), // March 1, 2004
  to: new Date(2004, 4, 1), // May 1, 2004
}

// Client component for the dashboard
export default function Dashboard() {
  const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <DashboardHeader dateRange={dateRange} onDateRangeChange={setDateRange} />

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="space-y-8">
          {/* Summary Cards Section */}
          <section className="space-y-6">
            <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-lg" />}>
              <SummaryCards dateRange={dateRange} />
            </Suspense>
          </section>

          {/* Chart Section */}
          <section className="space-y-6">
            <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
              <TimelineChart dateRange={dateRange} />
            </Suspense>
          </section>

          {/* Table Section */}
          <section className="space-y-6">
            <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
              <HistoricalDataTable dateRange={dateRange} />
            </Suspense>
          </section>
        </div>
      </main>
    </div>
  )
}
