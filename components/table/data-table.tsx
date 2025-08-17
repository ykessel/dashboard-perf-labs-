"use client"

import React from "react"
import { AlertCircle, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import type { TableProps } from "@/types/table"
import { TableHeader } from "./table-header"
import { TableBody } from "./table-body"
import { TableSearch } from "./table-search"
import { TableColumnSelector } from "./table-column-selector"
import { TablePagination } from "./table-pagination"

export function DataTable<T = any>({
  data,
  columns,
  loading = false,
  error = null,
  sort,
  onSort,
  pagination,
  onPageChange,
  onItemsPerPageChange,
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  visibleColumns,
  onColumnVisibilityChange,
  showColumnSelector = false,
  className,
  tableClassName,
  headerClassName,
  rowClassName,
  cellClassName,
  title,
  titleIcon
}: TableProps<T> & { title?: string; titleIcon?: React.ReactNode }) {
  // Filter columns based on visibility
  const displayColumns = visibleColumns 
    ? columns.filter(col => visibleColumns.has(col.key))
    : columns

  if (error) {
    return (
      <div className={cn("space-y-4", className)}>
        {title && (
          <div className="flex items-center gap-2">
            {titleIcon}
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          </div>
        )}
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with search and column selector */}
      {(onSearchChange || showColumnSelector) && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {title && (
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            </div>
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
            {onSearchChange && (
              <TableSearch
                value={searchTerm || ""}
                onChange={onSearchChange}
                placeholder={searchPlaceholder}
              />
            )}
            {showColumnSelector && onColumnVisibilityChange && visibleColumns && (
              <TableColumnSelector
                columns={columns}
                visibleColumns={visibleColumns}
                onColumnVisibilityChange={onColumnVisibilityChange}
              />
            )}
          </div>
        </div>
      )}

      {/* Table Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            {titleIcon}
            {title && <span>{title}</span>}
            {pagination && (
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <BarChart3 className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">
                  {pagination.totalItems} records
                </span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto border rounded-md">
            <div className="min-w-full">
              <table className={cn("w-full data-table", tableClassName)}>
                <TableHeader
                  columns={displayColumns}
                  sort={sort}
                  onSort={onSort}
                  className={headerClassName}
                />
                <TableBody
                  data={data}
                  columns={displayColumns}
                  loading={loading}
                  rowClassName={rowClassName}
                  cellClassName={cellClassName}
                  getRowId={(row, index) => (row as any)._id || `row-${index}`}
                />
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination && onPageChange && onItemsPerPageChange && (
            <TablePagination
              pagination={pagination}
              onPageChange={onPageChange}
              onItemsPerPageChange={onItemsPerPageChange}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Export sub-components for advanced usage
export { TableHeader, TableBody, TableSearch, TableColumnSelector, TablePagination }
