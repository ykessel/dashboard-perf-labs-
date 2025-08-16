import { useState, useMemo, useCallback } from "react"
import type { TableSort, TablePagination } from "@/types/table"

export interface UseDataTableOptions<T = any> {
  data: T[]
  initialSort?: TableSort
  initialPage?: number
  initialItemsPerPage?: number
  searchable?: boolean
  sortable?: boolean
  pagination?: boolean
  getRowId?: (row: T, index: number) => string
}

export interface UseDataTableReturn<T = any> {
  // Data
  processedData: T[]
  paginatedData: T[]
  
  // Sorting
  sort: TableSort | undefined
  handleSort: (column: string) => void
  
  // Pagination
  pagination: TablePagination
  handlePageChange: (page: number) => void
  handleItemsPerPageChange: (itemsPerPage: number) => void
  
  // Search
  searchTerm: string
  handleSearchChange: (term: string) => void
  
  // Column visibility
  visibleColumns: Set<string>
  handleColumnVisibilityChange: (column: string) => void
  setVisibleColumns: (columns: Set<string>) => void
  
  // Utilities
  getRowId: (row: T, index: number) => string
}

export function useDataTable<T extends Record<string, any>>({
  data,
  initialSort,
  initialPage = 1,
  initialItemsPerPage = 10,
  searchable = true,
  sortable = true,
  pagination = true,
  getRowId: customGetRowId
}: UseDataTableOptions<T>): UseDataTableReturn<T> {
  // State
  const [sort, setSort] = useState<TableSort | undefined>(initialSort)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage)
  const [searchTerm, setSearchTerm] = useState("")
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set())

  // Default row ID function
  const defaultGetRowId = useCallback((row: T, index: number) => {
    return (row as any)._id || `row-${index}`
  }, [])

  const getRowId = customGetRowId || defaultGetRowId

  // Process data (search and sort)
  const processedData = useMemo(() => {
    let filtered = data

    // Apply search filter
    if (searchable && searchTerm) {
      filtered = filtered.filter((row) =>
        Object.values(row as Record<string, any>).some((value) => 
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Apply sorting
    if (sortable && sort?.column && sort.direction) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sort.column as keyof T]
        const bVal = b[sort.column as keyof T]

        // Handle different data types
        if (aVal && bVal && typeof aVal === 'object' && typeof bVal === 'object' && 
            'getTime' in aVal && 'getTime' in bVal) {
          const aDate = aVal as any
          const bDate = bVal as any
          return sort.direction === "asc" 
            ? aDate.getTime() - bDate.getTime() 
            : bDate.getTime() - aDate.getTime()
        }

        if (typeof aVal === "string" && typeof bVal === "string") {
          return sort.direction === "asc" 
            ? aVal.localeCompare(bVal) 
            : bVal.localeCompare(aVal)
        }

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sort.direction === "asc" ? aVal - bVal : bVal - aVal
        }

        // Convert to string for comparison
        const aStr = String(aVal || "")
        const bStr = String(bVal || "")
        return sort.direction === "asc" 
          ? aStr.localeCompare(bStr) 
          : bStr.localeCompare(aStr)
      })
    }

    return filtered
  }, [data, searchTerm, sort, searchable, sortable])

  // Pagination
  const totalItems = processedData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  const paginatedData = useMemo(() => {
    if (!pagination) return processedData
    return processedData.slice(startIndex, endIndex)
  }, [processedData, startIndex, endIndex, pagination])

  // Handlers
  const handleSort = useCallback((column: string) => {
    if (!sortable) return

    setSort((currentSort) => {
      if (!currentSort || currentSort.column !== column) {
        return { column, direction: "asc" }
      }

      if (currentSort.direction === "asc") {
        return { column, direction: "desc" }
      }

      if (currentSort.direction === "desc") {
        return undefined
      }

      return { column, direction: "asc" }
    })

    // Reset to first page when sorting
    setCurrentPage(1)
  }, [sortable])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }, [totalPages])

  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset to first page
  }, [])

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term)
    setCurrentPage(1) // Reset to first page when searching
  }, [])

  const handleColumnVisibilityChange = useCallback((column: string) => {
    setVisibleColumns((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(column)) {
        newSet.delete(column)
      } else {
        newSet.add(column)
      }
      return newSet
    })
  }, [])

  // Pagination object
  const paginationObject: TablePagination = {
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages
  }

  return {
    processedData,
    paginatedData,
    sort,
    handleSort,
    pagination: paginationObject,
    handlePageChange,
    handleItemsPerPageChange,
    searchTerm,
    handleSearchChange,
    visibleColumns,
    handleColumnVisibilityChange,
    setVisibleColumns,
    getRowId
  }
}
