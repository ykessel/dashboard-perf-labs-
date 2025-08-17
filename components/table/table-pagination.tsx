"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { TablePaginationProps } from "@/types/table"

export function TablePagination({ pagination, onPageChange, onItemsPerPageChange, className }: TablePaginationProps) {
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
