"use client"

import React from "react"
import { ChevronUp, ChevronDown, ChevronsUpDown, Settings2, Search, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type {
  TableProps,
  TablePagination,
  TableHeaderProps,
  TableBodyProps,
  TablePaginationProps,
  TableSearchProps,
  TableColumnSelectorProps
} from "@/types/table"

// Table Header Component
function TableHeader<T>({ columns, sort, onSort, className }: TableHeaderProps<T>) {
  const getSortIcon = (columnKey: string) => {
    if (!sort || sort.column !== columnKey) {
      return <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
    }
    if (sort.direction === "asc") {
      return <ChevronUp className="h-4 w-4 text-primary" />
    }
    if (sort.direction === "desc") {
      return <ChevronDown className="h-4 w-4 text-primary" />
    }
    return <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
  }

  return (
    <thead className={cn("sticky top-0 bg-white dark:bg-gray-900 border-b z-10 shadow-sm", className)}>
      <tr>
        {columns.map((column) => (
          <th
            key={column.key}
            className={cn(
              "text-left p-4 font-medium text-sm bg-white dark:bg-gray-900",
              column.width && `w-${column.width}`,
              column.align === "center" && "text-center",
              column.align === "right" && "text-right"
            )}
          >
            {column.sortable !== false && onSort ? (
              <div
                className="flex items-center cursor-pointer font-medium text-foreground"
                onClick={() => onSort(column.key)}
              >
                {column.label}
                <span className="ml-2">{getSortIcon(column.key)}</span>
              </div>
            ) : (
              <span className="font-medium text-foreground">{column.label}</span>
            )}
          </th>
        ))}
      </tr>
    </thead>
  )
}

// Table Body Component
function TableBody<T>({ data, columns, loading, className, rowClassName, cellClassName, getRowId }: TableBodyProps<T>) {
  if (loading) {
    return (
      <tbody>
        <tr>
          <td colSpan={columns.length} className="p-8 text-center text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              Loading...
            </div>
          </td>
        </tr>
      </tbody>
    )
  }

  if (data.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={columns.length} className="p-8 text-center text-muted-foreground">
            No data available
          </td>
        </tr>
      </tbody>
    )
  }

  return (
    <tbody className={className}>
      {data.map((row, index) => {
        const rowId = getRowId ? getRowId(row, index) : `row-${index}`
        return (
          <tr
            key={rowId}
            className={cn(
              "border-b transition-colors",
              index % 2 === 0 ? "bg-gray-50 dark:bg-gray-800" : "bg-white dark:bg-gray-900",
              "hover:bg-primary/10",
              rowClassName
            )}
          >
            {columns.map((column) => (
              <td
                key={column.key}
                className={cn(
                  "p-4 text-sm",
                  column.align === "center" && "text-center",
                  column.align === "right" && "text-right",
                  cellClassName
                )}
              >
                {column.render ? (
                  column.render(row[column.key as keyof T], row, index)
                ) : column.formatter ? (
                  column.formatter(row[column.key as keyof T])
                ) : (
                  String(row[column.key as keyof T] || "")
                )}
              </td>
            ))}
          </tr>
        )
      })}
    </tbody>
  )
}

// Table Search Component
function TableSearch({ value, onChange, placeholder = "Search...", className }: TableSearchProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-8 w-full sm:w-64"
      />
    </div>
  )
}

// Table Column Selector Component
function TableColumnSelector<T>({ columns, visibleColumns, onColumnVisibilityChange, className }: TableColumnSelectorProps<T>) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Settings2 className="h-4 w-4 mr-2" />
          Columns
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 bg-background/95 backdrop-blur-sm" align="end">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Toggle columns</h4>
          {columns.map((column) => (
            <div key={column.key} className="flex items-center space-x-3 p-2 rounded-md">
              <Checkbox
                id={column.key}
                checked={visibleColumns.has(column.key)}
                onCheckedChange={() => onColumnVisibilityChange(column.key)}
                className="scale-110"
              />
              <label htmlFor={column.key} className="text-sm font-normal cursor-pointer text-foreground">
                {column.label}
              </label>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Table Pagination Component
function TablePagination({ pagination, onPageChange, onItemsPerPageChange, className }: TablePaginationProps) {
  return (
    <div className={cn("flex flex-col gap-4 p-4 sm:p-6 border-t bg-muted/20", className)}>
      {/* Mobile: Stack vertically */}
      <div className="flex flex-col gap-3 sm:hidden">
        {/* Page info */}
        <div className="flex items-center justify-center">
          <span className="text-sm text-muted-foreground text-center">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
        </div>
        
        {/* Navigation buttons - mobile optimized */}
        <div className="flex items-center justify-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onPageChange(1)} 
            disabled={pagination.currentPage === 1}
            className="px-3"
            aria-label="Go to first page"
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="px-3"
            aria-label="Go to previous page"
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-3"
            aria-label="Go to next page"
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.totalPages)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-3"
            aria-label="Go to last page"
          >
            Last
          </Button>
        </div>
        
        {/* Rows per page - mobile */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-muted-foreground">Rows:</span>
          <Select value={pagination.itemsPerPage.toString()} onValueChange={(value) => onItemsPerPageChange(Number(value))}>
            <SelectTrigger className="w-16" aria-label="Select number of rows per page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">({pagination.totalItems} total)</span>
        </div>
      </div>

      {/* Desktop: Original horizontal layout */}
      <div className="hidden sm:flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <Select value={pagination.itemsPerPage.toString()} onValueChange={(value) => onItemsPerPageChange(Number(value))}>
            <SelectTrigger className="w-20" aria-label="Select number of rows per page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} total)
          </span>
          <div className="flex gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onPageChange(1)} 
              disabled={pagination.currentPage === 1}
              aria-label="Go to first page"
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              aria-label="Go to previous page"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              aria-label="Go to next page"
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.totalPages)}
              disabled={pagination.currentPage === pagination.totalPages}
              aria-label="Go to last page"
            >
              Last
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main DataTable Component
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
  emptyMessage = "No data available",
  emptyIcon,
  loadingMessage = "Loading...",
  loadingIcon,
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
            {pagination && <span>({pagination.totalItems} entries)</span>}
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
