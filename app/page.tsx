import { DashboardHeader } from "@/components/dashboard-header"
import { TimelineChart } from "@/components/timeline-chart"
import { DashboardProvider } from "@/components/dashboard-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { HistoricalDataTable } from "@/components/historical-data-table"
import { SummaryCards } from "@/components/summary-cards"
import type { DateRange } from "@/types/air-quality"


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
