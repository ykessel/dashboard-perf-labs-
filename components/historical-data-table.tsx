"use client"

import React, { useState, useEffect } from "react"
import { DataTable } from "@/components/ui/data-table"
import { useDataTable } from "@/hooks/use-data-table"
import { VALUES_KEY_LABELS, type DateRange } from "@/types/air-quality"
import { format, parseISO } from "date-fns"
import { BarChart3 } from "lucide-react"
import type { TableColumn } from "@/types/table"

interface HistoricalDataTableProps {
  dateRange: DateRange
}

interface TableRow {
  date: string
  _id: string
  [key: string]: string | number
}

export const HistoricalDataTable = React.memo(function HistoricalDataTable({ dateRange }: HistoricalDataTableProps) {
  const [data, setData] = useState<TableRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Define columns configuration
  const columns: TableColumn<TableRow>[] = [
    {
      key: "date",
      label: "Date",
      sortable: true,
      formatter: (value) => {
        try {
          const dateValue = typeof value === "string" ? value : value.toString()
          return format(parseISO(dateValue), "MMM dd, yyyy")
        } catch (error) {
          console.error("Error parsing date:", value, error)
          return value.toString()
        }
      }
    },
    {
      key: "CO",
      label: VALUES_KEY_LABELS.CO?.label || "CO",
      sortable: true,
      formatter: (value) => typeof value === "number" ? value.toFixed(2) : String(value)
    },
    {
      key: "NO2",
      label: VALUES_KEY_LABELS.NO2?.label || "NO2",
      sortable: true,
      formatter: (value) => typeof value === "number" ? value.toFixed(2) : String(value)
    },
    {
      key: "T",
      label: VALUES_KEY_LABELS.T?.label || "T",
      sortable: true,
      formatter: (value) => typeof value === "number" ? value.toFixed(2) : String(value)
    },
    {
      key: "RH",
      label: VALUES_KEY_LABELS.RH?.label || "RH",
      sortable: true,
      formatter: (value) => typeof value === "number" ? value.toFixed(2) : String(value)
    },
    {
      key: "PT08S1",
      label: VALUES_KEY_LABELS.PT08S1?.label || "PT08S1",
      sortable: true,
      formatter: (value) => typeof value === "number" ? value.toFixed(2) : String(value)
    },
    {
      key: "NMHC",
      label: VALUES_KEY_LABELS.NMHC?.label || "NMHC",
      sortable: true,
      formatter: (value) => typeof value === "number" ? value.toFixed(2) : String(value)
    },
    {
      key: "C6H6",
      label: VALUES_KEY_LABELS.C6H6?.label || "C6H6",
      sortable: true,
      formatter: (value) => typeof value === "number" ? value.toFixed(2) : String(value)
    },
    {
      key: "PT08S2",
      label: VALUES_KEY_LABELS.PT08S2?.label || "PT08S2",
      sortable: true,
      formatter: (value) => typeof value === "number" ? value.toFixed(2) : String(value)
    },
    {
      key: "NOx",
      label: VALUES_KEY_LABELS.NOx?.label || "NOx",
      sortable: true,
      formatter: (value) => typeof value === "number" ? value.toFixed(2) : String(value)
    },
    {
      key: "PT08S3",
      label: VALUES_KEY_LABELS.PT08S3?.label || "PT08S3",
      sortable: true,
      formatter: (value) => typeof value === "number" ? value.toFixed(2) : String(value)
    },
    {
      key: "PT08S4",
      label: VALUES_KEY_LABELS.PT08S4?.label || "PT08S4",
      sortable: true,
      formatter: (value) => typeof value === "number" ? value.toFixed(2) : String(value)
    },
    {
      key: "PT08S5",
      label: VALUES_KEY_LABELS.PT08S5?.label || "PT08S5",
      sortable: true,
      formatter: (value) => typeof value === "number" ? value.toFixed(2) : String(value)
    },
    {
      key: "AH",
      label: VALUES_KEY_LABELS.AH?.label || "AH",
      sortable: true,
      formatter: (value) => typeof value === "number" ? value.toFixed(2) : String(value)
    }
  ]

  // Use the data table hook
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
    setVisibleColumns
  } = useDataTable({
    data,
    initialItemsPerPage: 10,
    searchable: true,
    sortable: true,
    pagination: true,
    getRowId: (row) => row._id
  })

  // Initialize visible columns
  useEffect(() => {
    setVisibleColumns(new Set(["date", "CO", "NO2", "T", "RH", "PT08S1", "NMHC"]))
  }, [setVisibleColumns])

  const fetchHistoricalData = async () => {
    try {
      setLoading(true)
      setError(null)

      const fromDate = dateRange.from.toISOString().split("T")[0]
      const toDate = dateRange.to.toISOString().split("T")[0]

      const response = await fetch(`/api/air-quality/range?from=${fromDate}&to=${toDate}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `API Error: ${response.status} - ${response.statusText}`)
      }

      const apiData = await response.json()

      // Transform API data to table format
      const transformedData: TableRow[] = Array.isArray(apiData) 
        ? apiData.map((item, index) => ({
            date: item.Date, // Use the correct field name from API
            _id: item._id || `row-${index}`, // Ensure unique ID
            ...item,
          }))
        : Object.entries(apiData).map(([date, values], index) => ({
            date,
            _id: `row-${index}`, // Generate unique ID for object format
            ...(values as Record<string, number>),
          }))

      // Remove duplicates based on _id and sort by date
      const uniqueData = transformedData.filter((item, index, self) => 
        index === self.findIndex(t => t._id === item._id)
      )
      setData(uniqueData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    } catch (err) {
      console.error("Error fetching historical data:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch historical data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistoricalData()
  }, [dateRange])

  return (
    <DataTable
      data={paginatedData}
      columns={columns}
      loading={loading}
      error={error}
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
      title="Historical Data"
      titleIcon={
        <div className="p-1.5 rounded-md bg-primary/10">
          <BarChart3 className="h-4 w-4 text-primary" />
        </div>
      }
    />
  )
})
