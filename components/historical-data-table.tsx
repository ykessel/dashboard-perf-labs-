"use client"

import React, { useMemo } from "react"
import { DataTable } from "@/components/ui/data-table"
import { useDataTable } from "@/hooks/use-data-table"
import { VALUES_KEY_LABELS } from "@/types/air-quality"
import { useDashboard } from "@/components/dashboard-provider"
import { useRangeData } from "@/hooks/use-air-quality-queries"
import type { TableColumn } from "@/types/table"
import { LoadingState } from "@/components/ui/loading-spinner"

interface TableRow {
  date: string
  _id: string
  [key: string]: string | number
}

export const HistoricalDataTable = React.memo(function HistoricalDataTable() {
  const { dateRange } = useDashboard()
  
  // React Query hook for range data
  const { data, isLoading, error } = useRangeData(dateRange)

  // Data table configuration
  const {
    paginatedData,
    sort,
    handleSort,
    pagination,
    handlePageChange,
    handleItemsPerPageChange,
    searchTerm,
    handleSearchChange,
    visibleColumns,
    handleColumnVisibilityChange,
    setVisibleColumns,
  } = useDataTable({
    data: data || [],
    initialSort: { column: "date", direction: "desc" },
    initialPage: 1,
    initialItemsPerPage: 10,
    searchable: true,
    sortable: true,
    pagination: true,
  })

  // Generate columns dynamically based on available data
  const tableColumns = useMemo(() => {
    if (!data || data.length === 0) return []

    const baseColumns: TableColumn<TableRow>[] = [
      {
        key: "date",
        label: "Date",
        sortable: true,
        render: (value) => {
          try {
            const date = new Date(value as string)
            return date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          } catch {
            return value as string
          }
        },
      },
    ]

    // Add parameter columns dynamically
    const parameterColumns: TableColumn<TableRow>[] = Object.entries(VALUES_KEY_LABELS).map(([key, { label }]) => ({
      key,
      label,
      sortable: true,
      render: (value) => {
        if (typeof value === "number") {
          return value.toFixed(2)
        }
        return value as string
      },
    }))

    return [...baseColumns, ...parameterColumns]
  }, [data])

  // Initialize visible columns
  React.useEffect(() => {
    setVisibleColumns(new Set(["date", "CO", "NO2", "T", "RH", "PT08S1", "NMHC"]))
  }, [setVisibleColumns])

  return (
    <div className="space-y-6">
      {/* Header - Always present */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground">Historical Data</h2>
          <p className="text-sm text-muted-foreground">
            Detailed air quality measurements over time
          </p>
        </div>
      </div>

      {/* Content area with consistent height */}
      <div className="min-h-[600px] h-[600px]">
        {error ? (
          <div className="flex h-full items-center justify-center text-destructive">
            <div className="text-center">
              <p className="font-medium">Error loading data</p>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : String(error)}
              </p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex h-full items-center justify-center">
            <LoadingState message="Loading historical data..." />
          </div>
        ) : (
          <div className="h-full">
            <DataTable
              data={paginatedData}
              columns={tableColumns}
              loading={isLoading}
              error={error ? String(error) : null}
              sort={sort}
              onSort={handleSort}
              pagination={pagination}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              searchPlaceholder="Search data..."
              visibleColumns={visibleColumns}
              onColumnVisibilityChange={handleColumnVisibilityChange}
              showColumnSelector={true}
            />
          </div>
        )}
      </div>
    </div>
  )
})
