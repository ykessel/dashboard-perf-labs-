"use client"

import React, { useState, useMemo } from "react"
import { DataTable } from "@/components/ui/data-table"
import { useDataTable } from "@/hooks/use-data-table"
import { VALUES_KEY_LABELS } from "@/types/air-quality"
import { useDashboard } from "@/components/dashboard-provider"
import { useRangeData } from "@/hooks/use-air-quality-queries"
import { BarChart3 } from "lucide-react"
import type { TableColumn } from "@/types/table"

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

  if (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-foreground">Historical Data</h2>
            <p className="text-sm text-muted-foreground">
              Detailed air quality measurements over time
            </p>
          </div>
        </div>
        <div className="flex h-[400px] items-center justify-center text-destructive">
          Error: {errorMessage}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground">Historical Data</h2>
          <p className="text-sm text-muted-foreground">
            Detailed air quality measurements over time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm text-muted-foreground">
            {pagination.totalItems} records
          </span>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={paginatedData}
        columns={tableColumns}
        loading={isLoading}
        error={error?.message || null}
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
  )
})
