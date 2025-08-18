"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardProvider } from "@/components/dashboard-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import type { DateRange } from "@/types/air-quality"
import dynamic from 'next/dynamic'

// Lazy load heavy components to reduce initial bundle size
const TimelineChart = dynamic(() => import("@/components/timeline-chart").then(mod => ({ default: mod.TimelineChart })), {
  loading: () => <div className="h-96 bg-muted/20 rounded-lg animate-pulse" />,
  ssr: false, // Disable SSR for charts to reduce server load
})

const HistoricalDataTable = dynamic(() => import("@/components/historical-data-table").then(mod => ({ default: mod.HistoricalDataTable })), {
  loading: () => <div className="h-64 bg-muted/20 rounded-lg animate-pulse" />,
  ssr: false,
})

const SummaryCards = dynamic(() => import("@/components/summary-cards").then(mod => ({ default: mod.SummaryCards })), {
  loading: () => <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="h-32 bg-muted/20 rounded-lg animate-pulse" />
    ))}
  </div>,
  ssr: true, // Keep SSR for summary cards as they're important for SEO
})

// Default date range for initial load
const defaultDateRange: DateRange = {
  from: new Date(2004, 2, 1), // March 1, 2004
  to: new Date(2004, 4, 1), // May 1, 2004
}

export default function Dashboard() {
  return (
    <QueryProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <DashboardProvider defaultDateRange={defaultDateRange}>
          <DashboardHeader />
          
          <main className="container mx-auto px-6 py-8 max-w-7xl">
            <div className="space-y-8">

              {/* Summary Cards Section */}
              <section className="space-y-6">
                <SummaryCards />
              </section>

              {/* Timeline Chart Section */}
              <section className="space-y-6">
                <TimelineChart />
              </section> 

              {/* Table Section */}
              <section className="space-y-6">
                <HistoricalDataTable />
              </section>
            </div>
          </main>
        </DashboardProvider>
      </div>
    </QueryProvider>
  )
}
